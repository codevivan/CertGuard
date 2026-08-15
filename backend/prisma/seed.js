import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CertGuard Database Seeding...');

  // 1. Clean existing records if any
  await prisma.verificationLog.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.template.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const organizerPasswordHash = await bcrypt.hash('Organizer@123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@certguard.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      name: 'Jane Doe (Event Lead)',
      email: 'organizer@certguard.com',
      passwordHash: organizerPasswordHash,
      role: 'ORGANIZER',
    },
  });

  console.log('✅ Users created: admin@certguard.com & organizer@certguard.com');

  // 3. Create Events
  const event1 = await prisma.event.create({
    data: {
      name: 'Fullstack Web Security Workshop 2026',
      description: 'Hands-on intensive workshop covering web application security, JWT, OAuth, and cryptography.',
      date: new Date('2026-06-15'),
      category: 'WORKSHOP',
      organizerId: organizer.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: 'Global AI & Hackathon Championship',
      description: 'Annual flagship competitive hackathon for AI agent developers.',
      date: new Date('2026-07-20'),
      category: 'COMPETITION',
      organizerId: admin.id,
    },
  });

  console.log('✅ Events created:', event1.name, ',', event2.name);

  // 4. Create Default Template
  const defaultTemplate = await prisma.template.create({
    data: {
      name: 'Modern Executive Gold Template',
      isDefault: true,
      fieldLayout: JSON.stringify([
        { field: 'recipientName', x: 50, y: 42, fontSize: 36, fontWeight: '700', color: '#0f172a' },
        { field: 'eventName', x: 50, y: 55, fontSize: 24, fontWeight: '600', color: '#334155' },
        { field: 'issueDate', x: 30, y: 78, fontSize: 14, fontWeight: '400', color: '#64748b' },
        { field: 'certCode', x: 70, y: 78, fontSize: 14, fontWeight: '500', color: '#475569' },
        { field: 'qrCode', x: 88, y: 80, width: 80 },
        { field: 'authorityTitle', x: 50, y: 88, fontSize: 14, fontWeight: '500', color: '#64748b' },
      ]),
      createdBy: admin.id,
    },
  });

  console.log('✅ Template created:', defaultTemplate.name);

  // 5. Create Sample Certificates
  const sampleParticipants = [
    { name: 'Alex Johnson', email: 'alex@example.com', code: 'CERT-2026-ALEX99', status: 'VALID' },
    { name: 'Sophia Martinez', email: 'sophia@example.com', code: 'CERT-2026-SOPH01', status: 'VALID' },
    { name: 'Michael Chen', email: 'michael@example.com', code: 'CERT-2026-MIKE88', status: 'REVOKED' },
  ];

  for (const p of sampleParticipants) {
    const issueDate = new Date('2026-06-16');
    const formattedDate = issueDate.toISOString().split('T')[0];
    const payload = `${p.name}|${event1.name}|${formattedDate}|${p.code}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    const cert = await prisma.certificate.create({
      data: {
        certCode: p.code,
        eventId: event1.id,
        recipientName: p.name,
        recipientEmail: p.email,
        issueDate,
        hash,
        pdfPath: `/uploads/certificates/cert-${p.code}.pdf`,
        qrPath: `/uploads/qr/qr-${p.code}.png`,
        status: p.status,
        templateId: defaultTemplate.id,
        createdBy: organizer.id,
      },
    });

    // Seed verification logs
    await prisma.verificationLog.create({
      data: {
        certificateId: cert.id,
        verifiedAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        statusChecked: p.status,
      },
    });
  }

  console.log('✅ Sample Certificates and Verification Logs seeded!');
  console.log('🎉 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
