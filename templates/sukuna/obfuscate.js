import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const sourceDir = './';
const distDir = './dist';

// Fichiers à copier directement, sans les obfusquer
const filesToCopy = [
    'package.json', 
    'config.js', 
    '.env', 
   
    'yarn.lock',
    'db.json'
   
];

// Dossiers à copier entièrement sans obfuscation
const dirsToCopy = [
    'media'
];

// Fichiers et dossiers à ignorer complètement
const filesToIgnore = [
    'node_modules', 
    '.git', 
    'dist', 
    'obfuscate.js',
    '.github',
    '.vscode',
    'test',
    'tests'
];

// Options d'obfuscation (optimisées pour Baileys)
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false, // Désactivé pour éviter les problèmes
    debugProtectionInterval: 0,
    disableConsoleOutput: false, // Important pour les logs du bot
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false, // Désactivé pour la compatibilité Baileys
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayWrappersChainedCalls: true,
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
    // Options supplémentaires pour stabilité
    reservedNames: [
        'sock', 'msg', 'jid', 'args', 'config', 'Database',
        'isOwner', 'isAdmin', 'safeSend', 'sendReply',
        'makeWASocket', 'useMultiFileAuthState', 'DisconnectReason'
    ],
    reservedStrings: [
        '@s.whatsapp.net', '@g.us', '@c.us',
        'connection.update', 'messages.upsert',
        'group-participants.update', 'creds.update'
    ]
};
// --- FIN DE LA CONFIGURATION ---

function processDirectory(directory) {
    fs.readdirSync(directory).forEach(file => {
        const fullPath = path.join(directory, file);
        const relativePath = path.relative(sourceDir, fullPath);
        const distPath = path.join(distDir, relativePath);

        // Ignorer les fichiers/dossiers de la liste noire
        if (filesToIgnore.includes(file) || filesToIgnore.some(ignore => relativePath.startsWith(ignore))) {
            console.log(`[IGNORÉ]  ${fullPath}`);
            return;
        }

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Vérifier si c'est un dossier à copier entièrement
            if (dirsToCopy.includes(file)) {
                fs.mkdirSync(distPath, { recursive: true });
                copyDirectory(fullPath, distPath);
                console.log(`[COPIÉ]   ${fullPath} (dossier complet)`);
            } else {
                fs.mkdirSync(distPath, { recursive: true });
                processDirectory(fullPath);
            }
        } else {
            if (filesToCopy.includes(file) || shouldCopyFile(fullPath)) {
                // Copier les fichiers de configuration et autres fichiers non-JS
                fs.copyFileSync(fullPath, distPath);
                console.log(`[COPIÉ]   ${fullPath}`);
            } else if (file.endsWith('.js')) {
                // Obfusquer les fichiers JavaScript
                try {
                    const sourceCode = fs.readFileSync(fullPath, 'utf8');
                    
                    // Vérifier si c'est un fichier de commande (pour options spéciales)
                    const obfOptions = isCommandFile(fullPath) 
                        ? { ...obfuscationOptions, controlFlowFlatteningThreshold: 0.5 }
                        : obfuscationOptions;
                    
                    const obfuscationResult = JavaScriptObfuscator.obfuscate(sourceCode, obfOptions);
                    fs.writeFileSync(distPath, obfuscationResult.getObfuscatedCode());
                    console.log(`[OBFUSCÉ] ${fullPath}`);
                } catch (error) {
                    console.error(`[ERREUR]  ${fullPath}: ${error.message}`);
                    // En cas d'erreur, copier le fichier original
                    fs.copyFileSync(fullPath, distPath);
                    console.log(`[COPIÉ]   ${fullPath} (en raison d'erreur)`);
                }
            } else {
                // Copier tous les autres fichiers
                fs.copyFileSync(fullPath, distPath);
                console.log(`[COPIÉ]   ${fullPath}`);
            }
        }
    });
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    fs.readdirSync(src).forEach(file => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

function shouldCopyFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const copyExtensions = ['.json', '.txt', '.md', '.env', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mp3'];
    return copyExtensions.includes(ext);
}

function isCommandFile(filePath) {
    return filePath.includes('commands') && filePath.endsWith('.js');
}

function updatePackageJson() {
    const packagePath = path.join(distDir, 'package.json');
    if (fs.existsSync(packagePath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Mettre à jour les scripts pour le build obfusqué
            packageJson.scripts = {
                "start": "node index.js",
                "dev": "echo 'Use original source for development'",
                "build": "echo 'Already built'"
            };
            
            // Ajouter une note
            packageJson.description = `${packageJson.description || 'WhatsApp Bot'} - Obfuscated Build`;
            
            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
            console.log('[MIS À JOUR] package.json pour build obfusqué');
        } catch (error) {
            console.error('[ERREUR] Impossible de mettre à jour package.json:', error.message);
        }
    }
}

function createReadme() {
    const readmeContent = `# Bot WhatsApp - Version Obfusquée

Ceci est une version obfusquée du bot. 

## Démarrage

\`\`\`bash
npm install
npm start
\`\`\`

## Configuration

Assurez-vous d'avoir configuré votre fichier \`.env\` avec les paramètres appropriés.

## Fichiers importants préservés

- \`config.js\` - Configuration du bot
- \`db.json\` - Base de données
- \`session/\` - Session WhatsApp
- \`.env\` - Variables d'environnement

## Support

Pour toute question, contactez le développeur.
`;

    fs.writeFileSync(path.join(distDir, 'README-OBFUSCATED.md'), readmeContent);
}

async function run() {
    console.log('--- Démarrage du processus d\'obfuscation ---');
    console.log('Source:', sourceDir);
    console.log('Destination:', distDir);
    console.log('');
    
    try {
        // 1. Nettoyer l'ancien dossier de distribution
        if (fs.existsSync(distDir)) {
            fs.rmSync(distDir, { recursive: true, force: true });
            console.log('[NETTOYÉ] Ancien dossier "dist" supprimé.');
        }

        // 2. Créer le nouveau dossier de distribution
        fs.mkdirSync(distDir, { recursive: true });

        // 3. Lancer le processus d'obfuscation
        processDirectory(sourceDir);
        
        // 4. Mettre à jour les fichiers de configuration
        updatePackageJson();
        createReadme();
        
        console.log('\n--- Obfuscation terminée avec succès ! ---');
        console.log(`✅ Votre bot obfusqué est prêt dans: ${distDir}`);
        console.log('');
        console.log('📁 Structure créée:');
        console.log('   ├── index.js (obfusqué)');
        console.log('   ├── lib/ (obfusqué)');
        console.log('   ├── commands/ (obfusqué)');
        console.log('   ├── session/ (préservé)');
        console.log('   ├── config.js (préservé)');
        console.log('   ├── db.json (préservé)');
        console.log('   └── package.json (mis à jour)');
        console.log('');
        console.log('🚀 Pour tester:');
        console.log(`   cd ${distDir}`);
        console.log('   npm install');
        console.log('   npm start');
        
    } catch (error) {
        console.error('\n--- Une erreur est survenue ---');
        console.error(error);
        process.exit(1);
    }
}

// Gestion des erreurs non catchées
process.on('uncaughtException', (error) => {
    console.error('Erreur non gérée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet non géré:', reason);
    process.exit(1);
});

// Lancer le script
run();