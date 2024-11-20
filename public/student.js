import { getQuizByCode } from "./QuizManager.js";

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const quizCode = document.getElementById('student-code').value.trim();

    getQuizByCode(quizCode);
    const quiz = sessionStorage.getItem('quiz');
    if (quiz == null) {
      alert("Invalid quiz code. Please try again.");
    }
    if(quiz) window.location.href = `/Quiz?code=${quizCode}`;
    
  });