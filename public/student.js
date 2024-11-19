import { loadQuizzes } from "./QuizManager.js";

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const quizCode = document.getElementById('student-code').value.trim();
    const quizzes = loadQuizzes();


    // Check if the quiz code exists in the quizzes object
    if (quizzes[quizCode]) {
      // Redirect to Quiz.html with the quiz code as a URL parameter
      window.location.href = `/Quiz?code=${quizCode}`;
    } else {
      alert("Invalid quiz code. Please try again.");
    }
  });