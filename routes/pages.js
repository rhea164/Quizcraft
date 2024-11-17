const express = require('express');
const router = express.Router();
authController = require ('../controllers/auth');
const path = require("path"); // To work with file and directory paths

// Set up the public directory for serving static files like CSS and JavaScript
const publicDirectory = path.join(__dirname, './public'); // Join the current directory with 'public'
router.use(express.static(publicDirectory)); // Make the public directory accessible


// get pages.
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "index.html")); 
});

router.get("/instruction", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "instruction.html")); 
});


router.get("/mentor", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "mentor.html")); 
});

router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "signup.html")); 
});


router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "login.html")); 
});

router.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "about.html")); 
});

router.get("/createQuiz", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "createQuiz.html")); 
});

router.get("/editQuiz", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "editQuiz.html")); 
});

router.get("/student", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "student.html")); 
});
router.get("/quiz", (req, res) => {
    res.sendFile(path.join(__dirname, "../views", "quiz.html")); 
});
// end of get pages

module.exports = router;