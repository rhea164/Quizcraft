// Importing required modules:
const express = require("express"); 
const mysql = require("mysql"); 
const dotenv = require("dotenv"); 
const path = require("path"); 
const cookieParser = require('cookie-parser'); 
const { error, time } = require("console");
const { type } = require("os");
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

app.post("/api/quiz/takequiz", (req, res) => {
    const quizCode = req.body.code;
    // if there is no quiz code
    if (!quizCode) {
        console.log("Quiz code is required!");
        return res.status(500).send(null); 
    }

    const quizQuery = 'SELECT * FROM QUIZZES WHERE QUIZ_CODE = ?';
    // gets the quiz.
    db.query(quizQuery, [quizCode], (err, quizResults) => {
        if (err) {
            console.log("Error fetching the quiz.");
            return res.status(500).send(null);
        }

        if (quizResults.length === 0) {
            console.log("No quizzes found!");
            return res.status(404).json({});
        }

        const quiz = quizResults[0];
        const questionsQuery = 'SELECT * FROM QUESTIONS WHERE QUIZ_CODE = ?';

        db.query(questionsQuery, [quizCode], (err, questionResults) => {
            if (err) {
                console.log("Error fetching questions.");
                return res.status(500).json({});
            }

            const questions = []; // Array to store questions with options
            let processedQuestions = 0;
            // gets all the questions.
            for (let i in questionResults) {
                const optionsQuery = 'SELECT * FROM OPTIONS WHERE QUESTION_TEXT = ?';

                db.query(optionsQuery, [questionResults[i].QUESTION_TEXT], (err, optionResults) => {
                    if (err) {
                        console.log("Error fetching options.");
                        return res.status(500).json({});
                    }

                    const options = optionResults.map((opt) => opt.OPTION_TEXT); // Extract option text
                    const answer = optionResults.find((opt) => opt.IS_CORRECT)?.OPTION_TEXT || ''; // Correct answer
                    // adds 1 question at a time.
                    questions.push({
                        question: questionResults[i].QUESTION_TEXT,
                        options: JSON.stringify(options),
                        answer: answer,
                        type: questionResults[i].QUESTION_TYPE
                    });
                    // if all questions have been added send back the quiz.
                    processedQuestions++;
                    if (processedQuestions === questionResults.length) {
                        // Send the response once all questions are processed
                        return res.json({
                            username: quiz.USERNAME,
                            code: quiz.QUIZ_CODE,
                            title: quiz.TITLE,
                            timeLimit: quiz.TIME_LIMIT,
                            questions: JSON.stringify(questions)
                        });
                    }
                });
            }
        });
    });
});

// creates/update a quiz
app.post("/api/quiz/create", (req, res) => {
    const { username, questions, title, code, timeLimit } = req.body; 

    var query = `SELECT * FROM Questions WHERE Quiz_CODE = ?`;
   // deletes full quiz. to be replaced for update if it already exists.
    db.query(query, [code], (error, result) => {
        if(result.length > 0){
            // removes options
            for(let index in questions) {
                optionsQuery = `DELETE FROM OPTIONS WHERE Question_TEXT = ?`;
                db.query(optionsQuery, [questions[index].question], (error, result) => {
                    if(error){
                        console.log(" couldn't delete options");
                    } else {
                        console.log("options removed succefully ");
                    }
                });
            };
            // removes questions 
            var query = `DELETE FROM Questions WHERE Quiz_CODE = ?`;
            db.query(query, [code], (error, result) => {
                if(error){
                    console.log(" couldn't delete questions");
                } else {
                    console.log("questions removed succefully ");
                }
            });
            // removes quiz. 
            var query = `DELETE FROM Quizzes WHERE Quiz_CODE = ?`;
            db.query(query, [code], (error, result) => {
                if(error){
                    console.log(" couldn't delete quiz");
                } else {
                    console.log("quiz removed succefully ");
                }
            });
        }
    });
    // inserting quiz into quizzes table.
    var query = `INSERT INTO QUIZZES (quiz_code, USERNAME, title, time_limit) VALUES (?, ?, ?, ?);`;
    db.query(query, [code, username, title, timeLimit] ,(error, result) =>{
        if(error){
            console.log("couldn't insert quiz 1 " + error)
        } else {
            console.log(result);
        }
    });

    // inserting questions.
    for (let i in questions) {
       
        var questionQuery = `INSERT INTO  QUESTIONS (QUIZ_CODE, QUESTION_TEXT, QUESTION_TYPE) VALUES(?, ?, ?);`;
        db.query(questionQuery, [code, questions[i].question, questions[i].type], (error, result) =>{
            if(error){
                console.log("couldn't insert quiz");
            } else {
                console.log(result);
            }
        });
        // inserting options
        for(let ind in questions[i].options){
            var optionsQuery = `INSERT INTO  OPTIONS (QUESTION_TEXT, OPTION_TEXT, IS_CORRECT) VALUES(?, ?, ?)`;
            let correct = questions[i].options[ind] === questions[i].answer;
            db.query(optionsQuery, [questions[i].question, questions[i].options[ind], correct], (error, result) =>{
              if(error){
                  console.log("Error inserting options " + error);
              } else {
                  console.log("added option");
              }
            });
        };

    };
});

