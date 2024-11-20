import { getQuizByCode } from "./QuizManager.js";

let score = 0;
let totalQuestions = 0;
let timeLeft = 60;
let timerInterval;
let scorePercentage = 0;

// Load the quiz when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});

// Get quiz code from the URL
function getQuizCodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
  }
  
  // Load quiz questions based on the quiz code
  async function loadQuestions() {
    try {
      // Get the quiz code from the URL
      const quizCode = getQuizCodeFromURL();
      // get the quiz data from the server
      await getQuizByCode(quizCode);

      // Get the quiz data from the session storage
      let quiz = JSON.parse(sessionStorage.getItem('quiz'));
      console.log(quiz);
      // Check if the quiz exists
      if (!quiz) {
        window.location.href = '/student';
        throw new Error('Quiz not found. Please check the quiz code.');
      }
  
      // set the time left to the time limit of the quiz
      timeLeft = quiz.timeLimit * 60;
      console.log('Quiz:', quiz);
      const questions = quiz.questions;
      const slidesContainer = document.getElementById('quizSlides');
      totalQuestions = questions.length;
  
      // Append each question as a slide
      questions.forEach((item, index) => {
        const slide = document.createElement('section');
        slide.innerHTML = `
          <h2>Question ${index + 1} of ${totalQuestions}</h2>
          <p>${item.question}</p>
          <div id="options-${index}">
            ${item.options.map(option => `
              <button onclick="checkAnswer('${option}', '${item.answer}', 'feedback-${index}', this)">
                ${option}
              </button>
            `).join('')}
          </div>
          <p id="feedback-${index}" class="feedback"></p>
        `;
        slidesContainer.appendChild(slide);
      });
  
      // Append final slide
      const finalSlide = document.createElement('section');

      finalSlide.innerHTML = `
        <h2>Quiz Complete!</h2>
        <p id="scoreDisplay"></p>
        <button id="submitButton" onclick="window.location.href='/'">Home</button>
      `;
      slidesContainer.appendChild(finalSlide);
  
      // Initialize Reveal.js
      Reveal.initialize({
        hash: true,
        slideNumber: true,
        controls: true,
        progress: true,
        transition: 'slide',
        touch: true,
      });

      // Check if the last slide is reached
      Reveal.on('slidechanged', (event) => {
        if (Reveal.getCurrentSlide().nextElementSibling === null) {
          // End the quiz if the last slide is reached
            endQuiz();
        }
    });
    
    // Start the timer
      startTimer();
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert(error.message);
    }
  }

  // Check if the selected answer is correct
  function checkAnswer(selectedOption, correctAnswer, feedbackElementId, buttonElement) {
    const feedbackElement = document.getElementById(feedbackElementId);

    // Prevent further clicks on options after an answer has been selected
    if (feedbackElement.textContent) return;

    // Provide feedback based on the selected option
    if (selectedOption === correctAnswer) {
        feedbackElement.textContent = "Correct!";
        feedbackElement.classList.add("correct");
        feedbackElement.classList.remove("incorrect");
        score++;
    } else {
        feedbackElement.textContent = "Incorrect!";
        feedbackElement.classList.add("incorrect");
        feedbackElement.classList.remove("correct");
    }

    // Disable all buttons for the current question after an answer is selected
    buttonElement.parentNode.querySelectorAll('button').forEach(button => button.disabled = true);


}

// Attach to global window object
window.checkAnswer = checkAnswer;


// Start the timer and end the quiz when time runs out
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        //show the time remaining in minutes and seconds
        document.getElementById('timer').textContent = `Time Left: ${Math.floor(timeLeft / 60)}:${timeLeft % 60}`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endQuiz();
        }
    }, 1000);
}

// End the quiz by calculating the score percentage and showing it on the final slide


function endQuiz() {
    clearInterval(timerInterval);
    scorePercentage = Math.round((score / totalQuestions) * 100);

    // Move to the final slide
    Reveal.slide(Reveal.getTotalSlides() - 1);

    // Update the score display after navigating to the final slide
    setTimeout(() => {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Your score: ${scorePercentage}%`;
        }
    }, 100);

    // Disable back navigation
    Reveal.configure({ controls: false });
}



  