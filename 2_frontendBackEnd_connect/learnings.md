# Backend Learnings

## JavaScript Module Systems

JavaScript provides two primary module systems for sharing code between files.

### 1. CommonJS (CJS)

Traditionally used in Node.js applications.

```js
const express = require("express");
```

**Characteristics:**

* Uses `require()` for importing modules.
* Uses `module.exports` for exporting modules.
* Loads modules synchronously.
* Common in older Node.js projects.

---

### 2. ES Modules (ESM)

The modern JavaScript module standard.

```js
import express from "express";
```

**Characteristics:**

* Uses `import` and `export`.
* Official JavaScript module system.
* Supports modern module loading behavior.
* Preferred in new projects.

---

## Why Modules Are Needed

As applications grow, code is split into multiple files instead of keeping everything in a single file.

Benefits:

* Better code organization.
* Reusability.
* Easier maintenance.
* Separation of concerns.

---

## Using ES Modules in Node.js

When using:

```js
import express from "express";
```

Node.js may throw:

```text
Cannot use import statement outside a module
```

### Reason

Node.js treats `.js` files as CommonJS by default.

### Solution

Add the following to `package.json`:

```json
{
  "type": "module"
}
```

This tells Node.js to treat JavaScript files as ES Modules.

---

# Frontend and Backend Connection

## Creating an API with Express

An Express server can expose endpoints that return data to clients.

Example:

```js
app.get("/api/jokes", (req, res) => {
  res.send(jokes);
});
```

When a request is made to `/api/jokes`, the server responds with JSON data.

---

## Consuming the API in React

The frontend can fetch data from the backend using Axios.

```js
axios.get("http://localhost:3000/api/jokes");
```

The received data is stored in React state and rendered on the page.

---

# Understanding CORS

While connecting the React frontend and Express backend, the following error occurred:

```text
Access to XMLHttpRequest has been blocked by CORS policy
```

---

## Why the Error Occurred

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

Although both use `localhost`, their ports are different.

### What is an Origin?

An origin is defined by:

```text
Protocol + Domain + Port
```

Examples:

```text
http://localhost:5173
http://localhost:3000
```

Since the ports are different, the browser treats them as different origins.

---

## What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that controls requests between different origins.

By default, browsers block requests from one origin to another unless permission is explicitly granted.

---

## Why Postman Works but the Browser Doesn't

Postman does not enforce browser security policies.

Therefore:

* Requests may work in Postman.
* The same requests can fail in a browser due to CORS restrictions.

---

# Resolving the CORS Issue

## Solution 1: Vite Proxy (Development)

Vite can forward frontend requests to the backend.

Configuration:

```js
server: {
  proxy: {
    "/api": "http://localhost:3000"
  }
}
```

Frontend request:

```js
axios.get("/api/jokes");
```

### How It Works

```text
Browser
   ↓
Vite Proxy
   ↓
Backend Server
```

The browser believes the request is being sent to the same origin, while Vite forwards it to the backend.

This is the most common approach during development.

---

## Solution 2: Enable CORS on the Backend

The backend can explicitly allow requests from specific origins.

Example:

```js
app.use(cors());
```

Or allow only a specific frontend:

```js
app.use(cors({
  origin: "http://localhost:5173"
}));
```

The server sends special CORS headers, allowing the browser to accept the request.

---

# Development vs Production

### Development

* Vite Proxy is simple and convenient.
* Commonly used while frontend and backend run on separate local ports.

### Production

* Proper CORS configuration is usually implemented on the backend.
* Only trusted origins should be allowed.

---

# Key Takeaways

* JavaScript supports both CommonJS and ES Modules.
* Modern projects generally use ES Modules (`import` / `export`).
* Node.js requires `"type": "module"` in `package.json` to use ES Modules.
* React applications commonly communicate with Express APIs using Axios.
* `localhost:5173` and `localhost:3000` are different origins because their ports differ.
* CORS is a browser security feature that restricts cross-origin requests.
* Vite Proxy is a common development-time solution for CORS issues.
* Backend CORS configuration is the standard production solution.
