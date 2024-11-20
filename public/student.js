import { getQuizByCode } from "./QuizManager.js";

document.querySelector('form').addEventListener('submit',async (event) => {
    event.preventDefault();
    
    const quizCode = document.getElementById('student-code').value.trim();

    getQuizByCode(quizCode);
    const quiz = setTimeout(sessionStorage.getItem('quiz'),1000);
    console.log(quiz);
    if (quiz == {}) {
      alert("Invalid quiz code. Please try again.");
    }else {
      window.location.href = `/Quiz?code=${quizCode}`;
    } 
    
    
  });