import { getQuizByCode } from "./QuizManager.js";

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const quizCode = document.getElementById('student-code').value.trim();

    const quiz = getQuizByCode(quizCode);
    if (quiz == null) {
      alert("Invalid quiz code. Please try again.");
    }
    if(quiz) window.location.href = `/Quiz?code=${quizCode}`;
    
  });