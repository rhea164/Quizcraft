// Import the `loadQuizzes` function from QuestionBank.js
import { loadQuizzes } from './QuestionBank.js';

// Check if the user is logged in
const username = sessionStorage.getItem('username');
if (!username) {
  alert('You are not logged in. Redirecting to login page.');
  window.location.href = './login.html';
} else {
  document.getElementById('mentorWelcome').innerText = `Welcome, ${username}!`;
}

// Function to display quizzes on the Mentor page
function displayQuizzes() {
  const quizzes = loadQuizzes();
  const tableBody = document.querySelector('tbody');

  // Clear the table body
  tableBody.innerHTML = '';

  // Check if there are any quizzes stored
  if (Object.keys(quizzes).length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="text-center">No quizzes available</td></tr>`;
    return;
  }

  // Loop through quizzes and create table rows
  Object.values(quizzes).forEach((quiz) => {
    const row = document.createElement('tr');

    // Create table cells
    row.innerHTML = `
      <td>${quiz.title}</td>
      <td>${quiz.questions.length}</td>
      <td>${quiz.code}</td>
      <td>${quiz.timeLimit} minutes</td>
      <td>
        <div class="d-flex  justify-content-around">
        <button class="btn btn-primary edit-btn" data-code="${quiz.code}">Edit</button>
        <button class="btn btn-danger delete-btn" data-code="${quiz.code}">Delete</button>
        </div>
      </td>
    `;

    // Append the row to the table body
    tableBody.appendChild(row);
  });

  // Add click event to all edit buttons
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const quizCode = event.target.getAttribute('data-code');
      window.location.href = `editQuiz.html?code=${quizCode}`;
    });
  });

  function deleteQuiz(quizCode) {
    console.log('Deleting quiz with code:', quizCode);
    delete quizzes[quizCode];
    // saveQuizzes(quizzes);
    displayQuizzes();
  };

  // Add click event to all delete buttons
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const quizCode = event.target.getAttribute('data-code');
      deleteQuiz(quizCode);
    });
  });


}

// Initialize the display when the page loads
document.addEventListener('DOMContentLoaded', displayQuizzes);
