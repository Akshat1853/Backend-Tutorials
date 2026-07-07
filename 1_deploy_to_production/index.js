// Load environment variables from the .env file into process.env
// This allows us to access values like process.env.PORT
require("dotenv").config();

// Import the Express framework
const express = require("express");

// Create an Express application instance
// This 'app' object is used to define routes, middleware, and start the server
const app = express();

// Get the port number from the .env file.
// If PORT is not defined, use 3000 as the default.
const PORT = process.env.PORT || 3000;

// ======================================================
// Route Definitions
// ======================================================

// Handle GET requests for the Home Route (/)
//
// When a user visits:
// http://localhost:3000/
// this callback function is executed.
app.get("/", (req, res) => {

  // req (Request Object)
  // Contains all information sent by the client, such as:
  // - URL
  // - Query parameters
  // - Route parameters
  // - Headers
  // - Body (for POST, PUT, PATCH requests)

  // res (Response Object)
  // Used to send a response back to the client.

  // Send plain text as the response.
  res.send("Hello World!");
});

// Handle GET requests for the Login Route (/login)
//
// When a user visits:
// http://localhost:3000/login
// this function runs.
app.get("/login", (req, res) => {

  // Send HTML as the response.
  // The browser will render this as a heading.
  res.send("<h1>Please login at my website</h1>");
});

// ======================================================
// Start the Server
// ======================================================

// Start the Express server on the specified port.
//
// Once the server starts successfully,
// the callback function below is executed.
app.listen(PORT, () => {

  // This message appears in the terminal,
  // indicating that the server is running.
  console.log(`Example app listening on port ${PORT}`);
});