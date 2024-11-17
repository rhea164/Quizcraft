document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // checking if username email and password have been entered
    if (username && email && password) {
      // Store username in sessionStorage
      sessionStorage.setItem('username', username);

      // Redirect user to mentor screen
      window.location.href = './mentor.html';
    } else {
      alert('Please fill in all fields.');
    }
  });