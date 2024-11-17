// Importing required modules:
const express = require("express"); // Express framework for creating the server
const mysql = require("mysql"); // MySQL module for database connection
const dotenv = require("dotenv"); // To load environment variables from a .env file
const path = require("path"); // To work with file and directory paths
const cookieParser = require('cookie-parser'); // Middleware to parse cookies

// Define the port number on which the server will run
const port = 5000;

// Creating an instance of the Express application
const app = express();

// Configuring dotenv to read environment variables from a .env file
dotenv.config({path: './.env'});

// connecting to the database.
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST, // Database host 
    user: process.env.DATABASE_USER, // Database username
    password: process.env.DATABASE_PASSWORD, // Database password
    database: process.env.DATABASE // Database name
});

// Set up the public directory for serving static files like CSS and JavaScript
const publicDirectory = path.join(__dirname, './public'); // Join the current directory with 'public'
app.use(express.static(publicDirectory)); // Make the public directory accessible

// Middleware to parse JSON data in incoming requests
// Allows the server to handle requests with JSON payloads
app.use(express.json());

// Middleware to parse URL-encoded data (e.g., form submissions)
// extended: false means it only supports simple objects (not nested)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies from incoming HTTP requests
app.use(cookieParser());

// Set the view engine to 'hbs' (Handlebars) for rendering dynamic pages
app.set('view engine', 'hbs');


// Connect to the MySQL database
db.connect((error) => {
    if (error) {
        console.log(error); // Log an error if the connection fails
    } else {
        console.log("MySQL connected..."); // Confirm successful connection
    }
});

// Define the routes for the application
// '/' route is handled by the 'pages' module
app.use('/', require('./routes/pages'));

// '/auth' route is handled by the 'auth' module
app.use('/auth', require('./routes/auth'));


app.listen(5000, () => {
    console.log("Server is running on 5000");
});