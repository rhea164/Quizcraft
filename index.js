// Importing required modules:
const express = require("express"); 
const mysql = require("mysql"); 
const dotenv = require("dotenv"); 
const path = require("path"); 
const cookieParser = require('cookie-parser'); 


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

app.get("")
// Define the routes for the application
// '/' route is handled by the 'pages' module
app.use('/', require('./routes/pages'));

// '/auth' route is handled by the 'auth' module
app.use('/auth', require('./routes/auth'));


app.listen(5000, () => {
    console.log("Server is running on 5000");
});