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



app.get("/api/quiz/takequiz/", (req, res) => {
    const quizCode = req.query.code;



    const quizQuery = 'SELECT * FROM QUIZZES WHERE QUIZ_CODE = ?';

    db.query(quizQuery, [quizCode], (err, quizResults) => {
        if (err) {
            console.log("Error fetching the quiz.");
        }

        if (quizResults.length === 0) {
            console.log("No quizzes found!")
        }

        const quiz = quizResults[0];

        const questionQuery = 'SELECT * FROM QUESTIONS WHERE QUIZ_CODE = ?';

        db.query(questionQuery, [quizCode], (err, questionResults) => {
            if (err) {
                console.log("Error fetching questions.");
            }

            const questions = [];
            questionResults.forEach((question) => {
                const optionsQuery = 'SELECT * FROM OPTIONS WHERE QUESTION_TEXT = ?';

                db.query(optionsQuery, [question.QUESTION_TEXT], (err, optionResults) => {
                    if (err) {
                        console.log("Error fetching options.")
                    }

                    const options = optionResults.map(opt => opt.OPTION_TEXT);
                    const answer = optionResults.find(opt => opt.IS_CORRECT)?.OPTION_TEXT || '';

                    questions.push({
                        question: question.QUESTION_TEXT,
                        options: options,
                        answer: answer,
                        type: question.QUESTION_TYPE
                    });

                    if (questions.length === questionResults.length) {
                        res.json({
                            username: quiz.USERNAME,
                            code: quiz.QUIZ_CODE,
                            title: quiz.TITLE,
                            timeLimit: quiz.TIME_LIMIT,
                            questions: questions
                        });
                    }
                });
            });
        });
    });
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

    questions.array.forEach(element => {
        var optionsQuery = `INSERT INTO ( QUESTION_TEXT, OPTION_TEXT, QUESTION_TYPE, IS_CORRECT) OPTIONS VALUES( ${element.question}, ${element.t})`;
        db.query(optionsQuery, (error, result) =>{
            if(error){
                console.log("Couldn't insert the quiz.");
            } else {
                console.log(result);
            }
        });
    });
});


app.get("/api/quiz/home/", (req, res) => {
    console.log(req);
    const username = req.query.username; 

    if (!username) {
        console.log("Please provide username!!");
        return res.status(200).json({}); // empty JSON object sent back
    }

    const quizzesQuery = 'SELECT * FROM QUIZZES WHERE USERNAME = ?';

    db.query(quizzesQuery, [username], (err, quizResults) => {
        if (err) {
            console.log("Error fetching quizzes.");
            return res.status(500).json({}); // empty JSON object sent back
        }

        if (quizResults.length === 0) {
            console.log("No quizzes found for this user.");
            return res.status(200).json({}); // empty JSON object sent back
        }

        const quizzes = []; 
        let processedQuizzes = 0;

        quizResults.forEach((quiz) => {
            const questionsQuery = 'SELECT * FROM QUESTIONS WHERE QUIZ_CODE = ?';

            db.query(questionsQuery, [quiz.QUIZ_CODE], (err, questionResults) => {
                if (err) {
                    console.log("Error fetching questions!");
                    return res.status(500).json({}); // empty JSON object sent back
                }

                const questions = []; // To hold all questions for this quiz
                let processedQuestions = 0;

                if (questionResults.length === 0) {
                    // If no questions, add the quiz to the result directly
                    quizzes.push({
                        username: quiz.USERNAME,
                        code: quiz.QUIZ_CODE,
                        title: quiz.TITLE,
                        timeLimit: quiz.TIME_LIMIT,
                        questions: [],
                    });

                    processedQuizzes++;
                    if (processedQuizzes === quizResults.length) {
                        res.json(quizzes);
                    }
                } else {
                    questionResults.forEach((question) => {
                        const optionsQuery = 'SELECT * FROM OPTIONS WHERE QUESTION_TEXT = ?';

                        db.query(optionsQuery, [question.QUESTION_TEXT], (err, optionResults) => {
                            if (err) {
                                console.log("Error fetching options.");
                                return res.status(500).json({}); // empty JSON object sent back
                            }

                            const options = optionResults.map((opt) => opt.OPTION_TEXT);
                            const answer = optionResults.find((opt) => opt.IS_CORRECT)?.OPTION_TEXT || '';

                            questions.push({
                                question: question.QUESTION_TEXT,
                                options: options,
                                answer: answer,
                                type: question.QUESTION_TYPE,
                            });

                            processedQuestions++;
                            if (processedQuestions === questionResults.length) {
                                quizzes.push({
                                    username: quiz.USERNAME,
                                    code: quiz.QUIZ_CODE,
                                    title: quiz.TITLE,
                                    timeLimit: quiz.TIME_LIMIT,
                                    questions,
                                });

                                processedQuizzes++;

                                if (processedQuizzes === quizResults.length) {
                                    res.json(quizzes);
                                }
                            }
                        });
                    });
                }
            });
        });
    });
});

            

// Define the routes for the application
// '/' route is handled by the 'pages' module
app.use('/', require('./routes/pages'));

// '/auth' route is handled by the 'auth' module
app.use('/auth', require('./routes/auth'));

app.listen(8000, () => {
    console.log("Server is running on 5000");
});