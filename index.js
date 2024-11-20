// Importing required modules:
const express = require("express"); 
const mysql = require("mysql"); 
const dotenv = require("dotenv"); 
const path = require("path"); 
const cookieParser = require('cookie-parser'); 
const { error, time } = require("console");
const { type } = require("os");
const port = 8000;


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

    if (!quizCode) {
        console.log("Quiz code is required!");
        return res.status(500).send(null);
    }

    const quizQuery = 'SELECT * FROM QUIZZES WHERE QUIZ_CODE = ?';

    // Fetch the quiz
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

        // Fetch questions
        db.query(questionsQuery, [quizCode], (err, questionResults) => {
            if (err) {
                console.log("Error fetching questions.");
                return res.status(500).json({});
            }

            if (questionResults.length === 0) {
                console.log("No questions found for the quiz.");
                return res.json({
                    username: quiz.USERNAME,
                    code: quiz.QUIZ_CODE,
                    title: quiz.TITLE,
                    timeLimit: quiz.TIME_LIMIT,
                    questions: []
                });
            }

            const questions = [];
            let processedQuestions = 0;

            for (let i in questionResults) {
                const optionsQuery = 'SELECT * FROM OPTIONS WHERE QUESTION_TEXT = ?';

                // Fetch options for each question
                db.query(optionsQuery, [questionResults[i].QUESTION_TEXT], (err, optionResults) => {
                    if (err) {
                        console.log("Error fetching options.");
                        return res.status(500).json({});
                    }

                    const options = optionResults.map((opt) => opt.OPTION_TEXT);
                    const answer = optionResults.find((opt) => opt.IS_CORRECT)?.OPTION_TEXT || '';

                    // Add the question and its options
                    questions.push({
                        question: questionResults[i].QUESTION_TEXT,
                        options: JSON.stringify(options),
                        answer: answer,
                        type: questionResults[i].QUESTION_TYPE
                    });

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

    const quizQuery = 'SELECT * FROM QUIZZES WHERE QUIZ_CODE = ?;';
    db.query(quizQuery, [code], (err, quizResults) => {
        if (err) {
            console.log("Error fetching quiz.");
        }

        if (quizResults.length === 0) {
            console.log("Quiz not found.");
            insertQuiz();
        }
        
        if(quizResults.length > 0){
              console.log("Quiz found:", quizResults[0]);

            // Fetch all questions for the quiz
            const questionsQuery = 'SELECT * FROM QUESTIONS WHERE QUIZ_CODE = ?;';
            db.query(questionsQuery, [code], (err, questionResults) => {
                if (err) {
                    console.log("Error fetching questions!");
                }

                console.log("Questions found:", questionResults);

                if (questionResults.length === 0) {
                    // If no questions, proceed to delete the quiz
                    return deleteQuiz();
                }

                let processedQuestions = 0;

                // Delete options for each question
                for (let i in questionResults) {
                    const optionsQuery = 'DELETE FROM OPTIONS WHERE QUESTION_TEXT = ?;';
                    db.query(optionsQuery, [questionResults[i].QUESTION_TEXT], (err, optionResults) => {
                        if (err) {
                            console.log("Error deleting options for question:", questionResults[i].QUESTION_TEXT);
                        }

                        console.log("Options deleted for question:", questionResults[i].QUESTION_TEXT);
                        processedQuestions++;

                        if (processedQuestions === questionResults.length) {
                            // Once all options are deleted, delete the questions
                            deleteQuestions();
                        }
                    });
                }

                // Delete all questions for the quiz
                function deleteQuestions() {
                    const deleteQuestionsQuery = 'DELETE FROM QUESTIONS WHERE QUIZ_CODE = ?;';
                    db.query(deleteQuestionsQuery, [code], (err, result) => {
                        if (err) {
                            console.log("Error deleting questions!");
                        }

                        console.log("Questions deleted for quiz code:", code);
                        deleteQuiz();
                    });
              
                }  
            });// Delete the quiz itself
            function deleteQuiz() {
                const deleteQuizQuery = 'DELETE FROM QUIZZES WHERE QUIZ_CODE = ?;';
                db.query(deleteQuizQuery, [code], (err, result) => {
                    if (err) {
                        console.log("Error deleting quiz!");
                    }
                    console.log("Quiz deleted successfully:", code);
                    insertQuiz();
                });
                }
        }

        
      
    });
    function insertQuiz() {
            // inserting quiz into quizzes table.
        var query = `INSERT INTO QUIZZES (quiz_code, USERNAME, title, time_limit) VALUES (?, ?, ?, ?);`;
        db.query(query, [code, username, title, timeLimit] ,(error, result) =>{
            if(error){
                console.log("couldn't insert quiz 1 " + error)
            } else {
                console.log("inserted");
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
    }
   
});

// delete quiz.
app.post("/api/quiz/delete", (req, res) => {
    const code = req.body.code;

    if (!code) {
        console.log("Quiz code is required!");
    }

    console.log("Deleting quiz with code:", code);

    // Fetch the quiz details
    const quizQuery = 'SELECT * FROM QUIZZES WHERE QUIZ_CODE = ?;';
    db.query(quizQuery, [code], (err, quizResults) => {
        if (err) {
            console.log("Error fetching quiz.");
        }

        if (quizResults.length === 0) {
            console.log("Quiz not found.");
        }

        console.log("Quiz found:", quizResults[0]);

        // Fetch all questions for the quiz
        const questionsQuery = 'SELECT * FROM QUESTIONS WHERE QUIZ_CODE = ?;';
        db.query(questionsQuery, [code], (err, questionResults) => {
            if (err) {
                console.log("Error fetching questions!");
            }

            console.log("Questions found:", questionResults);

            if (questionResults.length === 0) {
                // If no questions, proceed to delete the quiz
                return deleteQuiz();
            }

            let processedQuestions = 0;

            // Delete options for each question
            for (let i in questionResults) {
                const optionsQuery = 'DELETE FROM OPTIONS WHERE QUESTION_TEXT = ?;';
                db.query(optionsQuery, [questionResults[i].QUESTION_TEXT], (err, optionResults) => {
                    if (err) {
                        console.log("Error deleting options for question:", questionResults[i].QUESTION_TEXT);
                    }

                    console.log("Options deleted for question:", questionResults[i].QUESTION_TEXT);
                    processedQuestions++;

                    if (processedQuestions === questionResults.length) {
                        // Once all options are deleted, delete the questions
                        deleteQuestions();
                    }
                });
            }

            // Delete all questions for the quiz
            function deleteQuestions() {
                const deleteQuestionsQuery = 'DELETE FROM QUESTIONS WHERE QUIZ_CODE = ?;';
                db.query(deleteQuestionsQuery, [code], (err, result) => {
                    if (err) {
                        console.log("Error deleting questions!");
                    }

                    console.log("Questions deleted for quiz code:", code);
                    deleteQuiz();
                });
            }
        });

        // Delete the quiz itself
        function deleteQuiz() {
            const deleteQuizQuery = 'DELETE FROM QUIZZES WHERE QUIZ_CODE = ?;';
            db.query(deleteQuizQuery, [code], (err, result) => {
                if (err) {
                    console.log("Error deleting quiz!");
                }

                console.log("Quiz deleted successfully:", code);
            });
        }
    });
});




// send a json file with all the mentor quizzes.
app.post("/api/quiz/home", (req, res) => {

    const username = req.body.username; 
   
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

                            const options = optionResults.map((opt) => opt.OPTION_TEXT); 
                    
                            const answer = optionResults.find((opt) => opt.IS_CORRECT)?.OPTION_TEXT || ''; 

                            questions.push({ 
                                question: questionResults[i].QUESTION_TEXT,
                                options:  JSON.stringify(options),
                                answer: answer,
                                type: questionResults[i].QUESTION_TYPE
                            });

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