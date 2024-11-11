// Import the `loadQuizzes` function from QuestionBank.js
import { loadQuizzes } from './QuestionBank.js';

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
      <td>${quiz.timeLimit} minutes</td>
      <td><button class="btn btn-primary edit-btn" data-code="${quiz.code}">Edit</button></td>
    `;

    // Append the row to the table body
    tableBody.appendChild(row);
  });
}

// Initialize the display when the page loads
document.addEventListener('DOMContentLoaded', displayQuizzes);
