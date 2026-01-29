import fs from 'fs-extra';
import path from 'path';

export async function scanVariables(dirPath: string): Promise<Record<string, string>> {
    const discoveredVars: Record<string, string> = {};

    // Helper: Parse Key=Value files (.env)
    const parseEnvFile = async (filename: string) => {
        try {
            const p = path.join(dirPath, filename);
            if (await fs.pathExists(p)) {
                const content = await fs.readFile(p, 'utf8');
                content.split('\n').forEach(line => {
                    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
                    if (match) discoveredVars[match[1]] = match[2].trim();
                });
            }
        } catch (e) { /* ignore */ }
    };

    // Helper: Parse JS files (Advanced Regex)
    const parseJsFile = async (filename: string) => {
        try {
            const p = path.join(dirPath, filename);
            if (await fs.pathExists(p)) {
                const content = await fs.readFile(p, 'utf8');
                
                // 1. Match process.env.VAR || "default"
                let matches = Array.from(content.matchAll(/process\.env\.([A-Z0-9_]+)\s*\|\|\s*['"](.*?)['"]/g));
                for (const m of matches) {
                    if (!discoveredVars[m[1]]) discoveredVars[m[1]] = m[2];
                }
                
                // 2. Match process.env.VAR || NUMBER/BOOL
                matches = Array.from(content.matchAll(/process\.env\.([A-Z0-9_]+)\s*\|\|\s*([0-9]+|true|false)/g));
                    for (const m of matches) {
                    if (!discoveredVars[m[1]]) discoveredVars[m[1]] = m[2];
                }

                // 3. Match just process.env.VAR
                matches = Array.from(content.matchAll(/process\.env\.([A-Z0-9_]+)/g));
                for (const m of matches) {
                    if (!discoveredVars[m[1]]) discoveredVars[m[1]] = "";
                }

                // 4. Global assignments
                matches = Array.from(content.matchAll(/global\.([a-zA-Z0-9_]+)\s*=\s*['"]([^'"]+)['"]/g));
                for (const m of matches) {
                    const key = m[1];
                    const val = m[2];
                    if (key === key.toUpperCase()) {
                        if (!discoveredVars[key]) discoveredVars[key] = val;
                    }
                }
            }
        } catch (e) { /* ignore */ }
    };

    await parseEnvFile('.env');
    await parseEnvFile('set.env');
    await parseEnvFile('config.env');
    await parseJsFile('config.js');
    await parseJsFile('configs.js');
    await parseJsFile('settings.js');
    await parseJsFile('index.js');

    return discoveredVars;
}
