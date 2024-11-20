// QuizManager.js

// Loads all quizzes associated with account & displays them in home page
const loadQuizzes = () => {
  fetch("http://localhost:5000/api/quiz/home", //http POST request to send the username & retrieve all the quizzes
    { method: 'POST',headers: {'Content-Type': 'application/json',}, body: JSON.stringify({username: getUsername()})})
    .then(response => response.json()) //parse the response into JSON
    .then(data => { 
      const quizzes = data; //Store json into quizzes

      for(let i in quizzes){ // Split each quizzes questions & options from 1 string into a list
        quizzes[i].questions = JSON.parse(quizzes[i].questions);
        for(let j in quizzes[i].questions){
          quizzes[i].questions[j].options = JSON.parse(quizzes[i].questions[j].options);
        }
      }
      sessionStorage.setItem("quizzes", JSON.stringify(quizzes)); //add Quiz to session storage
      
      console.log("quizzes is here :",quizzes); // Allows Testing
      
      const tableBody = document.querySelector('tbody'); //Table that displays all quizzes
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

// Function to add a new quiz to the Database
function addQuiz(username,quizCode, quizTitle, questions,timeLimit) {
  const quiz = { //the OBJECT we will store
      username: username,
      code: quizCode,
      title: quizTitle,
      questions: questions,
      timeLimit: timeLimit
  };
  fetch("http://localhost:5000/api/quiz/create", //new POST request to send the object to the server
    {method: 'POST', headers: { 'Content-Type' : 'application/json'}, body: JSON.stringify(quiz)})
     .then(response => console.log(response.status)) //response to help with debugging
     .then(window.location.href = '/mentor') //reload the page after saving
     .catch(error => console.log("POST ERROR :" + error)); //catch any errors in the database
  return true;
}

//Deletes a quiz from the server
function deleteQuiz(quizCode) {
  console.log('Deleting quiz with code:', quizCode);
  fetch("http://localhost:5000/api/quiz/delete", //request that sends the code of the quiz that will be deleted
    {method: 'POST', headers: { 'Content-Type' : 'application/json'}, body: JSON.stringify({code: quizCode})})
  .then(res => console.log(res.status)) //response to help with debugging
  .then(window.location.href = '/mentor') //reload the home page to show change
  loadQuizzes();
};

// Function to fetch a quiz by its code
async function getQuizByCode(quizCode) {
  fetch("http://localhost:5000/api/quiz/takequiz", //sends a post request with the code of the quiz that needs to be fetched
     { method: 'POST',headers: {'Content-Type': 'application/json',}, body: JSON.stringify({code: quizCode})}) 
     .then(response => response.json())
     .then(data => {
      const quiz = data; //set data as the quiz that was recieved
      quiz.questions = JSON.parse(quiz.questions); //parse the questions
        for(let j in quiz.questions){ //loop through all the questions to turn the options from a single string to a list
          quiz.questions[j].options = JSON.parse(quiz.questions[j].options);
        }
      sessionStorage.setItem('quiz', JSON.stringify(quiz)); //add quiz to the session Storage to access in other functions
    })
     .catch(error => {console.log("STUDENT CODE ERROR:" + error)});
}

// Export functions for use in other files
export { generateQuizCode, addQuiz, getQuizByCode, deleteQuiz };
export { loadQuizzes };