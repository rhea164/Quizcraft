const mysql = require("mysql"); // MySQL library for database connection and queries
const path = require('path');
// Importing JWT for generating tokens and bcrypt for hashing passwords
const jwt = require('jsonwebtoken'); 
const bcrypt = require('bcrypt');

// Connecting to the database using environment variables
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD, 
    database: process.env.DATABASE 
});

 const viewsDirectory = path.join(__dirname, "../views");

// *Login Function*
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // Extract email and password from the request body

    // Check if both email and password are provided
    if (!email || !password) {
      console.log("login 1");

      return res.status(400).sendFile(path.join(viewsDirectory, '/login.html'), {
        message: 'Please provide an email and password' 
      });
    }

    // Query the database for a user with the provided email
    db.query('SELECT * FROM mentors WHERE email = ?', [email], async (error, results) => {
      console.log(results);

      // Check if the user exists and if the password matches the hashed password
      if (!results || !(await bcrypt.compare(password, results[0].MENTOR_PASSWORD))) {
        console.log("login 2");

        res.status(401).sendFile(path.join(viewsDirectory, '/login.html'), {
          message: 'Email or Password is incorrect' 
        });
      } else {
        const id = results[0].id; // Get the user's ID from the results
        res.status(200).sendFile(path.join(viewsDirectory, '/mentor.html'));
        // Generate a JSON Web Token (JWT) with the user's ID
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN // Set token expiration
        });
      }
    });

  } catch (error) {
    console.log(error); // Log any unexpected errors
  }
};

// *Sign-up Function*
exports.signup = (req, res) => {
  console.log(req.body); // Log the incoming request body for debugging

  const { username, email, password, passwordConfirm } = req.body; // Extract user details from the request body

  // Check if the email is already registered
  db.query('SELECT email FROM MENTORS WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.log(error); // Log any database query errors
    }

    if (results.length > 0) { 
        console.log("sign Up 1");
        // If the email already exists, render the register page with an error message
        return res.sendFile(path.join(viewsDirectory, '/signup.html'), {
       

        message: 'This email is already in use. Try again.'
      });
    } 
    
    else if (password !== passwordConfirm) {
        // Check if passwords match; show an error if they don't
        console.log("sign Up 2");

        return res.sendFile(path.join(viewsDirectory, '/signup.html'), {
        message: 'Passwords do not match. Try again.'
      });
    }


    // Hash the password with bcrypt for secure storage
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword); // Log the hashed password for debugging

    
    // Insert the new user into the database
    db.query('INSERT INTO MENTORS SET ?', { USERNAME: username, EMAIL: email, MENTOR_PASSWORD: hashedPassword }, (error, results) => {
      if (error) {
        console.log(error); // Log any database insertion errors
      } else {
        console.log(results); // Log the results of the insertion
        console.log("login");
        return res.sendFile(path.join(viewsDirectory, '/login.html'), {
          message: 'User registered successfully! Login now!' // Success message after registration
        });
      }
        
    });

    
  });
};

// *Logout Function*
exports.logout = async (req, res) => {
  // Overwrite the JWT cookie with a value of 'logout' and set it to expire in 2 seconds
  res.cookie('jwt', 'logout', {
    expires: new Date(Date.now() + 2 * 1000), // Set the cookie expiration to 2 seconds
    httpOnly: true // Restrict cookie access to the HTTP protocol
  });

  // Redirect the user to the homepage
  res.status(200).sendFile(path.join(viewsDirectory, '/index.html'));
};