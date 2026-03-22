const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const db = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'veltech_secret_2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Multer for event images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ==================== INIT DATABASE ====================
async function initDB() {
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      event_date DATETIME NOT NULL,
      location VARCHAR(255),
      category VARCHAR(100) DEFAULT 'General',
      image_url VARCHAR(500) DEFAULT NULL,
      max_seats INT DEFAULT 100,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      student_id VARCHAR(50),
      department VARCHAR(100),
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      event_id INT NOT NULL,
      user_id INT,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE KEY unique_registration (email, event_id)
    )`);

    // Seed admin
    const [admins] = await db.execute('SELECT id FROM admins LIMIT 1');
    if (admins.length === 0) {
      const hash = await bcrypt.hash('admin@veltech123', 10);
      await db.execute(
        'INSERT INTO admins (username, email, password) VALUES (?, ?, ?)',
        ['veltech_admin', 'admin@veltech.ac.in', hash]
      );
      console.log('Default admin created: veltech_admin / admin@veltech123');
    }

    // Seed events
    const [evts] = await db.execute('SELECT id FROM events LIMIT 1');
    if (evts.length === 0) {
      const events = [
        ['National Technology Summit 2025', 'Join us for the biggest tech summit of the year featuring keynote speakers from top tech companies, hands-on workshops, and networking sessions. Explore the future of AI, blockchain, and cloud computing.', '2025-08-15 09:00:00', 'Vel Tech Auditorium, Main Campus', 'Technology', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', 500],
        ['Inter-College Coding Hackathon', 'A 24-hour non-stop hackathon where teams compete to build innovative solutions for real-world problems. Cash prizes worth ₹1,00,000 up for grabs!', '2025-09-05 08:00:00', 'Vel Tech Innovation Hub', 'Hackathon', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80', 200],
        ['Cultural Fiesta - Velocity 2025', 'Vel Tech\'s annual mega cultural fest! Dance competitions, music battles, drama performances, art exhibitions, and food stalls.', '2025-09-20 10:00:00', 'Vel Tech Open Air Theatre', 'Cultural', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80', 1000],
        ['Research Paper Presentation', 'Present your research findings to a panel of eminent professors and industry experts. Best papers will be published in the Vel Tech Journal.', '2025-08-28 10:00:00', 'Vel Tech Conference Hall A', 'Academic', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80', 150],
        ['Sports Championship - Techathlon', 'Annual sports meet featuring cricket, football, basketball, volleyball, badminton, chess, and athletics.', '2025-10-10 07:00:00', 'Vel Tech Sports Complex', 'Sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', 800],
        ['Industry Expert Workshop - AI & ML', 'Hands-on workshop on Artificial Intelligence and Machine Learning by experts from Google, Microsoft, and leading startups.', '2025-08-22 09:30:00', 'Vel Tech Smart Classroom Block C', 'Workshop', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', 60],
        ['Entrepreneurship Bootcamp', 'A 3-day intensive bootcamp for aspiring entrepreneurs to validate ideas, build business plans, and pitch to real investors.', '2025-09-15 09:00:00', 'Vel Tech Business Incubation Centre', 'Entrepreneurship', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80', 100],
        ['Annual Science Exhibition', 'Showcase innovative projects at Vel Tech\'s Science Exhibition. Categories: robotics, green energy, biotechnology, engineering models.', '2025-10-25 09:00:00', 'Vel Tech Exhibition Hall', 'Science', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80', 300]
      ];
      for (const e of events) {
        await db.execute(
          'INSERT INTO events (title, description, event_date, location, category, image_url, max_seats) VALUES (?,?,?,?,?,?,?)',
          e
        );
      }
      console.log('Sample events seeded.');
    }
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

// ==================== AUTH MIDDLEWARE ====================
const requireUserLogin = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect('/login?msg=Please login to continue');
};

const requireAdminLogin = (req, res, next) => {
  if (req.session.adminId) return next();
  res.redirect('/admin/login?msg=Admin login required');
};

// ==================== SERVE HTML PAGES ====================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.get('/events', (req, res) => res.sendFile(path.join(__dirname, 'public/events.html')));
app.get('/event/:id', (req, res) => res.sendFile(path.join(__dirname, 'public/event-detail.html')));
app.get('/dashboard', requireUserLogin, (req, res) => res.sendFile(path.join(__dirname, 'public/dashboard.html')));
app.get('/admin/login', (req, res) => res.sendFile(path.join(__dirname, 'public/admin-login.html')));
app.get('/admin', requireAdminLogin, (req, res) => res.sendFile(path.join(__dirname, 'public/admin.html')));
app.get('/admin/add-event', requireAdminLogin, (req, res) => res.sendFile(path.join(__dirname, 'public/admin-add-event.html')));

// ==================== API: SESSION INFO ====================
app.get('/api/session', (req, res) => {
  res.json({
    loggedIn: !!req.session.userId,
    userId: req.session.userId || null,
    userName: req.session.userName || null,
    isAdmin: !!req.session.adminId,
    adminName: req.session.adminName || null
  });
});

// ==================== API: USER AUTH ====================
app.post('/api/user/register', async (req, res) => {
  const { full_name, email, password, student_id, department, phone } = req.body;
  if (!full_name || !email || !password) return res.json({ success: false, message: 'All required fields must be filled.' });
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.json({ success: false, message: 'Email already registered.' });
    const hash = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (full_name, email, password, student_id, department, phone) VALUES (?,?,?,?,?,?)',
      [full_name, email, hash, student_id || null, department || null, phone || null]
    );
    res.json({ success: true, message: 'Registration successful! Please login.' });
  } catch (err) {
    res.json({ success: false, message: 'Error: ' + err.message });
  }
});

app.post('/api/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.json({ success: false, message: 'Invalid email or password.' });
    const user = users[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Invalid email or password.' });
    req.session.userId = user.id;
    req.session.userName = user.full_name;
    req.session.userEmail = user.email;
    res.json({ success: true, message: 'Login successful!', name: user.full_name });
  } catch (err) {
    res.json({ success: false, message: 'Error: ' + err.message });
  }
});

app.post('/api/user/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ==================== API: ADMIN AUTH ====================
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [admins] = await db.execute('SELECT * FROM admins WHERE username = ? OR email = ?', [username, username]);
    if (admins.length === 0) return res.json({ success: false, message: 'Invalid credentials.' });
    const admin = admins[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.json({ success: false, message: 'Invalid credentials.' });
    req.session.adminId = admin.id;
    req.session.adminName = admin.username;
    res.json({ success: true, message: 'Admin login successful!' });
  } catch (err) {
    res.json({ success: false, message: 'Error: ' + err.message });
  }
});

app.post('/api/admin/logout', (req, res) => {
  delete req.session.adminId;
  delete req.session.adminName;
  res.json({ success: true });
});

// ==================== API: EVENTS ====================
app.get('/api/events', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `SELECT e.*, 
      (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registered_count
      FROM events e`;
    const params = [];
    if (category && category !== 'All') {
      query += ' WHERE e.category = ?';
      params.push(category);
    }
    query += ' ORDER BY e.event_date ASC';
    const [events] = await db.execute(query, params);
    res.json({ success: true, events });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const [events] = await db.execute(
      `SELECT e.*, (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registered_count FROM events e WHERE e.id = ?`,
      [req.params.id]
    );
    if (events.length === 0) return res.json({ success: false, message: 'Event not found' });
    res.json({ success: true, event: events[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ==================== API: REGISTRATIONS ====================
app.post('/api/register-event', requireUserLogin, async (req, res) => {
  const { event_id } = req.body;
  const userId = req.session.userId;
  const userEmail = req.session.userEmail;
  const userName = req.session.userName;
  try {
    // Check already registered
    const [existing] = await db.execute(
      'SELECT id FROM registrations WHERE email = ? AND event_id = ?',
      [userEmail, event_id]
    );
    if (existing.length > 0) return res.json({ success: false, message: 'You are already registered for this event!' });

    // Check seats
    const [evts] = await db.execute('SELECT max_seats FROM events WHERE id = ?', [event_id]);
    const [count] = await db.execute('SELECT COUNT(*) as cnt FROM registrations WHERE event_id = ?', [event_id]);
    if (count[0].cnt >= evts[0].max_seats) return res.json({ success: false, message: 'Sorry, this event is fully booked!' });

    await db.execute(
      'INSERT INTO registrations (student_name, email, event_id, user_id) VALUES (?,?,?,?)',
      [userName, userEmail, event_id, userId]
    );
    res.json({ success: true, message: 'Successfully registered for the event!' });
  } catch (err) {
    res.json({ success: false, message: 'Error: ' + err.message });
  }
});

app.get('/api/my-registrations', requireUserLogin, async (req, res) => {
  try {
    const [regs] = await db.execute(
      `SELECT r.*, e.title, e.event_date, e.location, e.category, e.image_url 
       FROM registrations r JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ? ORDER BY r.registered_at DESC`,
      [req.session.userId]
    );
    res.json({ success: true, registrations: regs });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.delete('/api/cancel-registration/:eventId', requireUserLogin, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM registrations WHERE user_id = ? AND event_id = ?',
      [req.session.userId, req.params.eventId]
    );
    res.json({ success: true, message: 'Registration cancelled.' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ==================== API: ADMIN ====================
app.get('/api/admin/stats', requireAdminLogin, async (req, res) => {
  try {
    const [[{ total_events }]] = await db.execute('SELECT COUNT(*) as total_events FROM events');
    const [[{ total_users }]] = await db.execute('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_registrations }]] = await db.execute('SELECT COUNT(*) as total_registrations FROM registrations');
    res.json({ success: true, stats: { total_events, total_users, total_registrations } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.get('/api/admin/registrations', requireAdminLogin, async (req, res) => {
  try {
    const [regs] = await db.execute(
      `SELECT r.*, e.title as event_title, e.event_date, e.category 
       FROM registrations r JOIN events e ON r.event_id = e.id
       ORDER BY r.registered_at DESC`
    );
    res.json({ success: true, registrations: regs });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.get('/api/admin/users', requireAdminLogin, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, full_name, email, student_id, department, phone, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.post('/api/admin/events', requireAdminLogin, upload.single('event_image'), async (req, res) => {
  const { title, description, event_date, location, category, max_seats, image_url } = req.body;
  if (!title || !event_date) return res.json({ success: false, message: 'Title and date are required.' });
  try {
    let imgUrl = image_url || null;
    if (req.file) imgUrl = '/uploads/' + req.file.filename;
    await db.execute(
      'INSERT INTO events (title, description, event_date, location, category, image_url, max_seats) VALUES (?,?,?,?,?,?,?)',
      [title, description, event_date, location, category || 'General', imgUrl, max_seats || 100]
    );
    res.json({ success: true, message: 'Event created successfully!' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/events/:id', requireAdminLogin, async (req, res) => {
  try {
    await db.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.delete('/api/admin/registrations/:id', requireAdminLogin, async (req, res) => {
  try {
    await db.execute('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Registration removed.' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// ==================== START ====================
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🎓 Vel Tech Campus Portal running at http://localhost:${PORT}`);
    console.log(`   Admin: http://localhost:${PORT}/admin/login`);
    console.log(`   Credentials: veltech_admin / admin@veltech123\n`);
  });
});
