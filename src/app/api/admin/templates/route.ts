import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import AdmZip from 'adm-zip';
import { scanVariables } from '@/lib/configScanner';

const ADMIN_PASSWORD = 'stephadmin123@';

function checkAuth(request: Request) {
    return request.headers.get('x-admin-password') === ADMIN_PASSWORD;
}

export async function GET(request: Request) {
    if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // 1. DB Templates
    const dbTemplates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
    
    // 2. FS Templates (Legacy)
    const templatesDir = path.join(process.cwd(), 'templates');
    const fsTemplates: any[] = [];

    if (await fs.pathExists(templatesDir)) {
        const items = await fs.readdir(templatesDir, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory()) {
                const folderName = item.name;
                // Check if already in DB
                if (!dbTemplates.find(t => t.folderName === folderName)) {
                    // Scan vars
                    const vars = await scanVariables(path.join(templatesDir, folderName));
                    fsTemplates.push({
                        id: `legacy_${folderName}`, // Temporary ID
                        name: folderName.replace(/-/g, ' ').toUpperCase(),
                        description: 'Template local détecté (Non géré en BDD)',
                        folderName: folderName,
                        sourceType: 'LOCAL',
                        envVars: JSON.stringify(vars),
                        isPublic: true,
                        isLegacy: true // Flag for UI
                    });
                }
            }
        }
    }

    return NextResponse.json([...dbTemplates, ...fsTemplates]);
}

export async function PUT(request: Request) {
    if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { id, name, description, envVars, folderName, isLegacy, sessionIdUrl, startCommand, envFileName } = body;

        if (isLegacy && folderName) {
            // "Adopt" legacy template into DB
            const newTemplate = await prisma.template.create({
                data: {
                    name,
                    description,
                    folderName, // Must match existing folder
                    sourceType: 'LOCAL',
                    sessionIdUrl,
                    envVars: typeof envVars === 'object' ? JSON.stringify(envVars) : envVars,
                    startCommand: startCommand || "node index.js",
                    envFileName: envFileName || ".env",
                    isPublic: true
                }
            });
            return NextResponse.json({ success: true, template: newTemplate });
        } else {
            // Update existing
            if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
            
            const updated = await prisma.template.update({
                where: { id },
                data: {
                    name,
                    description,
                    sessionIdUrl,
                    envVars: typeof envVars === 'object' ? JSON.stringify(envVars) : envVars,
                    startCommand,
                    envFileName
                }
            });
            return NextResponse.json({ success: true, template: updated });
        }

    } catch (error: any) {
        console.error('Update Template Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const contentType = request.headers.get('content-type') || '';
        let name, description, sourceType, repoUrl, zipFileBuffer, startCommand, envFileName;

        if (contentType.includes('application/json')) {
            const body = await request.json();
            name = body.name;
            description = body.description;
            sourceType = body.sourceType; // 'GIT'
            repoUrl = body.repoUrl;
            startCommand = body.startCommand;
            envFileName = body.envFileName;
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            name = formData.get('name') as string;
            description = formData.get('description') as string;
            sourceType = formData.get('sourceType') as string; // 'ZIP'
            startCommand = formData.get('startCommand') as string;
            envFileName = formData.get('envFileName') as string;
            const file = formData.get('zipFile') as File;
            if (file) zipFileBuffer = Buffer.from(await file.arrayBuffer());
        }

        if (!name || !sourceType) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Generate folder name
        const folderName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const templatePath = path.join(process.cwd(), 'templates', folderName);

        if (await fs.pathExists(templatePath)) {
            return NextResponse.json({ error: `Template folder '${folderName}' already exists.` }, { status: 400 });
        }

        // Install Template
        await fs.ensureDir(templatePath);

        if (sourceType === 'GIT') {
            if (!repoUrl) return NextResponse.json({ error: 'Missing Repo URL' }, { status: 400 });
            
            // Clone
            await new Promise((resolve, reject) => {
                const git = spawn('git', ['clone', repoUrl, '.'], { cwd: templatePath });
                git.on('close', (code) => code === 0 ? resolve(true) : reject(new Error('Git clone failed')));
            });

            // Remove .git
            await fs.remove(path.join(templatePath, '.git'));

        } else if (sourceType === 'ZIP') {
            if (!zipFileBuffer) return NextResponse.json({ error: 'Missing ZIP file' }, { status: 400 });
            
            // Save temp zip
            const tempZipPath = path.join(templatePath, 'temp.zip');
            await fs.writeFile(tempZipPath, zipFileBuffer);
            
            // Extract
            const zip = new AdmZip(tempZipPath);
            zip.extractAllTo(templatePath, true);
            await fs.remove(tempZipPath);

            // Handle nested folder
            const files = await fs.readdir(templatePath);
            const actualFiles = files.filter(f => !['__MACOSX', '.DS_Store'].includes(f));
            if (actualFiles.length === 1) {
                const nestedPath = path.join(templatePath, actualFiles[0]);
                if ((await fs.stat(nestedPath)).isDirectory()) {
                    const nestedFiles = await fs.readdir(nestedPath);
                    for (const f of nestedFiles) {
                        await fs.move(path.join(nestedPath, f), path.join(templatePath, f), { overwrite: true });
                    }
                    await fs.remove(nestedPath);
                }
            }
        }

        // Scan Variables
        const detectedVars = await scanVariables(templatePath);
        
        // Detect Start Command (if not provided)
        let finalStartCommand = startCommand;

        if (!finalStartCommand) {
            try {
                const pkgPath = path.join(templatePath, 'package.json');
                if (await fs.pathExists(pkgPath)) {
                    const pkg = await fs.readJson(pkgPath);
                    if (pkg.scripts && pkg.scripts.start) {
                        finalStartCommand = pkg.scripts.start;
                    }
                }
            } catch (e) { console.error('Error reading package.json:', e); }
        }

        // Save to DB
        const template = await prisma.template.create({
            data: {
                name,
                description,
                folderName,
                sourceType,
                repoUrl: sourceType === 'GIT' ? repoUrl : null,
                envVars: JSON.stringify(detectedVars),
                startCommand: finalStartCommand || "node index.js",
                envFileName: envFileName || ".env",
                isPublic: true
            }
        });

        // Background Install Dependencies
        // We don't await this to prevent timeout ("Network Error")
        try {
            const logFile = path.join(templatePath, 'install.log');
            const flagFile = path.join(templatePath, 'is_installing');
            await fs.writeFile(flagFile, 'true'); // Create lock file

            const logFd = await fs.open(logFile, 'a');
            
            // Run npm install (install ALL deps including dev), then delete lock file regardless of success/fail
            // We use ; instead of && so the flag is deleted even if install fails
            const installCmd = `npm install && rm "${flagFile}" || rm "${flagFile}"`; 
            
            const npm = spawn(installCmd, [], { 
                cwd: templatePath,
                shell: true,
                detached: true,
                stdio: ['ignore', logFd, logFd]
            });
            
            npm.unref();
        } catch (e) {
            console.error('Background NPM Install Start Error:', e);
        }

        return NextResponse.json({ success: true, template, message: 'Template ajouté. Installation des dépendances en arrière-plan...' });

    } catch (error: any) {
        console.error('Create Template Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const template = await prisma.template.findUnique({ where: { id } });
        if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

        // Delete from DB
        await prisma.template.delete({ where: { id } });

        // Delete from FS
        const templatePath = path.join(process.cwd(), 'templates', template.folderName);
        if (await fs.pathExists(templatePath)) {
            await fs.remove(templatePath);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
