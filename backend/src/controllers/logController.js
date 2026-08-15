import prisma from '../config/db.js';

export const getVerificationLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1, search } = req.query;

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const where = {};

    if (req.user.role !== 'ADMIN') {
      where.certificate = { createdBy: req.user.id };
    }

    if (search) {
      where.certificate = {
        ...where.certificate,
        OR: [
          { recipientName: { contains: search, mode: 'insensitive' } },
          { certCode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [logs, total] = await Promise.all([
      prisma.verificationLog.findMany({
        where,
        take,
        skip,
        include: {
          certificate: {
            select: {
              id: true,
              certCode: true,
              recipientName: true,
              status: true,
              event: { select: { name: true } },
            },
          },
        },
        orderBy: { verifiedAt: 'desc' },
      }),
      prisma.verificationLog.count({ where }),
    ]);

    res.json({
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Get Verification Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch verification logs.' });
  }
};

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userWhere = req.user.role === 'ADMIN' ? {} : { createdBy: req.user.id };

    const [
      totalCertificates,
      validCertificates,
      revokedCertificates,
      totalEvents,
      totalTemplates,
      totalVerifications,
      topVerifiedCertificates,
      recentLogs,
    ] = await Promise.all([
      prisma.certificate.count({ where: userWhere }),
      prisma.certificate.count({ where: { ...userWhere, status: 'VALID' } }),
      prisma.certificate.count({ where: { ...userWhere, status: 'REVOKED' } }),
      prisma.event.count({ where: req.user.role === 'ADMIN' ? {} : { organizerId: req.user.id } }),
      prisma.template.count(),
      prisma.verificationLog.count({
        where: req.user.role === 'ADMIN' ? {} : { certificate: { createdBy: req.user.id } },
      }),
      prisma.certificate.findMany({
        where: userWhere,
        take: 5,
        orderBy: { verificationLogs: { _count: 'desc' } },
        select: {
          id: true,
          certCode: true,
          recipientName: true,
          status: true,
          event: { select: { name: true } },
          _count: { select: { verificationLogs: true } },
        },
      }),
      prisma.verificationLog.findMany({
        where: req.user.role === 'ADMIN' ? {} : { certificate: { createdBy: req.user.id } },
        take: 6,
        orderBy: { verifiedAt: 'desc' },
        include: {
          certificate: {
            select: { certCode: true, recipientName: true, status: true, event: { select: { name: true } } },
          },
        },
      }),
    ]);

    res.json({
      analytics: {
        totalCertificates,
        validCertificates,
        revokedCertificates,
        totalEvents,
        totalTemplates,
        totalVerifications,
        topVerifiedCertificates,
        recentLogs,
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics.' });
  }
};
