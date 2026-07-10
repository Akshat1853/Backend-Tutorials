# Complete Guide to Router, Controller, Request Flow & Debugging in Express.js

## Introduction

In this lesson, we started building a proper backend architecture using Express.js.

Until now, all routes could have been written directly inside `app.js`, but that approach quickly becomes difficult to maintain as the project grows.

To solve this problem, Express applications are usually divided into:

* Routes
* Controllers
* Models
* Middlewares
* Utilities

This lesson introduces the first two important layers:

1. Router Layer
2. Controller Layer

and explains how a request travels through the application.

---

# Files Created in This Lesson

## app.js

```js
import userRouter from './routes/user.routes.js';

app.use("/api/v1/users", userRouter);

export { app };
```

---

## user.routes.js

```js
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

export default router;
```

---

## user.controller.js

```js
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});

export { registerUser };
```

---

# Why Do We Need Routes?

Suppose we keep every endpoint inside `app.js`.

Example:

```js
app.post("/register", ...);
app.post("/login", ...);
app.post("/logout", ...);
app.patch("/update-profile", ...);
app.patch("/change-password", ...);
app.post("/upload-avatar", ...);
app.post("/upload-cover-image", ...);
```

Initially this looks manageable.

But in a real-world application:

```text
50 routes
100 routes
200 routes
500 routes
```

The file becomes extremely difficult to manage.

This leads to:

* Poor readability
* Difficult debugging
* Difficult maintenance
* Higher chances of mistakes

Therefore we separate routes into dedicated files.

---

# Industry Standard Backend Structure

A typical Express application follows this structure:

```text
src/
│
├── app.js
│
├── routes/
│   └── user.routes.js
│
├── controllers/
│   └── user.controller.js
│
├── models/
│   └── user.model.js
│
├── middlewares/
│
├── utils/
│
└── constants.js
```

Each folder has a specific responsibility.

---

# Understanding app.js

Code:

```js
import userRouter from './routes/user.routes.js';

app.use("/api/v1/users", userRouter);
```

---

# What is app.use()?

Syntax:

```js
app.use(path, middleware);
```

Purpose:

Registers middleware or routers.

Example:

```js
app.use("/api/v1/users", userRouter);
```

Meaning:

Whenever a request starts with:

```text
/api/v1/users
```

Express forwards that request to:

```text
userRouter
```

for further processing.

---

# Base Route Concept

Code:

```js
app.use("/api/v1/users", userRouter);
```

This creates a base route.

---

# How Route Combination Works

Inside router:

```js
router.route("/register")
```

Base route:

```text
/api/v1/users
```

Route path:

```text
/register
```

Express combines them:

```text
/api/v1/users/register
```

Final endpoint:

```text
POST /api/v1/users/register
```

---

# API Versioning

Notice:

```text
/api/v1/users
```

The `v1` represents API Version 1.

---

# Why API Versioning?

Imagine version 1 is already being used by clients.

Later you make breaking changes.

Instead of replacing:

```text
/api/v1/users
```

you can create:

```text
/api/v2/users
```

Benefits:

* Backward compatibility
* Safer upgrades
* Easier maintenance
* Production-friendly APIs

Most large applications use API versioning.

---

# Understanding Express Router

Code:

```js
import { Router } from "express";

const router = Router();
```

---

# What is Router?

Router is like a mini Express application.

Instead of placing all routes in `app.js`, we create dedicated route files.

Example:

```js
router.post("/register", registerUser);
```

---

# Why Router Exists

Without routers:

```text
app.js
 ├── user routes
 ├── product routes
 ├── payment routes
 ├── admin routes
 ├── order routes
 └── hundreds more...
```

Messy and difficult to manage.

With routers:

```text
routes/
 ├── user.routes.js
 ├── product.routes.js
 ├── payment.routes.js
 ├── order.routes.js
 └── admin.routes.js
```

Clean and scalable.

---

# Route Definition

Code:

```js
router.route("/register").post(registerUser);
```

---

# What Does This Mean?

Endpoint:

```text
/register
```

HTTP Method:

```text
POST
```

Controller:

```text
registerUser
```

When a POST request reaches:

```text
/api/v1/users/register
```

Express executes:

```js
registerUser()
```

---

# Route Chaining

Current syntax:

```js
router.route("/register").post(registerUser);
```

Equivalent:

```js
router.post("/register", registerUser);
```

---

# Why Use route()?

Useful when multiple methods share the same endpoint.

Example:

```js
router
  .route("/user")
  .get(getUser)
  .post(createUser)
  .delete(deleteUser);
```

Keeps code organized.

---

# What is a Controller?

Controller contains application logic.

Example:

```text
Route
 ↓
Controller
 ↓
Database
 ↓
Response
```

Routes decide:

```text
Which URL should execute?
```

Controllers decide:

```text
What should happen?
```

---

# Controller File

Code:

```js
const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});
```

---

# Responsibilities of Controller

In future, this controller may:

* Validate user data
* Check existing users
* Hash passwords
* Upload avatar
* Create database records
* Generate tokens
* Send responses

Controllers contain business logic.

---

# Understanding req Object

