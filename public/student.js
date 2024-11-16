document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const quizCode = document.getElementById('student-code').value.trim();
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};


    // Check if the quiz code exists in the quizzes object
    if (quizzes[quizCode]) {
      // Redirect to Quiz.html with the quiz code as a URL parameter
      window.location.href = `Quiz.html?code=${quizCode}`;
    } else {
      alert("Invalid quiz code. Please try again.");
    }
  });