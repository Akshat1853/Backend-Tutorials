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

const githubData = {
  "login": "Akshat1853",
  "id": 151821124,
  "node_id": "U_kgDOCQybRA",
  "avatar_url": "https://avatars.githubusercontent.com/u/151821124?v=4",
  "gravatar_id": "",
  "url": "https://api.github.com/users/Akshat1853",
  "html_url": "https://github.com/Akshat1853",
  "followers_url": "https://api.github.com/users/Akshat1853/followers",
  "following_url": "https://api.github.com/users/Akshat1853/following{/other_user}",
  "gists_url": "https://api.github.com/users/Akshat1853/gists{/gist_id}",
  "starred_url": "https://api.github.com/users/Akshat1853/starred{/owner}{/repo}",
  "subscriptions_url": "https://api.github.com/users/Akshat1853/subscriptions",
  "organizations_url": "https://api.github.com/users/Akshat1853/orgs",
  "repos_url": "https://api.github.com/users/Akshat1853/repos",
  "events_url": "https://api.github.com/users/Akshat1853/events{/privacy}",
  "received_events_url": "https://api.github.com/users/Akshat1853/received_events",
  "type": "User",
  "user_view_type": "public",
  "site_admin": false,
  "name": null,
  "company": null,
  "blog": "",
  "location": null,
  "email": null,
  "hireable": null,
  "bio": null,
  "twitter_username": null,
  "public_repos": 24,
  "public_gists": 0,
  "followers": 0,
  "following": 0,
  "created_at": "2023-11-23T07:43:06Z",
  "updated_at": "2026-05-25T02:04:56Z"
}

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

// Handle GET requests for the Github Route (/github)
//
// When a user visits:
// http://localhost:3000/github
// this function runs.
app.get("/github", (req, res) => {
    res.json(githubData);
})

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