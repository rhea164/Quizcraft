import { getQuizByCode } from "./QuizManager.js";

//adding event listener for form submission
document.querySelector('form').addEventListener('submit',async (event) => {
  // Prevent the default form submission
    event.preventDefault();
    
    // Get the quiz code from the input field
    const quizCode = document.getElementById('student-code').value.trim();

    // Get the quiz data from the server
    getQuizByCode(quizCode);
    const quiz = setTimeout(sessionStorage.getItem('quiz'),1000);
    console.log(quiz);
    // Check if the quiz exists
    if (quiz == {}) {
      alert("Invalid quiz code. Please try again.");
    }else {
      // Redirect to the quiz page if the quiz exists
      window.location.href = `/Quiz?code=${quizCode}`;
    } 
    
    
  });