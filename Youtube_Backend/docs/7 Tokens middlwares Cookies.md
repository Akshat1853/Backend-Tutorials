# Access Tokens, Refresh Tokens, Middleware & Cookies

## Overview

In this lesson, we implemented a complete authentication system using JWT (JSON Web Tokens), Access Tokens, Refresh Tokens, Cookies, and Authentication Middleware.

This authentication architecture is widely used in modern web applications because it provides:

* Secure authentication
* Better user experience
* Stateless request handling
* Token-based authorization
* Automatic session renewal
* Protection of private routes

---

# Authentication vs Authorization

These two terms are often confused.

## Authentication

Authentication means verifying **who the user is**.

Example:

```text
User enters:
Email: akshat@gmail.com
Password: ********
```

Server checks whether the credentials are correct.

If correct:

```text
User authenticated successfully
```

---

## Authorization

Authorization means determining **what the authenticated user is allowed to do**.

Example:

```text
User A can upload videos
User B can delete videos
User C can only view videos
```

The user is already authenticated, but authorization decides which resources they can access.

---

# Why Do We Need Tokens?

Imagine a user logs into a website.

Without tokens:

```text
Open website
Enter email
Enter password

Open profile
Enter email
Enter password

Upload video
Enter email
Enter password
```

This would create a terrible user experience.

Instead:

```text
Login once
Receive token
Use token for future requests
```

The token acts as proof that the user has already logged in.

---

# JWT (JSON Web Token)

JWT is a compact, secure way of transmitting information between client and server.

A JWT generally contains:

```text
Header
Payload
Signature
```

Example Payload:

```json
{
    "_id": "123456",
    "username": "akshat"
}
```

The token is digitally signed using a secret key.

Example:

```js
ACCESS_TOKEN_SECRET
```

When a request arrives, the server verifies the signature.

If the signature is valid:

```text
Token is trusted
```

Otherwise:

```text
Token is rejected
```

---

# Access Token

An Access Token is a short-lived JWT.

Examples:

```text
15 minutes
30 minutes
1 hour
```

Its purpose is to authorize access to protected resources.

Example:

```text
GET /profile
POST /tweet
DELETE /comment
PATCH /video
```

Whenever a user accesses a protected endpoint, the server verifies the access token.

### Access Token Flow

```text
User Logs In
      ↓
Access Token Generated
      ↓
User Requests Protected Resource
      ↓
Server Verifies Token
      ↓
Access Granted
```

---

## Why Keep Access Tokens Short-Lived?

If an attacker steals an access token:

```text
Token will expire soon
```

This reduces the security risk.

Because of this, access tokens are intentionally given a short expiration time.

---

# Refresh Token

A Refresh Token is a long-lived token.

Examples:

```text
7 Days
30 Days
90 Days
```

Its purpose is not to access resources.

Instead, it is used to generate a new access token.

---

## Why Refresh Tokens Exist

Imagine:

```text
Access Token expires after 15 minutes
```

Without refresh tokens:

```text
User must login again every 15 minutes
```

That would be frustrating.

Instead:

```text
Access Token expires
        ↓
Refresh Token sent
        ↓
Server validates refresh token
        ↓
New Access Token generated
```

The user remains logged in without entering credentials again.

---

# Difference Between Access Token and Refresh Token

| Access Token               | Refresh Token               |
| -------------------------- | --------------------------- |
| Short-lived                | Long-lived                  |
| Access protected resources | Generate new access tokens  |
| Sent frequently            | Used occasionally           |
| Higher exposure risk       | Stored more securely        |
| Usually expires quickly    | Can live for days or months |

---

# Why Store Refresh Tokens in Database?

Access Tokens are generally not stored in the database.

Refresh Tokens are.

### Reasons

#### 1. Logout Support

When a user logs out:

```text
Remove refresh token from DB
```

Now any previously issued refresh token becomes invalid.

---

#### 2. Token Revocation

If a token is compromised:

```text
Delete refresh token from database
```

The attacker can no longer refresh sessions.

---

#### 3. Validation

Whenever a refresh request arrives:

