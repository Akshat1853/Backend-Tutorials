# UserAndVideoModelWithHooksAndJWT

## Overview

In this lesson, we created the application's **User** and **Video** models and introduced several important backend concepts that are commonly used in production-grade applications:

* Authentication using JWT
* Password hashing using bcrypt
* Mongoose Schema Methods
* Mongoose Middleware (Hooks)
* Document References using ObjectId
* Access Token & Refresh Token architecture
* Schema indexing
* Mongoose Plugins

Since basic Mongoose model creation had already been covered earlier, this lesson focused primarily on advanced model capabilities and authentication-related functionality.

---

# Packages Introduced

## bcrypt

```bash
npm install bcrypt
```

Used for password hashing.

Passwords should never be stored directly in the database.

Bad:

```text
password = "mypassword123"
```

Good:

```text
password = "$2b$10$..."
```

Hashing converts passwords into irreversible strings that cannot be converted back into the original password.

---

## jsonwebtoken

```bash
npm install jsonwebtoken
```

Used to create and verify JWTs (JSON Web Tokens).

JWTs are commonly used for:

* User authentication
* Session management
* Protected routes
* Authorization

---

## mongoose-aggregate-paginate-v2

```bash
npm install mongoose-aggregate-paginate-v2
```

Provides pagination support for aggregation pipelines.

Useful when dealing with:

* Large video collections
* Search results
* User feeds
* Infinite scrolling

Instead of returning thousands of records at once, results can be returned page by page.

---

# User Model

File:

```text
models/user.model.js
```

---

## User Schema

The User model stores information related to application users.

### username

```js
username: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  index: true,
}
```

### New Concepts

#### lowercase

Automatically converts input to lowercase.

Example:

```text
AkShAt
```

becomes

```text
akshat
```

This helps avoid duplicate usernames caused by case differences.

---

#### trim

Removes extra whitespace.

Example:

```text
"   akshat   "
```

becomes

```text
"akshat"
```

---

#### index

Creates a database index.

Indexes improve search performance.

Without index:

```text
Database scans every document
```

With index:

```text
Database uses optimized lookup structure
```

Commonly used on:

* usernames
* emails
* frequently searched fields

---

## Email Field

```js
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
}
```

Ensures:

* Every user has an email
* Duplicate emails are prevented
* Case consistency is maintained

---

## Avatar

```js
avatar: {
  type: String,
  required: true,
}
```

Stores a Cloudinary URL.

Example:

```text
https://res.cloudinary.com/...
```

The actual image is stored on Cloudinary.

Only the URL is stored in MongoDB.

---

## Cover Image

```js
coverImage: {
  type: String,
}
```

Optional profile cover image URL.

---

## Watch History

```js
watchHistory: [
  {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
]
```

This creates a relationship between:

```text
User
 ↓
Video
```

A user can store references to videos they have watched.

---

# MongoDB Relationships

MongoDB does not have joins like SQL databases.

Instead, relationships are usually created using:

```js
Schema.Types.ObjectId
```

Example:

```js
{
  type: Schema.Types.ObjectId,
  ref: "Video"
}
```

The `ref` property tells Mongoose which model the ObjectId belongs to.

Later we can use:

```js
.populate()
```

to retrieve complete video information.

---

# Password Storage

```js
password: {
  type: String,
  required: [true, "Password is required"],
}
```

The password is never stored in plain text.

Before saving, it gets hashed using bcrypt.

---

# Mongoose Hooks (Middleware)

One of the most important topics of this lesson.

---

## What is a Hook?

Hooks allow code to execute automatically before or after certain database operations.

Think of them as middleware for Mongoose.

Example:

```text
Save User
    ↓
Hook Executes
    ↓
User Saved
```

---

## Pre Save Hook

```js
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

---

## Why Use a Hook?

Without hooks:

```js
user.password = bcrypt.hash(...);
user.save();
```

Every developer would need to remember to hash passwords manually.

Using a hook guarantees:

```text
Any save operation
      ↓
Password automatically hashed
```

---

## this Keyword

Inside document middleware:

```js
this
```

refers to the current document being saved.

Example:

```js
this.password
```

means:

```text
Current User's Password
```

---

## isModified()

```js
this.isModified("password")
```

Checks whether the password field has changed.

---

### Why is this Important?

Imagine a user updates only:

```text
Profile Picture
```

If password hashing runs again:

```text
Already Hashed Password
      ↓
