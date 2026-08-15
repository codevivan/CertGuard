import prisma from '../config/db.js';
import { computeCertificateHash } from '../services/hashService.js';

export const verifyCertificate = async (req, res) => {
  try {
    const { certCode } = req.params;
    const cleanCode = certCode ? certCode.trim().toUpperCase() : '';

    if (!cleanCode) {
      return res.status(400).json({ error: 'Certificate code is required for verification.' });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { certCode: cleanCode },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            date: true,
            category: true,
            organizer: {
              select: { name: true, email: true },
            },
          },
        },
        template: {
          select: { name: true },
        },
      },
    });

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    if (!certificate) {
      return res.status(404).json({
        found: false,
        valid: false,
        message: 'Certificate not found. The provided Certificate ID does not exist in our database.',
        searchedCode: cleanCode,
      });
    }

    // Compute cryptographic SHA-256 hash match
    const computedHash = computeCertificateHash({
      recipientName: certificate.recipientName,
      eventName: certificate.event.name,
      issueDate: certificate.issueDate,
      certCode: certificate.certCode,
    });

    const hashMatch = computedHash === certificate.hash;
    const isValid = certificate.status === 'VALID' && hashMatch;
    const statusChecked = !hashMatch ? 'HASH_MISMATCH' : certificate.status;

    // Log verification attempt asynchronously
    prisma.verificationLog.create({
      data: {
        certificateId: certificate.id,
        ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
        userAgent,
        statusChecked,
      },
    }).catch((e) => console.error('Failed to log verification:', e.message));

    res.json({
      found: true,
      valid: isValid,
      status: certificate.status,
      hashMatch,
      certificate: {
        certCode: certificate.certCode,
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        eventName: certificate.event.name,
        eventCategory: certificate.event.category,
        eventDate: certificate.event.date,
        issueDate: certificate.issueDate,
        organizerName: certificate.event.organizer.name,
        hash: certificate.hash,
        pdfPath: certificate.pdfPath,
        qrPath: certificate.qrPath,
        status: certificate.status,
      },
      message: isValid
        ? 'Certificate is authentic and valid.'
        : certificate.status === 'REVOKED'
        ? 'WARNING: This certificate has been REVOKED by the issuing authority.'
        : 'WARNING: Certificate data integrity check failed (SHA-256 Mismatch).',
    });
  } catch (error) {
    console.error('Verify Endpoint Error:', error);
    res.status(500).json({ error: 'Verification service error.' });
  }
};