// delete quiz.
app.delete("/api/quiz/delete", (req, res) => {
    const {code, questions }= req.body;
    var query = `SELECT * FROM Questions WHERE Quiz_CODE = ?`;
   
    db.query(query, [code], (req, res) => {
        // removes options
        for(let index in questions) {
            optionsQuery = `DELETE FROM OPTIONS WHERE Question_TEXT = ?`;
            db.query(optionsQuery, [questions[index].question], (error, result) => {
                if(error){
                    console.log(" couldn't delete options");
                } else {
                    console.log("options removed succefully ");
                }
            });
        };
    });
    // removes questions 
    var query = `DELETE FROM Questions WHERE Quiz_CODE = ?`;
    db.query(query, [code], (error, result) => {
        if(error){
            console.log(" couldn't delete quiz");
        } else {
            console.log("quiz removed succefully ");
        }
    });
    // removes quiz.
    var query = `DELETE FROM Quizzes WHERE Quiz_CODE = ?`;
    db.query(query, [code], (error, result) => {
        if(error){
            console.log(" couldn't delete quiz");
        } else {
            console.log("quiz removed succefully ");
        }
    });
});
// send a json file with all the mentor quizzes.
app.post("/api/quiz/home", (req, res) => {

    const username = req.body.username; 
    console.log(username);
    if (!username) {
        console.log("Please provide username!!");
        return res.status(500).json({}); // empty JSON object sent back
    }

    var quizzesQuery = 'SELECT * FROM QUIZZES WHERE USERNAME = ?;';

    db.query(quizzesQuery, [username], (err, quizResults) => {
        if (err) {
            console.log("Error fetching quizzes.");
            return res.status(500).json({}); // empty JSON object sent back
        }
        console.log("quiz " + quizResults);
        if (quizResults.length === 0) {
            console.log("No quizzes found for this mentor.");
            return res.status(200).json({}); // empty JSON object sent back
        }

        const quizzes = []; 
        let processedQuizzes = 0;

        for(let index in quizResults)  {
            const questionsQuery = 'SELECT * FROM QUESTIONS WHERE QUIZ_CODE = ?';
            console.log(quizResults[index]);
            console.log(quizResults[index].QUIZ_CODE);
            db.query(questionsQuery, [quizResults[index].QUIZ_CODE], (err, questionResults) => {
                if (err) {
                    console.log("Error fetching questions!");
                    return res.status(500).json({}); // empty JSON object sent back
                }

                const questions = []; // To hold all questions for this quiz
                let processedQuestions = 0;
         
                    for(let i in questionResults)  {
                        const optionsQuery = 'SELECT * FROM OPTIONS WHERE QUESTION_TEXT = ?;';

                        db.query(optionsQuery, [questionResults[i].QUESTION_TEXT], (err, optionResults) => {
                            if (err) {
                                console.log("Error fetching options.");
                                return res.status(500).json({}); // empty JSON object sent back
                            }
                            console.log("options results: " + optionResults);

                            const options = optionResults.map((opt) => opt.OPTION_TEXT); 
                            console.log(options);
                            
                            const answer = optionResults.find((opt) => opt.IS_CORRECT)?.OPTION_TEXT || ''; 
                            console.log(answer);

                            questions.push({ 
                                question: questionResults[i].QUESTION_TEXT,
                                options:  JSON.stringify(options),
                                answer: answer,
                                type: questionResults[i].QUESTION_TYPE
                            });
                            console.log(questions);
                            console.log("questions pushed");
                            processedQuestions++;
                            if (processedQuestions === questionResults.length) {
                                quizzes.push({
                                    username: quizResults[index].USERNAME,
                                    code: quizResults[index].QUIZ_CODE,
                                    title: quizResults[index].TITLE,
                                    timeLimit: quizResults[index].TIME_LIMIT,
                                    questions: JSON.stringify(questions)
                                });

                               
                            processedQuizzes++;
                              
                                if (processedQuizzes === quizResults.length) {
                                  console.log("quizzes pushed ");
                                  console.log(quizzes);
                                return res.json(quizzes);
                            }
                        }
                    });
                };
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