The request object contains incoming data.

Common properties:

```js
req.body
req.params
req.query
req.headers
req.file
req.files
req.user
```

---

# req.body

Contains data sent by client.

Example:

```json
{
  "username": "akshat",
  "email": "abc@gmail.com"
}
```

Access:

```js
req.body.username
```

---

# req.params

Used for route parameters.

Example:

```text
/users/123
```

Route:

```js
router.get("/users/:id")
```

Access:

```js
req.params.id
```

---

# req.query

Used for query parameters.

Example:

```text
/users?page=1
```

Access:

```js
req.query.page
```

---

# Understanding res Object

Used to send responses back to client.

Common methods:

```js
res.send()
res.json()
res.status()
res.redirect()
```

---

# Sending JSON Response

Code:

```js
res.status(200).json({
  message: "ok",
});
```

Response:

```json
{
  "message": "ok"
}
```

---

# Method Chaining

Notice:

```js
res.status(200).json(...)
```

Why it works:

```js
res.status()
```

returns the response object.

Then:

```js
.json()
```

can be chained.

---

# HTTP Status Codes

## 200 OK

Request successful.

```js
res.status(200)
```

---

## 201 Created

Resource successfully created.

```js
res.status(201)
```

Common for registration APIs.

---

## 400 Bad Request

Client sent invalid data.

```js
res.status(400)
```

---

## 401 Unauthorized

Authentication required.

```js
res.status(401)
```

---

## 403 Forbidden

User lacks permission.

```js
res.status(403)
```

---

## 404 Not Found

Resource does not exist.

```js
res.status(404)
```

---

## 500 Internal Server Error

Unexpected server-side error.

```js
res.status(500)
```

---

# Understanding asyncHandler

Code:

```js
import { asyncHandler } from "../utils/asyncHandler.js";
```

This is a very important backend pattern.

---

# Problem Without asyncHandler

Normally:

```js
const registerUser = async (req, res) => {
  try {
    // logic
  } catch (error) {
    // error handling
  }
};
```

Every controller would require repetitive try-catch blocks.

---

# Solution

Wrap controller:

```js
asyncHandler(async (req, res) => {
  // logic
});
```

Benefits:

* Cleaner code
* Less repetition
* Centralized error handling
* Easier maintenance

---

# Complete Request Lifecycle

Suppose client sends:

```text
POST /api/v1/users/register
```

Flow:

```text
Client
   ↓
Express Server
   ↓
app.js
   ↓
app.use("/api/v1/users", userRouter)
   ↓
user.routes.js
   ↓
router.route("/register").post(registerUser)
   ↓
registerUser Controller
   ↓
res.status(200).json(...)
   ↓
Response Returned
```

This is one of the most important backend concepts to understand.

---

# Real Visualization

```text
Browser/Postman
       ↓
POST /api/v1/users/register
       ↓
Express App
       ↓
User Router
       ↓
Register Controller
       ↓
Business Logic
       ↓
Response
```

---

# Debugging Guide

When an endpoint does not work, check in the following order.

---

## Step 1: Is Server Running?

```bash
npm run dev
```

Check terminal for errors.

---

## Step 2: Is Router Imported?

```js
import userRouter from "./routes/user.routes.js";
```

---

## Step 3: Is Router Registered?

```js
app.use("/api/v1/users", userRouter);
```

Without this line, routes will never work.

---

## Step 4: Is URL Correct?

Correct:

```text
/api/v1/users/register
```

Wrong:

```text
/api/users/register
```

---

## Step 5: Is HTTP Method Correct?

Route:

```js
.post()
```

Therefore request must be:

```text
POST
```

Not:

```text
GET
```

---

## Step 6: Is Controller Exported?

```js
export { registerUser };
```

---

## Step 7: Is Controller Imported?

```js
import { registerUser } from "../controllers/user.controller.js";
```

---

## Step 8: Add Logs

Example:

```js
console.log("Controller reached");
```

If log appears:

```text
Request reached controller.
```

If not:

```text
Problem exists before controller.
```

---

# Separation of Concerns

One major architectural principle introduced in this lesson.

---

## Route Layer

Responsible for:

```text
URL Mapping
```

Example:

```js
router.post(...)
```

---

## Controller Layer

Responsible for:

```text
Business Logic
```

Example:

```js
registerUser()
```

---

## Benefits

* Cleaner code
* Easier debugging
* Better scalability
* Easier team collaboration
* Industry-standard architecture

---

# Key Takeaways

1. Express applications should separate routes and controllers.
2. `app.use()` mounts routers.
3. Routers organize endpoints into dedicated files.
4. Controllers contain business logic.
5. Routes only map URLs to controllers.
6. API versioning is implemented using `v1`.
7. Base route and router route combine to form the final endpoint.
8. `req` contains incoming request data.
9. `res` is used to send responses.
10. `res.status().json()` sends JSON responses.
11. HTTP status codes communicate request results.
12. `asyncHandler` simplifies async error handling.
13. Understanding request flow is essential for backend development.
14. Router → Controller architecture is used in almost every production Node.js application.
15. Debugging becomes much easier when you understand the complete request lifecycle.
