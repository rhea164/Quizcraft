const express = require('express');
const mysql = require('mysql');
const path = require('path');
const app = express();

// connecting to the database.
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "QUIZCRAFT"
});

db.connect((error) => {
    if(error){
        console.log(error);
    }else {
        console.log("db is connected");
    }
}); 

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// get pages.
app.get("/", (req, res) => {
    res.sendFile( path.join(__dirname, "./views", "index.html")); 
});
app.get("/instruction", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "instruction.html")); 
});
app.get("/mentor", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "mentor.html")); 
});
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "signup.html")); 
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "login.html")); 
});
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "about.html")); 
});
app.get("/createQuiz", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "createQuiz.html")); 
});
app.get("/editQuiz", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "editQuiz.html")); 
});
app.get("/student", (req, res) => {
    res.sendFile(path.join(__dirname, "./views", "student.html")); 
});
// end of get pages.

app.listen(3000, () => {
    console.log("Server is running on 3000");
});