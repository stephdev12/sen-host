import { NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'templates');
    
    if (!await fs.pathExists(templatesDir)) {
        return NextResponse.json({ templates: [] });
    }

    const items = await fs.readdir(templatesDir, { withFileTypes: true });
    
    // On ne garde que les dossiers
    const templates = items
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
            id: dirent.name,
            name: dirent.name.replace(/-/g, ' ').toUpperCase(), // Formattage basique "sen-bot" -> "SEN BOT"
            // On pourrait lire un fichier 'metadata.json' dans le dossier pour avoir plus d'infos (desc, image...)
        }));

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