Hash Again
      ↓
Login Breaks
```

Therefore:

```js
if (!this.isModified("password"))
```

prevents unnecessary hashing.

---

## Salt Rounds

```js
bcrypt.hash(password, 10)
```

The number:

```text
10
```

represents salt rounds.

Higher values:

* More secure
* Slower

Lower values:

* Faster
* Less secure

10 is a commonly used balance.

---

# Schema Methods

Mongoose allows custom methods to be attached directly to documents.

---

## Password Verification Method

```js
userSchema.methods.isPasswordCorrect = async function (
  password
) {
  return await bcrypt.compare(
    password,
    this.password
  );
};
```

---

### Why Compare Instead of Hash Again?

Hashing the same password twice produces different hashes.

Therefore:

```js
bcrypt.compare()
```

must be used.

Example:

```js
const isValid =
  await user.isPasswordCorrect(
    enteredPassword
  );
```

Returns:

```text
true
```

or

```text
false
```

---

# JWT (JSON Web Token)

## Why JWT?

HTTP is stateless.

After login, the server needs a way to identify the user.

JWT solves this problem.

---

## Authentication Flow

```text
User Login
      ↓
Credentials Verified
      ↓
Generate Token
      ↓
Send Token
      ↓
Client Stores Token
      ↓
Protected Requests
```

---

# Access Token

## Method

```js
userSchema.methods.generateAccessToken =
  function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn:
          process.env.ACCESS_TOKEN_EXPIRY,
      },
    );
  };
```

---

## Payload

Payload contains user information.

```js
{
  _id,
  email,
  username,
  fullName
}
```

This information travels inside the token.

---

## Secret Key

```js
process.env.ACCESS_TOKEN_SECRET
```

Used to sign the token.

Without the secret:

```text
Token Cannot Be Verified
```

---

## Expiry

```js
process.env.ACCESS_TOKEN_EXPIRY
```

Example:

```text
15m
1h
1d
```

Access tokens should be short-lived.

---

# Refresh Token

## Method

```js
userSchema.methods.generateRefreshToken =
  function () {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn:
          process.env.REFRESH_TOKEN_EXPIRY,
      },
    );
  };
```

---

## Why Separate Refresh Tokens?

Access tokens expire quickly.

Instead of forcing users to log in again:

```text
Access Token Expires
        ↓
Refresh Token Used
        ↓
New Access Token Generated
```

This improves user experience.

---

## Why Only _id?

Refresh tokens usually contain minimal information.

```js
{
  _id: user._id
}
```

Smaller payload = smaller token.

---

# Access Token vs Refresh Token

| Access Token              | Refresh Token                      |
| ------------------------- | ---------------------------------- |
| Short lifetime            | Long lifetime                      |
| Sent frequently           | Used occasionally                  |
| Contains user information | Usually minimal payload            |
| Used for route access     | Used to generate new access tokens |

---

# Video Model

File:

```text
models/video.model.js
```

---

## Owner Relationship

```js
owner: {
  type: Schema.Types.ObjectId,
  ref: "User",
}
```

This creates:

```text
User
 ↓
Owns
 ↓
Video
```

Relationship.

Every video belongs to a user.

---

# Video Statistics Fields

## Views

```js
views: {
  type: Number,
  default: 0,
}
```

Tracks video view count.

---

## Publish Status

```js
isPublished: {
  type: Boolean,
  default: true,
}
```

Allows:

```text
Draft Videos
Private Videos
Published Videos
```

to be managed easily.

---

# Mongoose Plugins

## Plugin Registration

```js
videoSchema.plugin(
  mongooseAggregatePaginate
);
```

Plugins add reusable functionality to schemas.

This plugin adds pagination capabilities to aggregation pipelines.

Benefits:

* Better performance
* Easier API development
* Cleaner pagination logic


# Key Learnings

* Mongoose hooks automate repetitive database operations.
* Passwords should always be hashed before storage.
* `isModified()` prevents unnecessary password rehashing.
* JWT enables stateless authentication.
* Access Tokens and Refresh Tokens serve different purposes.
* Schema methods allow reusable document-specific functionality.
* ObjectId references create relationships between collections.
* `populate()` can later be used to fetch related documents.
* Database indexes improve query performance.
* Mongoose plugins add reusable functionality to schemas.
* Video and User collections are connected through references, forming the foundation of the application's data model.
