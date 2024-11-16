// Import the `loadQuizzes` and `saveQuizzes` functions from QuestionBank.js
import { loadQuizzes } from './QuestionBank.js';
import { addQuestion } from './createQuiz.js';


document.addEventListener('DOMContentLoaded', () => {
  const pageType = document.body.getAttribute('data-page');

  if (pageType === 'edit') {
  const quizForm = document.getElementById('qForm');
  const addQuestionBtn = document.getElementById('addQBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // Add event listener for the cancel button
  cancelBtn.addEventListener('click', () => {
    window.location.href = 'mentor.html'; // Redirect to mentor.html
  });

  addQuestionBtn.addEventListener('click', addQuestionHandler);

  quizForm.addEventListener('submit',submitQuizHandler );
  }

  // Add the event listener
 
});

function addQuestionHandler() {
  const type = questionType.value;
  addQuestion(type);
}

function submitQuizHandler(event) {
  event.preventDefault();

  // Update quiz data from the form fields
  quizData.title = titleInput.value;
  quizData.timeLimit = parseInt(timeLimitInput.value, 10);

  // Save the updated quiz data to localStorage
  // quizzes[quizCode] = quizData;
  saveQuiz(quizzes);

  // alert('Quiz updated successfully!');
  window.location.href = 'mentor.html';
};

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
// const questionContainer = document.getElementById('questionContainer');

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
    deleteButton.setAttribute('data-index', index); // Set data attribute
    deleteButton.addEventListener('click', (event) => {
      const questionIndex = parseInt(event.target.getAttribute('data-index'), 10);
      deleteQuestion(questionIndex);
    });

    // // Add the delete button to the question card
    // questionCard.appendChild(deleteButton);

    const cardBody = questionCard.querySelector('.card-body');
    cardBody.appendChild(deleteButton);

    // Append the populated card to the container
    questionContainer.appendChild(questionCard);
  });
}

// Populate the form with existing quiz questions
populateQuestions(quizData.questions);


// Delete a question from the quiz
function deleteQuestion(index) {
  // Remove the question from quizData
  quizData.questions.splice(index, 1);

  // Update the quiz in localStorage
  const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};
  quizzes[quizCode] = quizData;
  console.log(quizzes);
  localStorage.setItem('quizzes', JSON.stringify(quizzes));

  // Refresh the question list display
  // populateQuestions(quizData.questions);

  // Show the alert after updating
  // alert('Question deleted!');
}

// Save changes when the form is submitted




// Save the updated quiz data back to localStorage
function saveQuiz() {
  const quizzes = JSON.parse(localStorage.getItem('quizzes')) || {};

  // Update the existing quiz data from form fields
  quizData.title = titleInput.value;
  quizData.timeLimit = parseInt(timeLimitInput.value, 10);

  // Update questions list from the form
  const questions = [];
  const questionDivs = document.querySelectorAll('.question');

  questionDivs.forEach(div => {
    const questionText = div.querySelector('.questionText').value;
    const type = div.querySelector('.correctAnswer').options.length === 2 ? 'trueFalse' : 'multipleChoice';

    let options, correctAnswer;

    if (type === 'trueFalse') {
      options = ['True', 'False'];
      correctAnswer = div.querySelector('.correctAnswer').value;
    } else {
      options = Array.from(div.querySelectorAll('.option')).map(opt => opt.value);
      const correctAnswerIndex = parseInt(div.querySelector('.correctAnswer').value);
      correctAnswer = options[correctAnswerIndex];
    }

    if (questionText && options.every(opt => opt)) {
      questions.push({
        question: questionText,
        options: options,
        answer: correctAnswer,
        type: type
      });
    }
  });

  // Update the questions in quizData
  quizData.questions = questions;

  // Save the updated quizData back to localStorage
  quizzes[quizCode] = quizData;
  localStorage.setItem('quizzes', JSON.stringify(quizzes));

  // Notify the user and redirect
  alert('Quiz updated successfully!');
  // window.location.href = 'mentor.html';
}





