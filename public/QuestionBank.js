// QuestionBank.js

// Store quizzes in sessionStorage to persist data
const loadQuizzes = () => {
    const stored = sessionStorage.getItem('quizzes');
    return stored ? JSON.parse(stored) : {};
  };
  
  const saveQuizzes = (quizzes) => {
    sessionStorage.setItem('quizzes', JSON.stringify(quizzes));
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
    console.log('Adding quiz:', { quizCode, quizTitle, questions,timeLimit });
    
    const quiz = {
        username: username,
        code: quizCode,
        title: quizTitle,
        questions: questions,
        timeLimit: timeLimit
    };
    
    quizzes[quizCode] = quiz;
    saveQuizzes(quizzes);
    console.log('Updated quizzes:', quizzes);
    return true;
  }
  
  // Function to fetch a quiz by its code
  function getQuizByCode(quizCode) {
    console.log('Fetching quiz with code:', quizCode);
    console.log('Available quizzes:', quizzes);
    return quizzes[quizCode] || null;
  }
  
  // Export functions for use in other files
  export { generateQuizCode, addQuiz, getQuizByCode };

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

  export { loadQuizzes, saveQuizzes, getQuizByCode };