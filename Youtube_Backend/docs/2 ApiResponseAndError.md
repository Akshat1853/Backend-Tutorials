# ApiResponseAndError

## Overview

In this lesson, we improved the backend application's architecture by introducing proper application configuration, middleware setup, custom API response structures, custom error handling utilities, and a reusable asynchronous error handler.

As applications grow, repeatedly writing the same response formats and error handling logic becomes difficult to maintain. To solve this, we created utility classes and helper functions that standardize how the application communicates with clients and handles errors.

---

# Project Structure Changes

A common pattern in Express applications is separating application configuration from server startup logic.

```text
src/
├── index.js
├── app.js
├── database/
│   └── index.js
├── utils/
│   ├── ApiResponse.js
│   ├── ApiError.js
│   └── asyncHandler.js
└── ...
```

This separation keeps the codebase clean and scalable.

---

# Environment Variables with dotenv

## Why dotenv?

Node.js cannot automatically read values from a `.env` file.

The `dotenv` package loads environment variables into `process.env`.

Installation:

```bash
npm install dotenv
```

Usage:

```js
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});
```

Once loaded, values can be accessed using:

```js
process.env.PORT
process.env.MONGODB_URL
process.env.CORS_ORIGIN
```

### Benefits

* Keeps secrets out of source code.
* Makes environment-specific configuration easier.
* Improves security and maintainability.

---

# Server Startup Flow

## Modified index.js

```js
import dotenv from "dotenv";
import connectDB from "./database/index.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection failed !! ", err);
  });
```

---

## Why Start the Server After Database Connection?

The database is a critical dependency.

Most application routes require database access.

Bad flow:

```text
Server Starts
      ↓
Database Fails
      ↓
Routes Break
```

Better flow:

```text
Connect Database
      ↓
Success
      ↓
Start Server
```

This ensures the application becomes available only when the database connection has been established successfully.

---

# Understanding Middleware

Middleware is one of the most important concepts in Express.

When a client sends a request:

```text
Client Request
       ↓
Middleware
       ↓
Route Handler
       ↓
Response
```

Example:

```text
Instagram Request
        ↓
Check Login Middleware
        ↓
User Authenticated?
        ↓
Yes
        ↓
Return Response
```

The middleware gets a chance to process the request before the final response is sent.

---

## Middleware Parameters

Many developers initially think Express only provides:

```js
req
res
```

However, middleware actually works with:

```js
err
req
res
next
```

### req

Contains information about the incoming request.

Examples:

```js
req.body
req.params
req.cookies
req.headers
```

---

### res

Used to send data back to the client.

Examples:

```js
res.send()
res.json()
res.status()
```

---

### next

`next()` passes control to the next middleware.

Example:

```js
app.use((req, res, next) => {
  console.log("Middleware Executed");
  next();
});
```

Without calling `next()`, the request-response cycle may stop.

---

### err

Used by Express error-handling middleware.

Whenever an error occurs, Express can forward the error object through middleware chains.

---

# Middleware Execution Order

Multiple middlewares can exist in an application.

Example:

```text
Request
   ↓
Middleware 1
   ↓
Middleware 2
   ↓
Middleware 3
   ↓
Route Handler
   ↓
Response
```

The order of registration matters.

Express executes middleware sequentially in the order they are declared.

---

# Installing Required Packages

Two packages were installed:

```bash
npm install cors
npm install cookie-parser
```

---

# CORS

## What Problem Does CORS Solve?

Browsers enforce the Same-Origin Policy.

Example:

```text
Frontend: localhost:3000
Backend: localhost:8000
```

Although both run locally, they are considered different origins.

Without proper configuration, the browser blocks requests.

---

## Configuring CORS

```js
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
```

---

### origin

Specifies which frontend URLs can access the backend.

Example:

```js
origin: "http://localhost:3000"
```

---

### credentials

Allows cookies and authentication-related information to be sent.

```js
credentials: true
```

This becomes important when implementing authentication systems.

---

# Cookie Parser

Cookies are small pieces of data stored in the browser.

Many authentication systems use cookies to store:

* Session IDs
* Access Tokens
* Refresh Tokens

---

## Configuration

```js
app.use(cookieParser());
```

This middleware parses cookies and makes them available through:

