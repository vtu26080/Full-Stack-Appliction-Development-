const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Show register page
router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/events');
    res.sendFile('register.html', { root: './public' });
});

// Handle registration
router.post('/register', async (req, res) => {
    try {
        const { full_name, email, password, student_id, department, phone } = req.body;
        
        if (!full_name || !email || !password) {
            return res.json({ success: false, message: 'Please fill all required fields.' });
        }

        // Check existing user
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.json({ success: false, message: 'Email already registered. Please login.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (full_name, email, password, student_id, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, email, hashedPassword, student_id || null, department || null, phone || null]
        );

        res.json({ success: true, message: 'Registration successful! Please login.' });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Server error. Please try again.' });
    }
});

// Show login page
router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/events');
    res.sendFile('login.html', { root: './public' });
});

// Handle login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.json({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.json({ success: false, message: 'Invalid email or password.' });
        }

        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            student_id: user.student_id,
            department: user.department
        };

        if (user.role === 'admin') {
            res.json({ success: true, redirect: '/admin' });
        } else {
            res.json({ success: true, redirect: '/events' });
        }
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'Server error. Please try again.' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Get session user info
router.get('/api/me', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;