```text
Incoming Refresh Token
            ↓
Compare
            ↓
Database Refresh Token
```

If both match:

```text
Generate new Access Token
```

Otherwise:

```text
Reject request
```

---

# Token Generation Helper Function

A helper function was created:

```js
generateAccessAndRefreshTokens()
```

Purpose:

* Reusable logic
* Cleaner controllers
* Single source of token generation

---

## Implementation Flow

```js
const generateAccessAndRefreshTokens = async(userId) => {
    const user = await User.find(userId)

    const accessToken = user.generateAccessToken()

    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken

    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}
```

---

## Step-by-Step Breakdown

### Find User

```js
const user = await User.find(userId)
```

Fetches the user from the database.

---

### Generate Access Token

```js
const accessToken = user.generateAccessToken()
```

Creates a short-lived JWT.

---

### Generate Refresh Token

```js
const refreshToken = user.generateRefreshToken()
```

Creates a long-lived JWT.

---

### Store Refresh Token

```js
user.refreshToken = refreshToken
```

Stores the refresh token in MongoDB.

---

### Save Without Validation

```js
await user.save({ validateBeforeSave: false })
```

Validation is skipped because only the refresh token field is being updated.

---

# Login User Flow

The login controller performs several operations.

---

## Step 1: Get User Credentials

```js
const { email, username, password } = req.body
```

Extract user input.

---

## Step 2: Validate Input

```js
if (!username || !email)
```

Ensure required credentials exist.

---

## Step 3: Find User

```js
const user = await User.findOne({
    $or: [{ username }, { email }]
})
```

Allows login using:

* Username
* Email

---

## Step 4: Verify Password

```js
const isPasswordValid =
await user.isPasswordCorrect(password)
```

Internally compares:

```text
Entered Password
      ↓
Hashed Password
      ↓
bcrypt.compare()
```

---

## Step 5: Generate Tokens

```js
const { accessToken, refreshToken } =
await generateAccessAndRefreshTokens(user._id)
```

Both tokens are generated.

---

## Step 6: Remove Sensitive Fields

```js
.select("-password -refreshToken")
```

Prevents exposing sensitive information.

---

## Step 7: Configure Cookie Options

```js
const options = {
    httpOnly: true,
    secure: true
}
```

---

## Step 8: Send Cookies

```js
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
```

Browser stores tokens automatically.

---

## Step 9: Return Response

```js
return res.status(200).json(...)
```

Login successful.

---

# Cookies

Cookies are small pieces of data stored in the browser.

Instead of manually sending tokens each time:

```text
Browser automatically sends cookies
```

This makes authentication easier.

---

# Cookie Security Options

## httpOnly

```js
httpOnly: true
```

Prevents JavaScript from reading cookies.

Example:

```js
document.cookie
```

Cannot access HttpOnly cookies.

---

### Why Is This Important?

Protects against:

```text
XSS Attacks
Cookie Theft
Token Leakage
```

---

## secure

```js
secure: true
```

Cookies are only sent through HTTPS connections.

Without HTTPS:

```text
Cookie not transmitted
```

This prevents interception over insecure networks.

---

# Authentication Middleware

Middleware is a function that executes between:

```text
Request
   ↓
Middleware
   ↓
Controller
```

It can:

* Validate requests
* Modify requests
* Block requests
* Attach additional data

---

# verifyJWT Middleware

A new middleware file was created:

```js
auth.middleware.js
```

Purpose:

```text
Verify Access Token
```

before protected routes execute.

---

# Middleware Flow

```text
Incoming Request
        ↓
Get Token
        ↓
Verify Token
        ↓
Find User
        ↓
Attach User To Request
        ↓
next()
```

---

# Extracting the Token

The middleware checks two locations.

## Cookies

```js
req.cookies?.accessToken
```

---

## Authorization Header

```js
req.header("Authorization")
```

Example:

```http
Authorization: Bearer eyJhbGc...
```

Removing Bearer:

```js
.replace("Bearer ", "")
```

Result:

```text
Only the JWT remains
```

---

