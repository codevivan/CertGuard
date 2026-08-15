import prisma from '../config/db.js';

export const getEvents = async (req, res) => {
  try {
    const { category, search } = req.query;

    const where = {};

    // Filter by organizer if not ADMIN
    if (req.user.role !== 'ADMIN') {
      where.organizerId = req.user.id;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { certificates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ events });
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        _count: { select: { certificates: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (req.user.role !== 'ADMIN' && event.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied to this event.' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { name, description, date, category } = req.body;

    if (!name || !date) {
      return res.status(400).json({ error: 'Event name and date are required.' });
    }

    const validCategories = ['WORKSHOP', 'COMPETITION', 'TRAINING', 'OTHER'];
    const assignedCategory = validCategories.includes(category) ? category : 'WORKSHOP';

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date: new Date(date),
        category: assignedCategory,
        organizerId: req.user.id,
      },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, date, category } = req.body;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (req.user.role !== 'ADMIN' && existingEvent.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event.' });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(category && { category }),
      },
    });

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event.' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    if (req.user.role !== 'ADMIN' && existingEvent.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event.' });
    }

    await prisma.event.delete({ where: { id } });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
};
