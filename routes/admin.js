const express = require('express');
const router = express.Router();
const db = require('../config/db');

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
}

// Admin dashboard
router.get('/admin', requireAdmin, (req, res) => {
    res.sendFile('admin.html', { root: './public' });
});

// API: Dashboard stats
router.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const [[{ total_events }]] = await db.execute('SELECT COUNT(*) AS total_events FROM events');
        const [[{ total_registrations }]] = await db.execute('SELECT COUNT(*) AS total_registrations FROM registrations');
        const [[{ total_students }]] = await db.execute('SELECT COUNT(*) AS total_students FROM users WHERE role = "student"');
        
        const [popular] = await db.execute(`
            SELECT e.title, COUNT(r.id) AS count 
            FROM events e LEFT JOIN registrations r ON e.id = r.event_id 
            GROUP BY e.id ORDER BY count DESC LIMIT 1
        `);

        res.json({
            success: true,
            stats: {
                total_events,
                total_registrations,
                total_students,
                popular_event: popular[0] || null
            }
        });
    } catch (err) {
        res.json({ success: false, message: 'Failed to load stats.' });
    }
});

// API: Get all registrations
router.get('/api/admin/registrations', requireAdmin, async (req, res) => {
    try {
        const [registrations] = await db.execute(`
            SELECT r.*, e.title AS event_title, e.event_date, e.location, e.category
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            ORDER BY r.registered_at DESC
        `);
        res.json({ success: true, registrations });
    } catch (err) {
        res.json({ success: false, message: 'Failed to load registrations.' });
    }
});

// API: Get all events (admin)
router.get('/api/admin/events', requireAdmin, async (req, res) => {
    try {
        const [events] = await db.execute(`
            SELECT e.*, COUNT(r.id) AS registered_count
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            GROUP BY e.id
            ORDER BY e.event_date ASC
        `);
        res.json({ success: true, events });
    } catch (err) {
        res.json({ success: false, message: 'Failed to load events.' });
    }
});

// API: Create event
router.post('/api/admin/events', requireAdmin, async (req, res) => {
    try {
        const { title, description, event_date, location, category, image_url, max_capacity } = req.body;
        
        if (!title || !event_date || !location) {
            return res.json({ success: false, message: 'Title, date and location are required.' });
        }

        await db.execute(
            'INSERT INTO events (title, description, event_date, location, category, image_url, max_capacity, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description || '', event_date, location, category || 'General', image_url || null, max_capacity || 100, req.session.user.id]
        );

        res.json({ success: true, message: 'Event created successfully!' });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Failed to create event.' });
    }
});

// API: Delete event
router.delete('/api/admin/events/:id', requireAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Event deleted.' });
    } catch (err) {
        res.json({ success: false, message: 'Failed to delete event.' });
    }
});

// API: Delete registration
router.delete('/api/admin/registrations/:id', requireAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM registrations WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Registration removed.' });
    } catch (err) {
        res.json({ success: false, message: 'Failed to remove registration.' });
    }
});

// API: Get all students
router.get('/api/admin/students', requireAdmin, async (req, res) => {
    try {
        const [students] = await db.execute(
            'SELECT id, full_name, email, student_id, department, phone, created_at FROM users WHERE role = "student" ORDER BY created_at DESC'
        );
        res.json({ success: true, students });
    } catch (err) {
        res.json({ success: false, message: 'Failed to load students.' });
    }
});

module.exports = router;
