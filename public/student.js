import { getQuizByCode, loadQuizzes } from "./QuizManager.js";

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const quizCode = document.getElementById('student-code').value.trim();

    const quiz = getQuizByCode(quizCode);
    // Check if the quiz code exists in the quizzes object
    if (quiz == {}) {
      alert("Invalid quiz code. Please try again.");
    } else {
        
    }
  });