import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { scanVariables } from '@/lib/configScanner';

export async function GET() {
  try {
    // 1. Fetch from DB
    const dbTemplates = await prisma.template.findMany({
        where: { isPublic: true }
    });

    // 2. Fetch from FS
    const templatesDir = path.join(process.cwd(), 'templates');
    let fsTemplates: string[] = [];
    
    if (await fs.pathExists(templatesDir)) {
        const items = await fs.readdir(templatesDir, { withFileTypes: true });
        fsTemplates = items
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
    }

    // 3. Merge
    // Start with DB templates
    const templates = dbTemplates.map(t => ({
        id: t.folderName, // Use folderName as ID for consistency with legacy
        name: t.name,
        description: t.description,
        sessionIdUrl: t.sessionIdUrl,
        isCustom: false,
        source: 'DB',
        config: JSON.parse(t.envVars || '{}')
    }));

    // Add FS templates that are NOT in DB
    for (const folder of fsTemplates) {
        if (!dbTemplates.find(t => t.folderName === folder)) {
            // Scan FS template on the fly
            const folderPath = path.join(templatesDir, folder);
            const scannedConfig = await scanVariables(folderPath);

            // Check for metadata file (sen-host.json)
            let metadata: any = {};
            try {
                const metadataPath = path.join(folderPath, 'sen-host.json');
                if (await fs.pathExists(metadataPath)) {
                    metadata = await fs.readJson(metadataPath);
                }
            } catch (e) { /* ignore */ }

            templates.push({
                id: folder,
                name: metadata.name || folder.replace(/-/g, ' ').toUpperCase(),
                description: metadata.description || 'Built-in Template',
                sessionIdUrl: metadata.sessionIdUrl || null,
                isCustom: false,
                source: 'FS',
                config: scannedConfig
            });
        }
    }

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
