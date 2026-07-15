# Learnings.md

# Access Tokens, Refresh Tokens, Cookies & Authentication Middleware

---

# Table of Contents

1. Authentication vs Authorization
2. Why Token-Based Authentication?
3. JWT (JSON Web Token)
4. Access Token
5. Refresh Token
6. Access Token vs Refresh Token
7. Why Store Refresh Tokens in Database?
8. Token Generation Helper Function
9. Login Flow
10. Cookies and Security
11. Authentication Middleware
12. Protected Routes
13. Logout Flow
14. Refresh Access Token Endpoint
15. Refresh Token Rotation
16. Complete Authentication Lifecycle
17. Security Best Practices
18. Common Mistakes Fixed During Development
19. Interview Questions
20. Key Takeaways

---

# Authentication vs Authorization

These two concepts are often confused.

## Authentication

Authentication answers:

> Who are you?

Example:

```text
Email: akshat@gmail.com
Password: ********
```

The server verifies the credentials and confirms the identity of the user.

---

## Authorization

Authorization answers:

> What are you allowed to do?

Example:

```text
User A → Upload videos
User B → Delete videos
User C → View videos only
```

The user is already authenticated, but authorization determines what resources they can access.

---

# Why Token-Based Authentication?

Imagine a website without tokens.

```text
Open Website
↓
Enter Password

Open Profile
↓
Enter Password

Upload Video
↓
Enter Password
```

This would create a terrible user experience.

Instead:

```text
Login Once
↓
Receive Tokens
↓
Use Tokens For Future Requests
```

The server no longer needs the user's password for every request.

---

# JWT (JSON Web Token)

JWT is a secure way of transmitting information between client and server.

A JWT consists of:

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

The payload is signed using a secret key.

Example:

```env
ACCESS_TOKEN_SECRET
```

Whenever a token arrives:

```js
jwt.verify(token, secret)
```

is used to verify its authenticity.

---

# Access Token

An Access Token is a short-lived JWT.

Examples:

```text
15 Minutes
30 Minutes
1 Hour
```

Purpose:

```text
Access Protected Resources
```

Examples:

```text
GET /profile
POST /video
DELETE /comment
PATCH /tweet
```

Whenever a protected route is accessed:

```text
Verify Access Token
↓
Valid → Continue
↓
Invalid → Reject
```

---

## Why Keep Access Tokens Short-Lived?

Suppose an attacker somehow steals an access token.

If the token expires quickly:

```text
Token Becomes Useless Soon
```

This reduces security risks significantly.

---

# Refresh Token

A Refresh Token is a long-lived JWT.

Examples:

```text
7 Days
30 Days
90 Days
```

Purpose:

```text
Generate New Access Tokens
```

A Refresh Token does NOT directly access protected resources.

---

## Why Refresh Tokens Exist

Imagine:

```text
Access Token Lifetime = 15 Minutes
```

Without refresh tokens:

```text
User Must Login Every 15 Minutes
```

Poor user experience.

Instead:

```text
Access Token Expires
↓
Refresh Token Sent
↓
Server Verifies Refresh Token
↓
New Access Token Generated
```

The user remains logged in without entering credentials repeatedly.

---

# Access Token vs Refresh Token

| Access Token     | Refresh Token              |
| ---------------- | -------------------------- |
| Short-lived      | Long-lived                 |
| Access resources | Generate new access tokens |
| Sent frequently  | Sent occasionally          |
| Higher exposure  | More securely stored       |
| Expires quickly  | Lasts longer               |

---

# Why Store Refresh Tokens in Database?

Access Tokens are generally not stored in MongoDB.

Refresh Tokens are.

Reasons:

## 1. Logout Support

When a user logs out:

```text
Remove Refresh Token From DB
```

Any previously issued refresh token becomes invalid.

---

## 2. Revocation

If an account is compromised:

```text
Delete Refresh Token
```

The session immediately becomes unusable.

---

## 3. Validation

Whenever a refresh request arrives:

```text
Incoming Refresh Token
            ↓
Compare
            ↓
Database Refresh Token
```

If they match:

```text
Generate New Tokens
```

Otherwise:

```text
Reject Request
```

---

# Token Generation Helper Function

A helper function was created:

```js
generateAccessAndRefreshTokens()
```

Purpose:

* Avoid duplicate code
* Reuse token logic
* Centralize token generation

---

## Final Implementation

```js
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
```

---

## Why findById() Instead of find()?

Correct:

```js
User.findById(userId)
```

Wrong:

```js
User.find(userId)
```

Reason:

```text
find() → Returns Array
findById() → Returns Single Document
```

Since we need:

