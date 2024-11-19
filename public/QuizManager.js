// QuizManager.js

// Store quizzes in sessionStorage to persist data
const loadQuizzes = () => {
  const stored = null;
    fetch("http://localhost:5000/api/quiz/home",
      { method: 'GET',headers: {'Content-Type': 'application/json',}})
      .then(response => response.json())
      .then(data => {stored = data})
      .catch(error => console.log("MENTOR HOME PAGE ERROR:" + error));
    
    return stored ? JSON.parse(stored) : {};
  };
  
  function setUsername(username) {
    sessionStorage.setItem('username', username);
}

function getUsername() {
    return sessionStorage.getItem('username');
}

  let quizzes = loadQuizzes();
  
  // Function to generate a unique quiz code (6-digit random code)
  function generateQuizCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  // Function to add a new quiz to the question bank
  function addQuiz(username,quizCode, quizTitle, questions,timeLimit) {
    const quiz = {
        username: username,
        code: quizCode,
        title: quizTitle,
        questions: questions,
        timeLimit: timeLimit
    };
    fetch("http://localhost:5000/api/quiz/create",
      {method: 'POST', headers: { 'Content-Type' : 'application/json'}, body: JSON.stringify(quiz)})
       .then(response => console.log(response.status))
       .catch(error => console.log("POST ERROR :" + error));
    return true;
  }

  function deleteQuiz(quizCode) {
    console.log('Deleting quiz with code:', quizCode);
    fetch("http://localhost:5000/api/quiz/delete", {method: 'DELETE'})
    .then(res => console.log(res.status));
    displayQuizzes();
  };
  
  // Function to fetch a quiz by its code
  function getQuizByCode(quizCode) {
    const quiz = null;
    fetch("http://localhost:5000/api/quiz/takequiz",
       { method: 'GET',headers: {'Content-Type': 'application/json',}})
       .then(response => response.json())
       .then(data => {quiz = data})
       .catch(error => console.log("STUDENT CODE ERROR:" + error));
    return quiz;
  }
  
  // Export functions for use in other files
  export { generateQuizCode, addQuiz, getQuizByCode, deleteQuiz };

  // Add example quiz
  const exampleQuiz = {
    username: "mike",
    code: "12345",
    title: "JavaScript Basics",
    timeLimit:60,
    questions: [
        {
            question: "What is the output of `console.log(typeof null)`?",
            options: ["object", "null", "undefined", "number"],
            answer: "object",
            type:"MCQ"
        },
        {
            question: "Which company developed JavaScript?",
            options: ["Netscape", "Microsoft", "Google", "Apple"],
            answer: "Netscape",
            type:"MCQ"
        },
        {
            question: "What does `NaN` stand for?",
            options: ["Not a Number", "Not a Null", "Not a Name", "Not a Node"],
            answer: "Not a Number",
            type:"MCQ"
        },
    ]
  };

  addQuiz(exampleQuiz.username,exampleQuiz.code, exampleQuiz.title, exampleQuiz.questions,exampleQuiz.timeLimit);

  export { loadQuizzes };