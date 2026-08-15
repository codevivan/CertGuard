import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import prisma from '../config/db.js';
import { generateCertificateQR } from '../services/qrService.js';
import { generateCertificatePDF } from '../services/pdfService.js';
import { computeCertificateHash } from '../services/hashService.js';
import { sendCertificateEmail } from '../services/emailService.js';

const safeParseLayout = (layout) => {
  if (!layout) return [];
  if (typeof layout === 'string') {
    try {
      return JSON.parse(layout);
    } catch (e) {
      return [];
    }
  }
  return layout;
};

// Helper to generate unique code like CERT-2026-X89A12
const generateUniqueCertCode = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${randomPart}`;
};

/**
 * Generate a single certificate
 */
export const generateSingleCertificate = async (req, res) => {
  try {
    const { eventId, recipientName, recipientEmail, templateId, authorityTitle } = req.body;

    if (!eventId || !recipientName || !recipientEmail) {
      return res.status(400).json({ error: 'Event, recipient name, and email are required.' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Selected event not found.' });
    }

    // Select template (specified, or default, or first available)
    let template = null;
    if (templateId) {
      template = await prisma.template.findUnique({ where: { id: templateId } });
    }
    if (!template) {
      template = await prisma.template.findFirst({ where: { isDefault: true } });
    }
    if (!template) {
      template = await prisma.template.findFirst();
    }

    if (!template) {
      // Create a built-in default template if none exist
      template = await prisma.template.create({
        data: {
          name: 'Standard CertGuard Template',
          isDefault: true,
          fieldLayout: JSON.stringify([
            { field: 'recipientName', x: 50, y: 42, fontSize: 36, fontWeight: '700', color: '#0f172a' },
            { field: 'eventName', x: 50, y: 55, fontSize: 24, fontWeight: '600', color: '#334155' },
            { field: 'issueDate', x: 30, y: 78, fontSize: 14, fontWeight: '400', color: '#64748b' },
            { field: 'certCode', x: 70, y: 78, fontSize: 14, fontWeight: '500', color: '#475569' },
            { field: 'qrCode', x: 88, y: 80, width: 80 },
            { field: 'authorityTitle', x: 50, y: 88, fontSize: 14, fontWeight: '500', color: '#64748b' },
          ]),
          createdBy: req.user.id,
        },
      });
    }

    const certCode = generateUniqueCertCode();
    const issueDate = new Date();

    // 1. Compute Hash
    const hash = computeCertificateHash({
      recipientName,
      eventName: event.name,
      issueDate,
      certCode,
    });

    // 2. Generate QR Code
    const qrResult = await generateCertificateQR(certCode);

    // 3. Generate PDF
    const pdfResult = await generateCertificatePDF({
      certCode,
      recipientName,
      eventName: event.name,
      issueDate,
      category: event.category,
      organizerName: event.organizer.name,
      authorityTitle: authorityTitle || 'Issuing Authority',
      fieldLayout: safeParseLayout(template.fieldLayout),
      bgImagePath: template.imagePath,
      qrDataUrl: qrResult.qrDataUrl,
    });

    // 4. Save Database Record
    const certificate = await prisma.certificate.create({
      data: {
        certCode,
        eventId: event.id,
        recipientName,
        recipientEmail,
        issueDate,
        hash,
        pdfPath: pdfResult.relativePath,
        qrPath: qrResult.relativePath,
        status: 'VALID',
        templateId: template.id,
        createdBy: req.user.id,
      },
      include: {
        event: { select: { id: true, name: true, category: true, date: true } },
        template: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    // 5. Send Email asynchronously
    sendCertificateEmail({
      recipientEmail,
      recipientName,
      eventName: event.name,
      certCode,
      pdfFilePath: pdfResult.filePath,
      verifyUrl: qrResult.verifyUrl,
    });

    res.status(201).json({
      message: 'Certificate generated successfully!',
      certificate,
      verifyUrl: qrResult.verifyUrl,
    });
  } catch (error) {
    console.error('Generate Certificate Error:', error);
    res.status(500).json({ error: 'Failed to generate certificate.' });
  }
};

/**
 * Bulk generate certificates via CSV upload
 */
export const bulkGenerateCertificates = async (req, res) => {
  try {
    const { eventId, templateId, authorityTitle, previewOnly } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required.' });
    }

    if (!eventId) {
      return res.status(400).json({ error: 'Event selection is required.' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) {
      return res.status(404).json({ error: 'Selected event not found.' });
    }

    const filePath = req.file.path;
    const participants = [];

    // Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
          const keys = Object.keys(row);
          const nameKey = keys.find((k) => k.toLowerCase().includes('name'));
          const emailKey = keys.find((k) => k.toLowerCase().includes('email'));
          const name = nameKey ? row[nameKey]?.trim() : row.name || row.Name;
          const email = emailKey ? row[emailKey]?.trim() : row.email || row.Email;

          if (name && email) {
            participants.push({ recipientName: name, recipientEmail: email });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Remove uploaded temporary CSV file
    fs.unlink(filePath, () => {});

    if (participants.length === 0) {
      return res.status(400).json({
        error: 'No valid participants found in CSV. Ensure CSV has "name" and "email" columns.',
      });
    }

    // If client requested preview only, return parsed array
    if (previewOnly === 'true' || previewOnly === true) {
      return res.json({
        message: 'CSV preview generated successfully',
        count: participants.length,
        participants,
      });
    }

    // Load template
    let template = null;
    if (templateId) {
      template = await prisma.template.findUnique({ where: { id: templateId } });
    }
    if (!template) {
      template = await prisma.template.findFirst({ where: { isDefault: true } });
    }
    if (!template) {
      template = await prisma.template.findFirst();
    }

    const createdCertificates = [];

    // Process participants
    for (const p of participants) {
      const certCode = generateUniqueCertCode();
      const issueDate = new Date();

      const hash = computeCertificateHash({
        recipientName: p.recipientName,
        eventName: event.name,
        issueDate,
        certCode,
      });

      const qrResult = await generateCertificateQR(certCode);

      const pdfResult = await generateCertificatePDF({
        certCode,
        recipientName: p.recipientName,
        eventName: event.name,
        issueDate,
        category: event.category,
        organizerName: event.organizer.name,
        authorityTitle: authorityTitle || 'Issuing Authority',
        fieldLayout: safeParseLayout(template ? template.fieldLayout : []),
        bgImagePath: template ? template.imagePath : null,
        qrDataUrl: qrResult.qrDataUrl,
      });

      const cert = await prisma.certificate.create({
        data: {
          certCode,
          eventId: event.id,
          recipientName: p.recipientName,
          recipientEmail: p.recipientEmail,
          issueDate,
          hash,
          pdfPath: pdfResult.relativePath,
          qrPath: qrResult.relativePath,
          status: 'VALID',
          templateId: template ? template.id : '',
          createdBy: req.user.id,
        },
      });

      // Dispatch Email
      sendCertificateEmail({
        recipientEmail: p.recipientEmail,
        recipientName: p.recipientName,
        eventName: event.name,
        certCode,
        pdfFilePath: pdfResult.filePath,
        verifyUrl: qrResult.verifyUrl,
      });

      createdCertificates.push(cert);
    }

    res.status(201).json({
      message: `Successfully bulk generated ${createdCertificates.length} certificates!`,
      count: createdCertificates.length,
      certificates: createdCertificates,
    });
  } catch (error) {
    console.error('Bulk Generate Error:', error);
    res.status(500).json({ error: 'Failed to process bulk CSV certificate generation.' });
  }
};

/**
 * Get all certificates (with search, filter, pagination)
 */
export const getCertificates = async (req, res) => {
  try {
    const { search, eventId, status, startDate, endDate, limit = 50, page = 1 } = req.query;

    const where = {};

    if (req.user.role !== 'ADMIN') {
      where.createdBy = req.user.id;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { recipientName: { contains: search } },
        { recipientEmail: { contains: search } },
        { certCode: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate);
      if (endDate) where.issueDate.lte = new Date(endDate);
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        take,
        skip,
        include: {
          event: { select: { id: true, name: true, category: true } },
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { verificationLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.certificate.count({ where }),
    ]);

    res.json({
      certificates,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Get Certificates Error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates.' });
  }
};

/**
 * Get single certificate details by ID
 */
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, name: true, description: true, date: true, category: true } },
        template: { select: { id: true, name: true, fieldLayout: true } },
        creator: { select: { id: true, name: true, email: true } },
        verificationLogs: {
          orderBy: { verifiedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found.' });
    }

    if (req.user.role !== 'ADMIN' && certificate.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this certificate.' });
    }

    res.json({
      certificate: {
        ...certificate,
        template: certificate.template
          ? {
              ...certificate.template,
              fieldLayout: safeParseLayout(certificate.template.fieldLayout),
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate details.' });
  }
};

/**
 * Revoke certificate
 */
export const revokeCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({ where: { id } });
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found.' });
    }

    if (req.user.role !== 'ADMIN' && certificate.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to revoke this certificate.' });
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    res.json({ message: 'Certificate has been revoked successfully.', certificate: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke certificate.' });
  }
};

/**
 * Reissue certificate
 */
export const reissueCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: { event: { include: { organizer: true } }, template: true },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found.' });
    }

    if (req.user.role !== 'ADMIN' && certificate.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to reissue this certificate.' });
    }

    // Regenerate QR & PDF
    const qrResult = await generateCertificateQR(certificate.certCode);
    const pdfResult = await generateCertificatePDF({
      certCode: certificate.certCode,
      recipientName: certificate.recipientName,
      eventName: certificate.event.name,
      issueDate: certificate.issueDate,
      category: certificate.event.category,
      organizerName: certificate.event.organizer.name,
      fieldLayout: safeParseLayout(certificate.template?.fieldLayout),
      bgImagePath: certificate.template?.imagePath || null,
      qrDataUrl: qrResult.qrDataUrl,
    });

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        status: 'VALID',
        pdfPath: pdfResult.relativePath,
        qrPath: qrResult.relativePath,
      },
    });

    // Re-send email
    sendCertificateEmail({
      recipientEmail: certificate.recipientEmail,
      recipientName: certificate.recipientName,
      eventName: certificate.event.name,
      certCode: certificate.certCode,
      pdfFilePath: pdfResult.filePath,
      verifyUrl: qrResult.verifyUrl,
    });

    res.json({ message: 'Certificate reissued and status reset to VALID.', certificate: updated });
  } catch (error) {
    console.error('Reissue error:', error);
    res.status(500).json({ error: 'Failed to reissue certificate.' });
  }
};

/**
 * Export certificates list as CSV
 */
export const exportCertificatesCSV = async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'ADMIN') {
      where.createdBy = req.user.id;
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });

    let csvContent = 'CertCode,RecipientName,RecipientEmail,Event,Category,IssueDate,Status,SHA256Hash\n';
    certificates.forEach((c) => {
      const dateStr = new Date(c.issueDate).toISOString().split('T')[0];
      csvContent += `"${c.certCode}","${c.recipientName}","${c.recipientEmail}","${c.event.name}","${c.event.category}","${dateStr}","${c.status}","${c.hash}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="certificates_export.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
};
