// Import the `loadQuizzes` function from QuizManager.js
import { loadQuizzes, deleteQuiz } from './QuizManager.js';

// Check if the user is logged in
const username = sessionStorage.getItem('username');
if (!username) {
  alert('You are not logged in. Redirecting to login page.');
  window.location.href = './login';
} else {
  document.getElementById('mentorWelcome').innerText = `Welcome, ${username}!`;
}

// Function to display quizzes on the Mentor page
function displayQuizzes() {
  loadQuizzes();
  
}

// Initialize the display when the page loads
document.addEventListener('DOMContentLoaded', displayQuizzes);