```js
user.generateAccessToken()
user.generateRefreshToken()
```

we require a single document instance.

---

# Login Flow

## Step 1: Receive Credentials

```js
const { email, username, password } = req.body;
```

---

## Step 2: Validate Input

Correct validation:

```js
if (!(username || email))
```

Meaning:

```text
Username Present → OK
Email Present → OK
Neither Present → Reject
```

---

## Why This Fix Was Needed?

Wrong:

```js
if (!username || !email)
```

This would reject:

```json
{
  "username": "akshat"
}
```

even though username login should be allowed.

---

## Step 3: Find User

```js
const user = await User.findOne({
  $or: [{ username }, { email }],
});
```

Allows login using either:

* Username
* Email

---

## Step 4: Verify Password

```js
const isPasswordValid =
await user.isPasswordCorrect(password);
```

Internally:

```text
Entered Password
↓
bcrypt.compare()
↓
Stored Hash
```

---

## Step 5: Generate Tokens

```js
const {
  accessToken,
  refreshToken,
} =
await generateAccessAndRefreshTokens(
  user._id
);
```

---

## Step 6: Fetch Clean User

Correct:

```js
const loggedInUser =
await User.findById(user._id)
.select("-password -refreshToken");
```

The missing `await` bug was fixed here.

---

## Step 7: Configure Cookies

```js
const options = {
  httpOnly: true,
  secure: true,
};
```

---

## Step 8: Send Cookies

```js
.cookie(
  "accessToken",
  accessToken,
  options
)
.cookie(
  "refreshToken",
  refreshToken,
  options
)
```

---

## Step 9: Return Response

```js
return res.status(200).json(...)
```

Login successful.

---

# Cookies

Cookies allow browsers to automatically send authentication data with future requests.

Instead of manually attaching tokens every time:

```text
Browser Handles It Automatically
```

---

# Cookie Security

## httpOnly

```js
httpOnly: true
```

Prevents JavaScript from reading cookies.

Example:

```js
document.cookie
```

cannot access HttpOnly cookies.

Protects against:

```text
XSS Attacks
Token Theft
```

---

## secure

```js
secure: true
```

Cookies are only sent over HTTPS.

Protects against:

```text
Network Sniffing
Man-in-the-Middle Attacks
```

---

# Authentication Middleware

A middleware was introduced:

```js
verifyJWT
```

Purpose:

```text
Verify User Before Protected Routes Execute
```

---

# Middleware Flow

```text
Request Arrives
      ↓
Extract Token
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

# Extracting Access Token

The middleware checks two locations.

## Cookie

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

Removing "Bearer":

```js
.replace("Bearer ", "")
```

---

# Token Verification

```js
jwt.verify(
  token,
  process.env.ACCESS_TOKEN_SECRET
)
```

If valid:

```text
Continue
```

If invalid:

```text
401 Unauthorized
```

---

# Attaching User To Request

```js
req.user = user;
```

Now any controller can access:

```js
req.user._id
req.user.username
req.user.email
```

without authenticating again.

---

# Protected Routes

Routes can be protected like:

```js
router.post(
  "/logout",
  verifyJWT,
  logoutUser
);
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

## Remove Refresh Token

```js
await User.findByIdAndUpdate(
  req.user._id,
  {
    $set: {
      refreshToken: undefined,
    },
  }
);
```

---

## Clear Cookies

```js
.clearCookie("accessToken")
.clearCookie("refreshToken")
```

---

## Result

```text
Session Destroyed
User Logged Out
```

---

# Refresh Access Token Endpoint

A new endpoint was added:

```js
router.route("/refresh-token")
.post(refreshAccessToken);
```

Purpose:

```text
Generate New Access Token
Without Requiring Login
```

This endpoint is the core reason Refresh Tokens exist.

---

# refreshAccessToken Controller

## Step 1: Get Refresh Token

```js
const incomingRefreshToken =
  req.cookies.refreshToken ||
  req.body.refreshToken;
```

Token can come from:

* Cookies
* Request Body

---

## Step 2: Check Existence

```js
if (!incomingRefreshToken)
```

Return:

```text
401 Unauthorized
```

---

## Step 3: Verify Token

```js
const decodedToken =
jwt.verify(
  incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET
);
```

Checks:

* Signature
* Expiration
* Integrity

---

## Why Separate Secrets?

Example:

```env
ACCESS_TOKEN_SECRET=abc123
REFRESH_TOKEN_SECRET=xyz789
```

Benefits:

* Better security
* Easier rotation
* Separate control

---

## Step 4: Find User

```js
const user =
await User.findById(
  decodedToken?._id
);
```

---

## Step 5: Validate User

```js
if (!user)
```

