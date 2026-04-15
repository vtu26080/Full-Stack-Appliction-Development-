const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456", // change if needed
    database: "student_db"
});

db.connect((err) => {
    if (err) {
        console.log("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});


// ================= REGISTER API =================
app.post("/register", (req, res) => {

    const { fullname, VTU_NO, email, phone, course } = req.body;

    if (!fullname || !VTU_NO || !email || !phone || !course) {
        return res.status(400).send("All fields are required!");
    }

    const sql = `
        INSERT INTO students (fullname, VTU_NO, email, phone, course)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [fullname, VTU_NO, email, phone, course], (err, result) => {
        if (err) {
            console.log("❌ SQL Error:", err);
            return res.status(500).send("Database Error");
        }

        res.send("🎉 Student Registered Successfully!");
    });
});


// ================= LOGIN API =================
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("All fields are required!");
    }

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {
            console.log("❌ SQL Error:", err);
            return res.status(500).send("Database Error");
        }

        if (result.length > 0) {
            res.send("success");
        } else {
            res.send("Invalid Email or Password");
        }
    });
});


app.listen(3000, () => {
    console.log("🚀 Server running at http://localhost:3000");
    console.log("🚀 Server running at http://localhost:3000/login.html");
});