import { getQuizByCode } from "./QuizManager.js";

document.querySelector('form').addEventListener('submit',async (event) => {
    event.preventDefault();
    
    const quizCode = document.getElementById('student-code').value.trim();

    await getQuizByCode(quizCode);
    const quiz = sessionStorage.getItem('quiz');
    console.log(quiz);
    if (quiz == null) {
      alert("Invalid quiz code. Please try again.");
    }
    if(quiz) window.location.href = `/Quiz?code=${quizCode}`;
    
  });