# Token Verification

```js
jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET
)
```

The token is decoded and verified.

If invalid:

```text
Unauthorized
```

If valid:

```text
Continue processing
```

---

# Finding User

```js
const user = await User.findById(
    decodedToken._id
)
```

Ensures the user still exists.

---

# Removing Sensitive Fields

```js
.select("-password -refreshToken")
```

The middleware should never expose sensitive data.

---

# Attaching User to Request

```js
req.user = user
```

This is extremely useful.

Now every protected controller can access:

```js
req.user._id
req.user.username
req.user.email
```

without querying authentication again.

---

# next()

```js
next()
```

Transfers control to the next middleware or controller.

Without:

```js
next()
```

the request would get stuck.

---

# Protected Routes

Before:

```js
router.post("/logout", logoutUser)
```

Anyone could call this endpoint.

---

After:

```js
router.post(
    "/logout",
    verifyJWT,
    logoutUser
)
```

Flow:

```text
Request
   ↓
verifyJWT
   ↓
logoutUser
```

Only authenticated users can proceed.

---

# Logout Flow

The logout controller performs session cleanup.

---

## Remove Refresh Token

```js
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
            refreshToken: undefined
        }
    }
)
```

The stored refresh token is removed.

---

## Why Remove It?

Imagine:

```text
Attacker has old refresh token
```

But:

```text
Database refresh token = null
```

Comparison fails.

Result:

```text
Refresh denied
```

This effectively terminates the session.

---

## Clear Cookies

```js
.clearCookie("accessToken")
.clearCookie("refreshToken")
```

Removes both browser cookies.

---

## Send Response

```js
User Logged Out Successfully
```

Session ends completely.

---

# Complete Authentication Lifecycle

```text
User Registers
        ↓
User Logs In
        ↓
Generate Access Token
        ↓
Generate Refresh Token
        ↓
Store Refresh Token in DB
        ↓
Send Tokens as Cookies
        ↓
Access Protected Routes
        ↓
verifyJWT Middleware
        ↓
Token Valid
        ↓
Allow Request
        ↓
Access Token Expires
        ↓
Refresh Token Used
        ↓
New Access Token Generated
        ↓
User Continues Working
        ↓
Logout
        ↓
Refresh Token Removed
        ↓
Cookies Cleared
        ↓
Session Destroyed
```

---

# Security Best Practices Learned

### Always Hash Passwords

Never store plain-text passwords.

Use:

```js
bcrypt
```

---

### Use Short-Lived Access Tokens

Reduces damage if compromised.

---

### Store Refresh Tokens Securely

Prefer database storage for revocation and validation.

---

### Use HttpOnly Cookies

Prevents JavaScript access.

---

### Use Secure Cookies

Transmit only over HTTPS.

---

### Protect Sensitive Routes

Always use authentication middleware.

---

### Remove Sensitive Fields

Never send:

```text
Password
Refresh Token
```

inside API responses.

---

# Interview Questions

### What is the difference between Access Token and Refresh Token?

Access Token is short-lived and used to access resources. Refresh Token is long-lived and used to generate new access tokens.

---

### Why store Refresh Tokens in the database?

For validation, revocation, logout support, and improved security.

---

### Why use HttpOnly cookies?

To prevent JavaScript from accessing authentication tokens and reduce XSS attacks.

---

### Why use Secure cookies?

To ensure cookies are only transmitted over HTTPS.

---

### What does JWT middleware do?

It verifies incoming tokens, authenticates the user, and allows access to protected routes.

---

### What is req.user?

A custom property attached by authentication middleware containing the authenticated user's information.

---

# Key Takeaways

* JWT provides stateless authentication.
* Access Tokens are short-lived.
* Refresh Tokens are long-lived.
* Refresh Tokens are stored in the database.
* Cookies can securely store tokens.
* `httpOnly` and `secure` improve security.
* Middleware protects private routes.
* `verifyJWT` authenticates users before controller execution.
* `req.user` makes authenticated user data available throughout the request lifecycle.
* Logout should remove refresh tokens and clear cookies.