```js
req.cookies
```

Without `cookie-parser`, accessing cookies becomes more difficult.

---

# Express Configuration Middlewares

## JSON Parser

```js
app.use(express.json({ limit: "16kb" }));
```

Parses incoming JSON request bodies.

Example:

```json
{
  "username": "akshat"
}
```

The limit prevents excessively large payloads.

---

## URL Encoded Parser

```js
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);
```

Parses form data submitted from HTML forms.

---

## Static Files Middleware

```js
app.use(express.static("public"));
```

Allows Express to serve files from the `public` directory.

Examples:

* Images
* Documents
* Videos
* CSS files

---

# Custom API Response Structure

## Why Create ApiResponse?

Without standardization:

```js
res.json(data);
```

Different developers may return responses in different formats.

Example:

```json
{
  "user": {}
}
```

or

```json
{
  "data": {}
}
```

or

```json
{
  "result": {}
}
```

This creates inconsistency.

---

## ApiResponse Class

```js
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
```

---

## Response Format

Example:

```js
new ApiResponse(
  200,
  userData,
  "User fetched successfully"
);
```

Produces:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "User fetched successfully",
  "success": true
}
```

---

## Benefits

* Consistent API responses
* Easier frontend integration
* Better readability
* Easier debugging

---

# Custom API Error Structure

## Why Create ApiError?

Instead of throwing generic errors:

```js
throw new Error("Something went wrong");
```

we create structured application errors.

---

## ApiError Class

```js
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    error = [],
    stack = "",
  ) {
    super(message);

    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.succes = false;
    this.errors = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

---

## Why Extend Error?

```js
class ApiError extends Error
```

This allows ApiError to behave like a native JavaScript error while providing additional custom properties.

Example:

```js
throw new ApiError(
  404,
  "User not found"
);
```

---

## Additional Information Stored

```js
statusCode
message
errors
stack
```

This creates richer error objects that are easier to debug and send to clients.

---

# Async Error Handling Problem

Consider a controller:

```js
try {
  await User.findById(id);
} catch (error) {
  // Handle error
}
```

Writing this repeatedly in every route becomes tedious.

---

# asyncHandler Utility

## Goal

Create a reusable wrapper that automatically catches errors from async functions.

---

## Implementation

```js
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(
      requestHandler(req, res, next)
    ).catch((err) => next(err));
  };
};

export { asyncHandler };
```

---

## Usage

Instead of:

```js
app.get("/users", async (req, res) => {
  try {
    ...
  } catch (error) {
    ...
  }
});
```

We can write:

```js
app.get(
  "/users",
  asyncHandler(async (req, res) => {
    ...
  }),
);
```

---

## What Happens Internally?

```text
Async Route
      ↓
asyncHandler
      ↓
Promise.resolve()
      ↓
Error?
      ↓
next(error)
      ↓
Error Middleware
```

This removes repetitive try-catch blocks from every controller.

---

# Higher-Order Function Concept

`asyncHandler` is an example of a Higher-Order Function.

A Higher-Order Function is a function that:

* Accepts another function as an argument.
* Returns a new function.

Example:

```js
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    ...
  };
};
```

This pattern is widely used in Express applications.

---

# Key Learnings

* `dotenv` loads environment variables into Node.js.
* Server startup should depend on successful database connection.
* Middleware sits between the request and response cycle.
* Middleware execution order matters.
* `next()` passes control to the next middleware.
* CORS allows controlled communication between frontend and backend.
* `cookie-parser` makes browser cookies accessible through `req.cookies`.
* Express provides built-in middleware for JSON, URL-encoded data, and static files.
* `ApiResponse` standardizes successful API responses.
* `ApiError` standardizes error objects.
* Extending JavaScript's `Error` class provides richer error handling.
* `asyncHandler` eliminates repetitive try-catch blocks.
* Higher-Order Functions are commonly used to create reusable Express utilities.

---

# Summary

In this lesson, we configured Express middleware, enabled CORS, added cookie parsing, loaded environment variables using dotenv, and improved the application's architecture by introducing custom API response and error classes. We also created a reusable async error handler to centralize asynchronous error management and reduce repetitive code. These utilities form the foundation for building scalable, maintainable, and production-ready Express APIs.