Reject request.

Possible reasons:

```text
User Deleted
Account Removed
Database Issue
```

---

## Step 6: Compare Refresh Token

```js
if (
  incomingRefreshToken !==
  user?.refreshToken
)
```

This is one of the most important security checks.

---

## Why Compare Against Database?

Suppose:

```text
User Logs Out
```

Database:

```text
refreshToken = null
```

Attacker:

```text
Still Has Old Refresh Token
```

Comparison:

```text
Old Token
    ≠
Database Token
```

Result:

```text
Access Denied
```

---

# Refresh Token Rotation

Whenever a refresh succeeds:

```text
Old Refresh Token
↓
Invalidated
↓
New Refresh Token Generated
```

This is called:

## Refresh Token Rotation

Benefits:

* Better security
* Limits replay attacks
* Makes stolen tokens less useful

---

# Important Code Observation

Current helper returns:

```js
{
  accessToken,
  refreshToken
}
```

But refresh controller expects:

```js
{
  accessToken,
  newRefreshToken
}
```

A cleaner approach:

```js
const {
  accessToken,
  refreshToken:
    newRefreshToken,
} =
await generateAccessAndRefreshTokens(
  user._id
);
```

This renames the returned property during destructuring.

---

# Sending Updated Cookies

```js
.cookie(
  "accessToken",
  accessToken,
  options
)
.cookie(
  "refreshToken",
  newRefreshToken,
  options
)
```

Browser now stores:

```text
New Access Token
New Refresh Token
```

---

# Refresh Token Lifecycle

```text
User Login
      ↓
Access Token Generated
      ↓
Refresh Token Generated
      ↓
Refresh Token Saved In DB
      ↓
Access Token Expires
      ↓
/refresh-token Called
      ↓
Refresh Token Verified
      ↓
Database Comparison
      ↓
Generate New Tokens
      ↓
Update Database
      ↓
Update Cookies
      ↓
Continue Session
```

---

# Complete Authentication Architecture

```text
Register
   ↓
Login
   ↓
Generate Access Token
   ↓
Generate Refresh Token
   ↓
Store Refresh Token In DB
   ↓
Store Tokens In Cookies
   ↓
Protected Routes
   ↓
verifyJWT Middleware
   ↓
Access Token Expires
   ↓
/refresh-token Endpoint
   ↓
Validate Refresh Token
   ↓
Issue New Tokens
   ↓
Continue Session
   ↓
Logout
   ↓
Delete Refresh Token
   ↓
Clear Cookies
```

---

# Common Mistakes Fixed During Development

### Fixed User Lookup

Wrong:

```js
User.find(userId)
```

Correct:

```js
User.findById(userId)
```

---

### Fixed Login Validation

Wrong:

```js
if (!username || !email)
```

Correct:

```js
if (!(username || email))
```

---

### Fixed Missing await

Wrong:

```js
const loggedInUser =
User.findById(...)
```

Correct:

```js
const loggedInUser =
await User.findById(...)
```

---

### Fixed JWT Import

Wrong:

```js
import { jwt }
from "jsonwebtoken"
```

Correct:

```js
import jwt
from "jsonwebtoken"
```

---

# Interview Questions

### Difference between Access Token and Refresh Token?

Access Token accesses resources and is short-lived.

Refresh Token generates new access tokens and is long-lived.

---

### Why store Refresh Tokens in DB?

For:

* Logout
* Revocation
* Validation
* Token Rotation

---

### What is Refresh Token Rotation?

Replacing the old refresh token with a newly generated refresh token whenever a refresh request succeeds.

---

### Why compare Refresh Token with DB?

To ensure it has not been revoked, replaced, or reused.

---

### Why use HttpOnly cookies?

To prevent JavaScript from reading tokens and reduce XSS attacks.

---

### Why use Secure cookies?

To ensure tokens travel only through HTTPS.

---

### What does verifyJWT do?

Verifies token validity and authenticates the user before protected routes execute.

---

### What is req.user?

User information attached by authentication middleware after successful verification.

---

# Key Takeaways

* JWT enables stateless authentication.
* Access Tokens are short-lived.
* Refresh Tokens are long-lived.
* Refresh Tokens should be stored in the database.
* Cookies simplify token storage.
* `httpOnly` protects against XSS attacks.
* `secure` ensures HTTPS-only transmission.
* Middleware protects sensitive routes.
* `verifyJWT` authenticates users before controllers execute.
* `req.user` provides authenticated user information.
* Refresh Tokens allow seamless session continuation.
* Refresh Token Rotation improves security.
* Logout should remove refresh tokens and clear cookies.
* Token comparison against the database prevents reuse of revoked tokens.
