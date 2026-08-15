import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const qrDir = path.join(__dirname, '../../uploads/qr');

if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

/**
 * Generates a QR Code image for a given certificate code
 * @param {string} certCode
 * @returns {Promise<{ qrUrl: string, qrDataUrl: string, relativePath: string }>}
 */
export const generateCertificateQR = async (certCode) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${baseUrl}/verify/${certCode}`;
  
  const fileName = `qr-${certCode}.png`;
  const filePath = path.join(qrDir, fileName);

  await QRCode.toFile(filePath, verifyUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
  });

  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
  });

  return {
    verifyUrl,
    qrDataUrl,
    relativePath: `/uploads/qr/${fileName}`,
    filePath,
  };
};
