const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check login
function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
}

// Events page
router.get('/events', (req, res) => {
    res.sendFile('events.html', { root: './public' });
});

// API: Get all events
router.get('/api/events', async (req, res) => {
    try {
        const [events] = await db.execute(`
            SELECT e.*, 
                   COUNT(r.id) AS registered_count
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            GROUP BY e.id
            ORDER BY e.event_date ASC
        `);
        res.json({ success: true, events });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Failed to load events.' });
    }
});

// API: Get single event
router.get('/api/events/:id', async (req, res) => {
    try {
        const [events] = await db.execute(`
            SELECT e.*, COUNT(r.id) AS registered_count
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            WHERE e.id = ?
            GROUP BY e.id
        `, [req.params.id]);
        
        if (events.length === 0) return res.json({ success: false, message: 'Event not found.' });
        res.json({ success: true, event: events[0] });
    } catch (err) {
        res.json({ success: false, message: 'Failed to load event.' });
    }
});

// Registration page
router.get('/register-event', requireLogin, (req, res) => {
    res.sendFile('register-event.html', { root: './public' });
});

// API: Register for event
router.post('/api/register', requireLogin, async (req, res) => {
    try {
        const { event_id } = req.body;
        const user = req.session.user;

        if (!event_id) return res.json({ success: false, message: 'Event ID is required.' });

        // Check event exists
        const [events] = await db.execute('SELECT * FROM events WHERE id = ?', [event_id]);
        if (events.length === 0) return res.json({ success: false, message: 'Event not found.' });

        const event = events[0];

        // Check capacity
        const [countResult] = await db.execute('SELECT COUNT(*) AS cnt FROM registrations WHERE event_id = ?', [event_id]);
        if (countResult[0].cnt >= event.max_capacity) {
            return res.json({ success: false, message: 'Sorry, this event is fully booked.' });
        }

        // Check duplicate
        const [existing] = await db.execute(
            'SELECT id FROM registrations WHERE email = ? AND event_id = ?',
            [user.email, event_id]
        );
        if (existing.length > 0) {
            return res.json({ success: false, message: 'You have already registered for this event.' });
        }

        await db.execute(
            'INSERT INTO registrations (student_name, email, event_id, user_id, student_id, department) VALUES (?, ?, ?, ?, ?, ?)',
            [user.full_name, user.email, event_id, user.id, user.student_id || '', user.department || '']
        );

        res.json({ success: true, message: `Successfully registered for "${event.title}"!` });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Server error. Please try again.' });
    }
});

// API: Check registration status for current user
router.get('/api/my-registrations', requireLogin, async (req, res) => {
    try {
        const user = req.session.user;
        const [registrations] = await db.execute(`
            SELECT r.*, e.title, e.event_date, e.location, e.image_url, e.category
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.registered_at DESC
        `, [user.id]);
        res.json({ success: true, registrations });
    } catch (err) {
        res.json({ success: false, message: 'Failed to load registrations.' });
    }
});

module.exports = router;
