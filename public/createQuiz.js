import { generateQuizCode, addQuiz } from './QuizManager.js';

console.log("createQuiz.js");
// getting the username from the session storage
let username=sessionStorage.getItem('username');

// document.addEventListener('DOMContentLoaded', () => {
//     // Get form elements
 
//     const questionType = document.getElementById('questionType');
//     const addQuestionBtn = document.getElementById('addQuestionBtn');
//     const questionContainer = document.getElementById('questionContainer');
//     const quizTitleInput = document.getElementById('quizTitle'); // Added this line

//     // Add question handler
//     addQuestionBtn.addEventListener('click', () => {
//         const type = questionType.value;
//         addQuestion(type);
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const pageType = document.body.getAttribute('data-page');
  
    //checking if the page is create
    if (pageType === 'create') {
      const quizForm = document.getElementById('quizForm');
      const addQuestionBtn = document.getElementById('addQuestionBtn');
      const questionType = document.getElementById('questionType');
      
        // Add the event listener for the add question button
      addQuestionBtn.addEventListener('click', () => {
        const type = questionType.value;
        addQuestion(type);
      });
      // Add event listener for the submit button
      quizForm.addEventListener('submit', (event)=> {
        event.preventDefault();
        finishQuiz();
      });
    }
  });


const defaultTimeLimit = 60;

// function which adds a question card to the quiz
function addQuestion(type) {
    let questionHtml = '';

    if (type === 'TF') {
        questionHtml = `
            <div class="card mb-3 question" style="display: none;">
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">Question:</label>
                        <input type="text" class="form-control questionText" placeholder="Enter your question here">
                    </div>
                    
                    <div class="mb-3 flex-fill">
                        <label class="form-label">Correct Answer:</label>
                        <select class="form-select correctAnswer">
                            <option value="True">True</option>
                            <option value="False">False</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-danger" onclick="deleteQuestion(this)">Delete Question</button>
                </div>
            </div>`;
    } else if (type === 'MCQ') {
        questionHtml = `
            <div class="card mb-3 question" style="display: none;">
                <div class="card-body">
                    <div class="mb-3">
                        <label class="form-label">Question:</label>
                        <input type="text" class="form-control questionText" placeholder="Enter your question here">
                    </div>
                    <div class="mb-3 ">
                        <label class="form-label">Options:</label>
                        <input type="text" class="form-control mb-2 option" placeholder="Option A">
                        <input type="text" class="form-control mb-2 option" placeholder="Option B">
                        <input type="text" class="form-control mb-2 option" placeholder="Option C">
                        <input type="text" class="form-control mb-2 option" placeholder="Option D">
                    </div>
                   
                    <div class="mb-3 flex-fill">
                        <label class="form-label">Correct Answer:</label>
                        <select class="form-select correctAnswer">
                            <option value="0">Option A</option>
                            <option value="1">Option B</option>
                            <option value="2">Option C</option>
                            <option value="3">Option D</option>
                        </select>
                    </div>
                   
                    <button type="button" class="btn btn-danger" onclick="deleteQuestion(this)">Delete Question</button>
                </div>
            </div>`;
    }

    $(questionHtml)
    .appendTo('#questionContainer')
    .slideDown(300);
}

// function which deletes a question card from the quiz
function deleteQuestion(button) {
    const questionDiv = button.closest('.question');
    questionDiv.remove();
}

// function which finishes the quiz creation process and adds the quiz to the database
function finishQuiz() {
    const quizTitle = document.getElementById('quizTitle').value; 
    const quizCode = generateQuizCode();
    const questions = [];
    const timeLimit = parseInt(document.getElementById('timeLimit').value) || 60;

    if (quizTitle) {
        // Gather all questions
        const questionDivs = document.querySelectorAll('.question');

        questionDivs.forEach(div => {
            const questionText = div.querySelector('.questionText').value;

            // Determine question type based on number of options
            const type = div.querySelector('.correctAnswer').options.length === 2 ? 'TF' : 'MCQ';

            let options, correctAnswer;

            if (type === 'TF') {
                options = ['True', 'False'];
                correctAnswer = div.querySelector('.correctAnswer').value;
            } else {
                // get the options for multiple choice question and the correct answer
                options = Array.from(div.querySelectorAll('.option')).map(opt => opt.value);
                const correctAnswerIndex = parseInt(div.querySelector('.correctAnswer').value);
                correctAnswer = options[correctAnswerIndex];
            }

            // Check if question and all options are filled
            if (questionText && options.every(opt => opt)) {
                // Add question to the list
                questions.push({
                    question: questionText,
                    options: options,
                    answer: correctAnswer,
                    type: type
                });
            }
        });

        // Check if at least one question is added
        if (questions.length > 0) {
            const success = addQuiz(username,quizCode, quizTitle, questions, timeLimit);

            if (success) {
                alert(`Quiz created successfully! Quiz Code: ${quizCode}`);
                // Clear the form
                questionContainer.innerHTML = '';
                quizForm.reset();
            } else {
                alert("Failed to create quiz. Please try again.");
            }
        } else {
            alert("Please add at least one complete question with all options filled.");
        }
    } else {
        alert("Please enter a quiz title.");
    }
}

// Make functions available globally
window.deleteQuestion = deleteQuestion;
window.addQuestion = addQuestion;



export { addQuestion, deleteQuestion };
