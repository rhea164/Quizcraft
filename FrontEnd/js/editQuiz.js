// Import the `loadQuizzes` and `saveQuizzes` functions from QuestionBank.js
import { loadQuizzes, saveQuizzes } from './QuestionBank.js';

// Helper function to get query parameters
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Retrieve the quiz code from the URL
const quizCode = getQueryParam('code');
if (!quizCode) {
  alert('Quiz code not found in URL!');
  window.location.href = 'mentor.html';
} else {
  console.log(quizCode);
}

// Load all quizzes from localStorage
const quizzes = loadQuizzes();
const quizData = quizzes[quizCode];

// Check if the quiz exists
if (!quizData) {
  alert('Quiz not found!');
  window.location.href = 'mentor.html';
}

// Populate the form fields with quiz data
const titleInput = document.getElementById('quizTitle');
const timeLimitInput = document.getElementById('timeLimit');
const questionContainer = document.getElementById('questionContainer');

// Set the title and time limit
titleInput.value = quizData.title;
timeLimitInput.value = quizData.timeLimit;

// Function to populate questions in the form
function populateQuestions(questions) {
  const questionContainer = document.getElementById('questionContainer');
  const questionTemplate = document.querySelector('.question-card-template');

  questionContainer.innerHTML = ''; // Clear existing content

  questions.forEach((question, index) => {
    // Clone the template
    const questionCard = questionTemplate.cloneNode(true);
    questionCard.classList.remove('d-none', 'question-card-template');

    // Populate the question text
    const questionInput = questionCard.querySelector('.question-input');
    questionInput.value = question.question;

    // Set the correct option
    const correctOptionSelect = questionCard.querySelector('.correct-option-select');
    correctOptionSelect.value = question.answer;

    

    // Populate the options dropdown with the available options (whether it's MCQ or True/False)
    question.options.forEach((optionText) => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      correctOptionSelect.appendChild(option);
    });

    // Set the selected correct answer
    correctOptionSelect.value = question.answer;

    // Add the delete button functionality
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Question';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.addEventListener('click', () => {
      deleteQuestion(index);
    });

    // Add the delete button to the question card
    questionCard.appendChild(deleteButton);

    // Append the populated card to the container
    questionContainer.appendChild(questionCard);
  });
}

// Populate the form with existing quiz questions
populateQuestions(quizData.questions);

// Save changes when the form is submitted
document.getElementById('quizForm').addEventListener('submit', (event) => {
  event.preventDefault();

  // Update quiz data
  quizData.title = titleInput.value;
  quizData.timeLimit = parseInt(timeLimitInput.value, 10);

  // Save the updated quiz data
  quizzes[quizCode] = quizData;
  saveQuizzes(quizzes);

  alert('Quiz updated successfully!');
  window.location.href = 'mentor.html';
});

// Handle cancel button click
document.querySelector('.btn-cancel').addEventListener('click', () => {
  window.location.href = 'mentor.html';
});

// Function to delete a question
function deleteQuestion(index) {
  // Remove the question from the quiz data
  quizData.questions.splice(index, 1);

  // Update the quiz in localStorage
  quizzes[quizCode] = quizData;
  saveQuizzes(quizzes);

  // Re-populate the questions
  populateQuestions(quizData.questions);
}

// Save changes when the form is submitted
document.getElementById('quizForm').addEventListener('submit', (event) => {
  event.preventDefault();

  // Update quiz data from the form fields
  quizData.title = titleInput.value;
  quizData.timeLimit = parseInt(timeLimitInput.value, 10);

  // Save the updated quiz data to localStorage
  quizzes[quizCode] = quizData;
  saveQuizzes(quizzes);

  alert('Quiz updated successfully!');
  window.location.href = 'mentor.html';
});
