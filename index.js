// Importing required modules:
const express = require("express"); 
const mysql = require("mysql"); 
const dotenv = require("dotenv"); 
const path = require("path"); 
const cookieParser = require('cookie-parser'); 
const { error, time } = require("console");
const port = 5000;


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

app.post("/api/quiz/takequiz/", (req, res) => {
    const quizCode = req.query.code;

    if(!quizCode){
        console.log("Quiz code is required!");
        return res.status(500).json({});
    }

    const quizQuery = 'SELECT * FROM QUIZZES WHERE QUIZ_CODE = ?';

    db.query(quizQuery, [quizCode], (err, quizResults) => {

        if (err) {
            console.log("Error fetching the quiz.");
            return res.status(500).json({});
        }

        if (quizResults.length === 0) {
            console.log("No quizzes found!");
            return res.status(404).json({});
        }

        const quiz = quizResults[0];

        const questionQuery = 'SELECT * FROM QUESTIONS WHERE QUIZ_CODE = ?';

        db.query(questionQuery, [quizCode], (err, questionResults) => {
            if (err) {
                console.log("Error fetching questions.");
                return res.status(500).json({});
            }

            const questions = [];
            let questionsProcessed = 0;

            for(let question in questionResults)  {
                const optionsQuery = 'SELECT * FROM OPTIONS WHERE QUESTION_TEXT = ?';

                db.query(optionsQuery, [question.QUESTION_TEXT], (err, optionResults) => {
                    if (err) {
                        console.log("Error fetching options.");
                        return res.status(500).json({});
                    }

                    const options = optionResults.map(opt => opt.OPTION_TEXT);
                    const answer = optionResults.find(opt => opt.IS_CORRECT)?.OPTION_TEXT || '';

                    questions.push({
                        question: question.QUESTION_TEXT,
                        options: options,
                        answer: answer,
                        type: question.QUESTION_TYPE
                    });

                    questionsProcessed++;

                    if (questionsProcessed === questionResults.length) {
                        res.json({
                            username: quiz.USERNAME,
                            code: quiz.QUIZ_CODE,
                            title: quiz.TITLE,
                            timeLimit: quiz.TIME_LIMIT,
                            questions: questions
                        });
                    }
                });
            };
        });
    });
});

// creates/update a quiz
app.post("/api/quiz/create", (req, res) => {
    const { username, questions, title, code, timeLimit } = req.body; 

    var query = `SELECT * FROM Questions WHERE Quiz_CODE = ?`;
   // deletes full quiz. if it already exists
    db.query(query, [code], (error, result) => {
        if(result.length > 0){
            // removes options
            for(let question in questions) {
                optionsQuery = `DELETE * FROM OPTIONS WHERE Question_CODE = ?`;
                db.query(optionsQuery, [question.QUESTION_TEXT], (error, result) => {
                    if(error){
                        console.log(" couldn't delete options");
                    } else {
                        console.log("options removed succefully ");
                    }
                });
            };
            // removes questions 
            var query = `DELETE * FROM Questions WHERE Quiz_CODE = ?`;
            db.query(query, [code], (error, result) => {
                if(error){
                    console.log(" couldn't delete questions");
                } else {
                    console.log("questions removed succefully ");
                }
            });
            // removes quiz. 
            var query = `DELETE * FROM Quizzes WHERE Quiz_CODE = ?`;
            db.query(query, [code], (error, result) => {
                if(error){
                    console.log(" couldn't delete quiz");
                } else {
                    console.log("quiz removed succefully ");
                }
            });
        }
    });

    console.log(code + username + title + timeLimit);
    var query = `INSERT INTO QUIZZES (quiz_code, USERNAME, title, time_limit) VALUES (${code}, ${username}, ${title}, ${timeLimit} );`;
    db.query(query,  (error, result) =>{
        if(error){
            console.log("couldn't insert quiz 1 " + error)
        } else {
            console.log(result);
        }
    });

    // inserting questions.
    for(let element in questions) {
        var questionQuery = `INSERT INTO  QUESTIONS (QUIZ_CODE, QUESTION_TEXT, QUESTION_TYPE) VALUES(${code}, ${element.question}, ${element.type});`;
        db.query(questionQuery, (error, result) =>{
            if(error){
                console.log("couldn't insert quiz");
            } else {
                console.log(result);
            }
        });
        for(let answer in element){
            var optionsQuery = `INSERT INTO  OPTIONS ( QUESTION_TEXT, OPTION_TEXT, QUESTION_TYPE, IS_CORRECT) VALUES( ${element.question}, ${answer}, ${element.type}, ${answer === element.answer})`;
              db.query(optionsQuery, (error, result) =>{
              if(error){
                  console.log("Error inserting options");
              } else {
                  console.log("added option");
              }
              });
        };

    };
});

// delete quiz.
app.delete("/api/quiz/delete/", (req, res) => {
    const code = req.body.code;
    var query = `SELECT * FROM Questions WHERE Quiz_CODE = ?`;
   
    db.query(query, [code], (req, res) => {
        // removes options
        for(let question in req.body.questions) {
            optionsQuery = `DELETE * FROM OPTIONS WHERE Question_CODE = ?`;
            db.query(optionsQuery, [question.QUESTION_TEXT], (error, result) => {
                if(error){
                    console.log(" couldn't delete options");
                } else {
                    console.log("options removed succefully ");
                }
            });
        };
    });
    // removes questions 
    var query = `DELETE * FROM Questions WHERE Quiz_CODE = ?`;
    db.query(query, [code], (error, result) => {
        if(error){
            console.log(" couldn't delete quiz");
        } else {
            console.log("quiz removed succefully ");
        }
    });
    // removes quiz.
    var query = `DELETE * FROM Quizzes WHERE Quiz_CODE = ?`;
    db.query(query, [code], (error, result) => {
        if(error){
            console.log(" couldn't delete quiz");
        } else {
            console.log("quiz removed succefully ");
        }
    });
});

app.post("/api/quiz/home/", (req, res) => {
    console.log(req);
    const username = req.body.username; 

    if (!username) {
        console.log("Please provide username!!");
        return res.status(500).json({}); // empty JSON object sent back
    }

    const quizzesQuery = 'SELECT * FROM QUIZZES WHERE USERNAME = ?';

    db.query(quizzesQuery, [username], (err, quizResults) => {
        if (err) {
            console.log("Error fetching quizzes.");
            return res.status(500).json({}); // empty JSON object sent back
        }

        if (quizResults.length === 0) {
            console.log("No quizzes found for this mentor.");
            return res.status(200).json({}); // empty JSON object sent back
        }

        const quizzes = []; 
        let processedQuizzes = 0;

        for(let quiz in quizResults)  {
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
                        return res.json(quizzes);
                    }
                } else {
                    for(let question in questionResults)  {
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
                                    return res.json(quizzes);
                                }
                            }
                        });
                    };
                }
            });
        };
    });
});

            

// Define the routes for the application
// '/' route is handled by the 'pages' module
app.use('/', require('./routes/pages'));

// '/auth' route is handled by the 'auth' module
app.use('/auth', require('./routes/auth'));

app.listen(port, () => {
    console.log("Server is running on port " + port);
});