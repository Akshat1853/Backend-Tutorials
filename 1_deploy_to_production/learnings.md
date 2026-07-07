# Express.js Learnings

> These notes summarize the concepts learned while getting started with Express.js, Node.js, and deploying applications. The focus is on understanding how Express works, handling HTTP requests, managing environment variables, and preparing applications for production deployment.

---

# Table of Contents

1. Introduction to Express.js
2. How Express Works
3. Request–Response Cycle
4. Routes in Express
5. HTTP Request Methods
6. Running a Node.js Application
7. package.json Scripts
8. Creating a Basic Express Server
9. Understanding "Cannot GET /route"
10. Restarting the Server & Nodemon
11. Production Ready Applications
12. Environment Variables (.env)
13. Using dotenv
14. Why process.env.PORT?
15. Deployment Workflow
16. Automatic Deployment from GitHub
17. Key Takeaways

---

# 1. Introduction to Express.js

Express.js is a **minimal, fast, and flexible web framework** built on top of Node.js. It simplifies the process of creating web servers and REST APIs by providing an easy-to-use routing system and middleware support.

Without Express, creating an HTTP server requires using Node.js's built-in `http` module, which involves writing more boilerplate code.

Express allows developers to:

- Build web servers
- Handle incoming HTTP requests
- Define routes
- Send HTTP responses
- Build REST APIs
- Use middleware
- Serve static files

---

# 2. How Express Works

Whenever a user opens a website or a frontend application communicates with a backend, an **HTTP Request** is sent to the server.

Express continuously listens for these incoming requests. Once a request is received, Express determines which route matches the requested URL and executes the corresponding function. Finally, it sends an HTTP response back to the client.

---

## Request → Response Flow

```text
Client (Browser / Mobile App)
            │
            │ HTTP Request
            ▼
      Express Server
            │
            │ Route Matching
            ▼
      Route Handler
            │
            │ Generates Response
            ▼
Client Receives HTTP Response
```

### Explanation

- The client sends an HTTP request.
- Express listens for incoming requests.
- Express checks whether a matching route exists.
- The route handler executes.
- A response is returned to the client.

---

# 3. Routes in Express

A **Route** is simply a URL endpoint that the server listens for.

Examples:

```
/
```

```
/login
```

```
/register
```

```
/profile
```

Whenever a request matches one of these routes, Express executes the corresponding callback function.

Example:

```javascript
app.get("/", (req, res) => {
    res.send("Home Page");
});

app.get("/login", (req, res) => {
    res.send("Login Page");
});
```

---

# 4. HTTP Request Methods

HTTP defines multiple request methods.

The most common one is **GET**.

| Method | Purpose |
|---------|----------|
| GET | Retrieve data from the server |
| POST | Send new data |
| PUT | Replace existing data |
| PATCH | Update part of existing data |
| DELETE | Delete existing data |

### GET Request

Whenever you type a URL in the browser like:

```
http://localhost:3000/
```

the browser automatically sends a **GET request** to the server.

---

# 5. Running a Node.js Application

Node.js executes JavaScript files using the following command:

```bash
node index.js
```

Every time the application needs to be started, this command can be executed.

---

# 6. Using package.json Scripts

Instead of repeatedly typing:

```bash
node index.js
```

we can define reusable scripts inside the `package.json` file.

Example:

```json
{
    "scripts": {
        "start": "node index.js"
    }
}
```

Now the application can be started using:

```bash
npm start
```

Internally, npm executes:

```bash
node index.js
```

---

## Why Use Scripts?

Advantages:

- Easier to remember
- Shorter commands
- Standard project workflow
- Useful for team collaboration
- Centralized project commands

Example:

```json
{
    "scripts": {
        "start": "node index.js",
        "dev": "nodemon index.js"
    }
}
```

---

# 7. Creating a Basic Express Server

Example:

```javascript
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Home Page");
});

app.listen(3000, () => {
    console.log("Server Running");
});
```

### Components

- `express()` creates an Express application.
- `app.get()` defines a route.
- `req` represents the incoming request.
- `res` is used to send a response.
- `app.listen()` starts the server.

---

# 8. Understanding "Cannot GET /login"

Suppose your application initially contains only:

```javascript
app.get("/", (req, res) => {
    res.send("Home");
});
```

Now if you visit:

```
http://localhost:3000/login
```

Express returns:

```
Cannot GET /login
```

### Why?

Because Express searched for a **GET route** named `/login` but couldn't find one.

It simply means:

> There is no route handler registered for this URL.

---

# 9. Why Restarting the Server Fixed It

Suppose the server is already running.

Now you add:

```javascript
app.get("/login", (req, res) => {
    res.send("Login Page");
});
```

and refresh the browser.

You may still see:

```
Cannot GET /login
```

### Reason

Node.js loads your JavaScript files **only once** when the server starts.

Even though you edited the file, the running server is still executing the previous version.

After restarting the server:

