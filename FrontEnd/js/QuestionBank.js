// QuestionBank.js

// Store quizzes in localStorage to persist data
const loadQuestionBank = () => {
    const stored = localStorage.getItem('questionBank');
    return stored ? JSON.parse(stored) : {};
  };
  
  const saveQuestionBank = (questionBank) => {
    localStorage.setItem('questionBank', JSON.stringify(questionBank));
  };
  
  let questionBank = loadQuestionBank();
  
  // Function to generate a unique quiz code (6-digit random code)
  function generateQuizCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  // Function to add a new quiz to the question bank
  function addQuiz(quizCode, quizTitle, questions) {
    console.log('Adding quiz:', { quizCode, quizTitle, questions });
    
    const quiz = {
        code: quizCode,
        title: quizTitle,
        questions: questions
    };
    
    questionBank[quizCode] = quiz;
    saveQuestionBank(questionBank);
    console.log('Updated question bank:', questionBank);
    return true;
  }
  
  // Function to fetch a quiz by its code
  function getQuizByCode(quizCode) {
    console.log('Fetching quiz with code:', quizCode);
    console.log('Available quizzes:', questionBank);
    return questionBank[quizCode] || null;
  }
  
  // Export functions for use in other files
  export { generateQuizCode, addQuiz, getQuizByCode };
  
  // Add example quiz
  const exampleQuiz = {
    title: "JavaScript Basics",
    questions: [
        {
            question: "What is the output of `console.log(typeof null)`?",
            options: ["object", "null", "undefined", "number"],
            answer: "object"
        },
        {
            question: "Which company developed JavaScript?",
            options: ["Netscape", "Microsoft", "Google", "Apple"],
            answer: "Netscape"
        },
        {
            question: "What does `NaN` stand for?",
            options: ["Not a Number", "Not a Null", "Not a Name", "Not a Node"],
            answer: "Not a Number"
        }
    ]
  };
  
  const quizCode = "FIXEDCODE";
  addQuiz(quizCode, exampleQuiz.title, exampleQuiz.questions);