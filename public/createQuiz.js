import { generateQuizCode, addQuiz } from './QuestionBank.js';

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
  
    if (pageType === 'create') {
      const quizForm = document.getElementById('quizForm');
      const addQuestionBtn = document.getElementById('addQuestionBtn');
      const questionType = document.getElementById('questionType');
      
  
      addQuestionBtn.addEventListener('click', () => {
        const type = questionType.value;
        addQuestion(type);
      });
  
      quizForm.addEventListener('submit', (event)=> {
        event.preventDefault();
        finishQuiz();
      });
    }
  });


const defaultTimeLimit = 60;

function addQuestion(type) {
    let questionHtml = '';

    if (type === 'trueFalse') {
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
    } else if (type === 'multipleChoice') {
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

function deleteQuestion(button) {
    const questionDiv = button.closest('.question');
    questionDiv.remove();
}

function finishQuiz() {
    const quizTitle = document.getElementById('quizTitle').value; // Changed this line
    const quizCode = generateQuizCode();
    const questions = [];
    const timeLimit = parseInt(document.getElementById('timeLimit').value) || 60;

    if (quizTitle) {
        // Gather all questions
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

        if (questions.length > 0) {
            const success = addQuiz(quizCode, quizTitle, questions, timeLimit);

            if (success) {
                alert(`Quiz created successfully! Quiz Code: ${quizCode}`);
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



export { addQuestion, deleteQuestion };