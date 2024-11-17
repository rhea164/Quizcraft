// Importing required modules:
const express = require("express"); 
const mysql = require("mysql"); 
const dotenv = require("dotenv"); 
const path = require("path"); 
const cookieParser = require('cookie-parser'); 
const { error } = require("console");


const app = express();

// Configuring dotenv to read environment variables from a .env file
dotenv.config({path: './.env'});


const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,  
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD, 
    database: process.env.DATABASE 
});


const publicDirectory = path.join(__dirname, './public'); 
app.use(express.static(publicDirectory)); 

// Middleware to parse JSON data in incoming requests
// Allows the server to handle requests with JSON payloads
app.use(express.json());

// Middleware to parse URL-encoded data (e.g., form submissions)
// extended: false means it only supports simple objects (not nested)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies from incoming HTTP requests
app.use(cookieParser());


// Connect to the MySQL database
db.connect((error) => {
    if (error) {
        console.log(error); // Log an error if the connection fails
    } else {
        console.log("MySQL connected..."); // Confirm successful connection
    }
});



app.get("/api/quiz/takequiz", (req, res) => {
    console.log(req);
});

app.post("/api/quiz/create", (req, res) => {
    console.log(req);
    const { username, questions, title, code, timeLimit } = req.body; 
    var query = `INSERT INTO (quiz_id, username, title, time_limit)QUIZZES VALUES (${code}, ${username}, ${title}, ${timeLimit} )`;
    db.query(query, (error, result) =>{
        if(error){
            console.log("couldn't insert quiz")
        } else {
            console.log(result);
        }
    });

    // inserting questions.
    questions.array.forEach(element => {
        var questionQuery = `INSERT INTO (QUIZ_CODE, QUESTION_TEXT, QUESTION_TYPE) QUESTIONS VALUES(${code}, ${element.question}, ${element.type})`;
        db.query(questionQuery, (error, result) =>{
            if(error){
                console.log("couldn't insert quiz");
            } else {
                console.log(result);
            }
        });
    });
});

app.get("/api/quiz/home", (req, res) => {
    console.log(req);
});

// Define the routes for the application
// '/' route is handled by the 'pages' module
app.use('/', require('./routes/pages'));

// '/auth' route is handled by the 'auth' module
app.use('/auth', require('./routes/auth'));


app.listen(5000, () => {
    console.log("Server is running on 5000");
});