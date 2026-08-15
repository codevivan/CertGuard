import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

export const getPublicUrl = (relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  return relativePath;
};

export const deleteFile = (relativePath) => {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, '../../', relativePath);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (e) {
      console.error(`Failed to delete file ${fullPath}:`, e.message);
    }
  }
};