```bash
Ctrl + C
npm start
```

Node loads the updated code, registers the `/login` route, and the page starts working.

---

# 10. Automatically Restarting the Server (Nodemon)

Restarting the server after every code change is inconvenient.

Developers use **Nodemon** during development.

Install:

```bash
npm install --save-dev nodemon
```

Add a script:

```json
{
    "scripts": {
        "dev": "nodemon index.js"
    }
}
```

Run:

```bash
npm run dev
```

Whenever you save the file:

- Nodemon detects changes.
- Stops the old server.
- Starts a new server automatically.

---

# 11. Making an Application Production Ready

A project that works on your local machine may not work correctly in a production environment without proper configuration.

One of the biggest differences between development and production is that **configuration values should not be hardcoded**.

For example:

- Database Username
- Database Password
- API Keys
- JWT Secret
- Port Number

These values may differ across environments and should not be exposed publicly.

---

# 12. Environment Variables (.env)

Environment variables store configuration values **outside the application code**.

Instead of writing:

```javascript
const PORT = 3000;
```

we store the value inside a `.env` file.

Example:

```env
PORT=3000
DB_USERNAME=myusername
DB_PASSWORD=mypassword
JWT_SECRET=mysecretkey
```

### Why?

- Keeps sensitive information secure.
- Allows different configurations for development and production.
- Prevents exposing secrets in GitHub repositories.

---

# 13. Using dotenv

Install:

```bash
npm install dotenv
```

At the beginning of the application:

```javascript
require("dotenv").config();
```

This loads all variables from the `.env` file into `process.env`.

---

## Using Environment Variables

Instead of:

```javascript
const PORT = 3000;
```

use:

```javascript
const PORT = process.env.PORT || 3000;
```

Example:

```javascript
require("dotenv").config();

const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

# 14. Why Use process.env.PORT?

During local development, port **3000** may be available.

However, when deploying the application:

- Another machine may already be using port 3000.
- Cloud platforms often assign ports dynamically.
- Your application must listen on the port provided by the hosting platform.

Using:

```javascript
process.env.PORT
```

makes the application compatible with different environments without changing the source code.

This is one of the basic requirements for a production-ready Node.js application.

---

# 15. Deployment Workflow

Once the application is ready, it can be deployed to cloud hosting platforms.

Popular deployment platforms include:

- AWS
- DigitalOcean
- Railway
- Render
- Azure
- Google Cloud Platform (GCP)

A common workflow is:

```text
Develop Application
        │
        ▼
Test Locally
        │
        ▼
Push Code to GitHub
        │
        ▼
Connect Repository to Hosting Platform
        │
        ▼
Configure Environment Variables
        │
        ▼
Deploy Application
        │
        ▼
Application Becomes Live
```

---

# 16. Automatic Deployment from GitHub

Modern deployment platforms integrate directly with GitHub repositories.

After connecting the repository:

1. The hosting platform monitors a specific branch (commonly `main`).
2. Whenever new commits are pushed to GitHub, the platform detects them automatically.
3. It pulls the latest source code.
4. Installs dependencies.
5. Builds the application (if required).
6. Restarts the server.
7. Deploys the latest version.

### Workflow

```text
Write Code
      │
      ▼
Test Locally
      │
      ▼
Commit Changes
      │
      ▼
Push to GitHub
      │
      ▼
Deployment Platform Detects New Commit
      │
      ▼
Builds & Deploys Application
      │
      ▼
Live Website Updates Automatically
```

This means that after the initial deployment, updating the live application is often as simple as:

```bash
git add .
git commit -m "Updated feature"
git push origin main
```

The deployment platform takes care of the rest.

This automated process is commonly referred to as **Continuous Deployment (CD)** or is part of a broader **CI/CD (Continuous Integration and Continuous Deployment)** pipeline.

---

# Best Practices

- Never hardcode passwords or API keys.
- Store sensitive information in `.env`.
- Add `.env` to `.gitignore`.
- Use `process.env.PORT` instead of fixed port numbers.
- Use npm scripts for running the project.
- Use Nodemon during development.
- Push only tested code to the production branch.
- Use GitHub for version control before deployment.

---

# Key Takeaways

- Express simplifies building web servers and APIs.
- Express listens for HTTP requests and sends appropriate responses.
- Routes determine how the server responds to specific URLs.
- Browsers usually send **GET** requests when opening web pages.
- `package.json` scripts provide a cleaner way to run applications.
- `Cannot GET /route` means no matching GET route exists.
- Node.js does not automatically reload code changes.
- Nodemon automatically restarts the server after file changes.
- Environment variables keep configuration separate from source code.
- `dotenv` loads variables from a `.env` file into `process.env`.
- `process.env.PORT` allows applications to run correctly in production.
- Applications are commonly deployed using platforms like DigitalOcean, AWS, Railway, or Render.
- After connecting GitHub to the deployment platform, every push to the deployment branch can automatically update the live application.