import fs from 'fs-extra';
import path from 'path';

export async function getDirectorySize(dirPath: string): Promise<number> {
  let size = 0;
  try {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.stat(filePath);
    
        if (stats.isDirectory()) {
          size += await getDirectorySize(filePath);
        } else {
          size += stats.size;
        }
      }
  } catch (error) {
      console.error('Error calculating directory size:', error);
      return 0;
  }
  return size;
}

export const MAX_DISK_USAGE = 1024 * 1024 * 1024; // 1GB in bytes
export const MAX_RAM_MB = 512;

const INSTANCES_DIR_NAME = 'instances';
const TEMPLATES_DIR_NAME = 'templates';

export function getInstancePath(botId: string): string {
    return `${process.cwd()}/${INSTANCES_DIR_NAME}/${botId}`;
}

export function getTemplatePath(templateName: string): string {
    return `${process.cwd()}/${TEMPLATES_DIR_NAME}/${templateName}`;
}
