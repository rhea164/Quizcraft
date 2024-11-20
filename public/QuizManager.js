// QuizManager.js

// Store quizzes in sessionStorage to persist data
const loadQuizzes = () => {
  fetch("http://localhost:8000/api/quiz/home",
    { method: 'POST',headers: {'Content-Type': 'application/json',}, body: JSON.stringify({username: getUsername()})})
    .then(response => response.json())
    .then(data => {
      const quizzes = data;
      for(let i in quizzes){
        quizzes[i].questions = JSON.parse(quizzes[i].questions);
        for(let j in quizzes[i].questions){
          quizzes[i].questions[j].options = JSON.parse(quizzes[i].questions[j].options);
        }
      }
      sessionStorage.setItem("quizzes", JSON.stringify(quizzes));
      
      console.log("quizzes is here :",quizzes);
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
          window.location.href = `/editQuiz?code=${quizCode}`;
        });
      });

      

      // Add click event to all delete buttons
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
          const quizCode = event.target.getAttribute('data-code');
          deleteQuiz(quizCode);
        });
      });
    })
  .catch(error => console.log("MENTOR HOME PAGE ERROR:" + error));
};

function setUsername(username) {
  sessionStorage.setItem('username', username);
}

function getUsername() {
return sessionStorage.getItem('username'); 
}

// Function to generate a unique quiz code (6-digit random code)
function generateQuizCode() {
  return Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit number
}

// Function to add a new quiz to the question bank
function addQuiz(username,quizCode, quizTitle, questions,timeLimit) {
  const quiz = {
      username: username,
      code: quizCode,
      title: quizTitle,
      questions: questions,
      timeLimit: timeLimit
  };
  fetch("http://localhost:8000/api/quiz/create",
    {method: 'POST', headers: { 'Content-Type' : 'application/json'}, body: JSON.stringify(quiz)})
     .then(response => console.log(response.status))
     .catch(error => console.log("POST ERROR :" + error));
  return true;
}

function deleteQuiz(quizCode) {
  console.log('Deleting quiz with code:', quizCode);
  fetch("http://localhost:8000/api/quiz/delete",
    {method: 'POST', headers: { 'Content-Type' : 'application/json'}, body: JSON.stringify({code: quizCode})})
  .then(res => console.log(res.status));
  loadQuizzes();
};

// Function to fetch a quiz by its code
function getQuizByCode(quizCode) {
  const quiz = null;
  fetch("http://localhost:8000/api/quiz/takequiz",
     { method: 'POST',headers: {'Content-Type': 'application/json',}, body: JSON.stringify({code: quizCode})})
     .then(response => response.json())
     .then(data => {quiz = data})
     .catch(error => {console.log("STUDENT CODE ERROR:" + error)});
  return quiz;
}

// Export functions for use in other files
export { generateQuizCode, addQuiz, getQuizByCode, deleteQuiz };

/* Add example quiz
const exampleQuiz = {
  username: "mike",
  code: "12345",
  title: "JavaScript Basics",
  timeLimit:60,
  questions: [
      {
          question: "What is the output of `console.log(typeof null)`?",
          options: ["object", "null", "undefined", "number"],
          answer: "object",
          type:"MCQ"
      },
      {
          question: "Which company developed JavaScript?",
          options: ["Netscape", "Microsoft", "Google", "Apple"],
          answer: "Netscape",
          type:"MCQ"
      },
      {
          question: "What does `NaN` stand for?",
          options: ["Not a Number", "Not a Null", "Not a Name", "Not a Node"],
          answer: "Not a Number",
          type:"MCQ"
      },
  ]
};

addQuiz(exampleQuiz.username,exampleQuiz.code, exampleQuiz.title, exampleQuiz.questions,exampleQuiz.timeLimit);
*/
export { loadQuizzes };