import prisma from '../config/db.js';
import { deleteFile } from '../services/storageService.js';

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

export const getTemplates = async (req, res) => {
  try {
    const rawTemplates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    const templates = rawTemplates.map((t) => ({
      ...t,
      fieldLayout: safeParseLayout(t.fieldLayout),
    }));

    res.json({ templates });
  } catch (error) {
    console.error('Get Templates Error:', error);
    res.status(500).json({ error: 'Failed to fetch templates.' });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id },
      include: { creator: { select: { id: true, name: true, email: true } } },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    res.json({
      template: {
        ...template,
        fieldLayout: safeParseLayout(template.fieldLayout),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template.' });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, isDefault, fieldLayout } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Template name is required.' });
    }

    let parsedLayout = [];
    if (fieldLayout) {
      parsedLayout = safeParseLayout(fieldLayout);
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/templates/${req.file.filename}`;
    }

    const setAsDefault = isDefault === 'true' || isDefault === true;

    if (setAsDefault) {
      await prisma.template.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.template.create({
      data: {
        name,
        imagePath,
        fieldLayout: JSON.stringify(parsedLayout),
        isDefault: setAsDefault,
        createdBy: req.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({
      message: 'Template created successfully',
      template: {
        ...template,
        fieldLayout: safeParseLayout(template.fieldLayout),
      },
    });
  } catch (error) {
    console.error('Create Template Error:', error);
    res.status(500).json({ error: 'Failed to create template.' });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isDefault, fieldLayout } = req.body;

    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    if (req.user.role !== 'ADMIN' && existing.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this template.' });
    }

    let imagePath = existing.imagePath;
    if (req.file) {
      if (existing.imagePath) {
        deleteFile(existing.imagePath);
      }
      imagePath = `/uploads/templates/${req.file.filename}`;
    }

    let parsedLayout = safeParseLayout(existing.fieldLayout);
    if (fieldLayout !== undefined) {
      parsedLayout = safeParseLayout(fieldLayout);
    }

    const setAsDefault = isDefault === 'true' || isDefault === true;
    if (setAsDefault && !existing.isDefault) {
      await prisma.template.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        imagePath,
        fieldLayout: JSON.stringify(parsedLayout),
        ...(isDefault !== undefined && { isDefault: setAsDefault }),
      },
    });

    res.json({
      message: 'Template updated successfully',
      template: {
        ...template,
        fieldLayout: safeParseLayout(template.fieldLayout),
      },
    });
  } catch (error) {
    console.error('Update Template Error:', error);
    res.status(500).json({ error: 'Failed to update template.' });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Template not found.' });
    }

    if (req.user.role !== 'ADMIN' && existing.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this template.' });
    }

    if (existing.imagePath) {
      deleteFile(existing.imagePath);
    }

    await prisma.template.delete({ where: { id } });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template.' });
  }
};
