# Learnings.md

# Writing Update Controllers for Users (Part 1)

---

# Overview

In the previous lessons, we built the authentication system:

* User Registration
* Login
* Logout
* JWT Authentication
* Refresh Tokens
* Authentication Middleware

Now that users can securely authenticate themselves, the next logical step is allowing them to **manage their own account**.

In this lesson, we implemented several controllers that allow authenticated users to:

* Change Password
* Fetch Current User
* Update Profile Information
* Update Avatar
* Update Cover Image

These controllers form the **User Profile Management** layer of our backend.

---

# User Account Management APIs

The following controllers were added:

```text
changeCurrentPassword()

getCurrentUser()

updateAccountDetails()

updateUserAvatar()

updateUserCoverImage()
```

Notice something important:

Every one of these controllers works only for an **authenticated user**.

This means these routes should always be protected by the `verifyJWT` middleware.

Flow:

```text
Client
   │
   ▼
verifyJWT Middleware
   │
   ▼
req.user Available
   │
   ▼
Controller Executes
```

Without authentication, users should never be allowed to update account information.

---

# Understanding req.user

One of the biggest advantages of authentication middleware is that every protected controller automatically receives the logged-in user's information.

Earlier, inside `verifyJWT`, we wrote:

```js
req.user = user;
```

This line becomes extremely useful.

Instead of doing:

```text
Client sends userId
```

we can simply use:

```js
req.user._id
```

This ensures:

* User cannot modify another user's account
* Backend always knows who is making the request
* No need to trust client-provided IDs

This is one of the most common authentication patterns used in production applications.

---

# Change Current Password Controller

Purpose:

Allow the authenticated user to change their password.

Controller:

```js
const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    ...

});
```

---

# Step 1: Receive Passwords

```js
const { oldPassword, newPassword } = req.body;
```

The client sends:

```json
{
    "oldPassword": "old123",
    "newPassword": "new456"
}
```

Both passwords are required.

---

# Step 2: Fetch Current User

```js
const user = await User.findById(req.user?._id);
```

Notice:

We never trust the frontend to send the user ID.

Instead:

```text
JWT
   │
verifyJWT
   │
req.user
   │
Find User
```

This makes the API much more secure.

---

# Step 3: Verify Old Password

```js
const isPasswordCorrect =
await user.isPasswordCorrect(oldPassword);
```

This step is extremely important.

Imagine if we skipped this check.

Anyone with access to an unlocked device could simply change the password.

Instead:

```text
Entered Old Password
          │
          ▼
bcrypt.compare()
          │
          ▼
Stored Password Hash
```

If passwords match:

```text
Continue
```

Otherwise:

```text
Throw Error
```

---

# Step 4: Reject Incorrect Password

```js
if (!isPasswordCorrect) {
    throw new ApiError(
        404,
        "Invalid old password"
    );
}
```

The password is changed **only** after the existing password is verified.

---

# Step 5: Assign New Password

```js
user.password = newPassword;
```

Notice something interesting.

We are assigning a plain-text password.

```text
newPassword = "abc123"
```

But MongoDB will **never** store it as plain text.

Why?

Because earlier we created a Mongoose **pre-save hook**.

That hook automatically performs:

```text
Plain Password
      │
      ▼
bcrypt.hash()
      │
      ▼
Hashed Password
```

before saving.

---

# Step 6: Save User

```js
await user.save({
    validateBeforeSave: false
});
```

This writes the updated password to the database.

---

# Why Use save() Instead of findByIdAndUpdate()?

This is a very important Mongoose concept.

Many beginners write:

```js
User.findByIdAndUpdate(...)
```

for everything.

That would be wrong for passwords.

Why?

Because:

```text
findByIdAndUpdate()

does NOT trigger

pre("save") middleware
```

Our password hashing exists inside:

```text
pre("save")
```

Therefore:

```js
user.password = newPassword;

await user.save();
```

is required.

Otherwise:

```text
Password
```

would be stored directly in MongoDB without hashing.

That would be a major security issue.

---

# save() vs findByIdAndUpdate()

## Use save()

When:

* Schema middleware should run
* Password hashing should happen
* Validation is required
* Working with an existing document

Examples:

```text
Password Updates

Email Verification

Any logic inside pre-save hooks
```

---

## Use findByIdAndUpdate()

When:

* Direct updates are enough
* No schema middleware is required
* Better performance is desired

Examples:

```text
Avatar

Cover Image

Full Name

Email
```

---

# getCurrentUser Controller

Purpose:

Return the currently logged-in user's information.

Controller:

```js
const getCurrentUser =
asyncHandler(async (req, res) => {

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        );

});
```

---

# Why No Database Query?

Notice:

```js
req.user
```

is already available.

Earlier:

```text
verifyJWT

↓

User fetched

↓

req.user assigned
```

Therefore:

No additional query is required.

This saves:

* Database calls
* Response time
* Server resources

---

# updateAccountDetails Controller

Purpose:

Update the user's profile information.

Current implementation updates:

* Full Name
* Email

---

# Step 1: Receive Input

```js
const {
    fullName,
    email
} = req.body;
```

---

# Step 2: Validate Input

```js
if (!fullName || !email)
```

Reject empty fields.

Always validate incoming data before updating the database.

---

# Step 3: Update User

```js
const user =
await User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
            fullName,
            email
        }
    },
    {
        new: true
    }
)
.select("-password");
```

---

# Understanding $set

MongoDB provides update operators.

One of the most common is:

```text
$set
```

Example:

```js
$set: {
    fullName: "Akshat Dua"
}
```

Only updates the specified fields.

Everything else remains unchanged.

---

# Why Use { new: true }?

Default behavior:

```text
Returns old document
```

Using:

```js
{
    new: true
}
```

returns:

```text
Updated document
```

which is usually what APIs should send back.

---

# Why Remove Password?

```js
.select("-password")
```

Sensitive information should never be returned to the client.

Examples:

Never expose:

```text
Password

Refresh Token

OTP

Reset Tokens
```

---

# Updating Avatar

Purpose:

Allow users to upload a new profile picture.

Flow:

```text
Client

↓

Multer

↓

Temporary File

↓

Cloudinary

↓

Image URL

↓

MongoDB Updated
```

---

# Step 1: Receive File

```js
const avatarLocalPath =
req.file?.path;
```

Multer stores the uploaded file temporarily.

---

# Step 2: Validate File

```js
if (!avatarLocalPath)
```

Reject requests without an uploaded file.

---

# Step 3: Upload to Cloudinary

```js
const avatar =
await uploadOnCloudinary(
    avatarLocalPath
);
```

Cloudinary uploads the image and returns:

```json
{
    "url": "https://..."
}
```

---

# Step 4: Validate Upload

```js
if (!avatar.url)
```

If upload failed:

Reject request.

---

# Step 5: Update Database

The controller updates:

```text
avatar
```

field with the new Cloudinary URL.

---

# Important Observation

Your code currently uses:

```js
User.findOneAndUpdate(
    req.user._id,
    ...
)
```

A better implementation is:

```js
User.findByIdAndUpdate(
    req.user._id,
    {
        $set: {
            avatar: avatar.url
        }
    },
    {
        new: true
    }
);
```

or

```js
User.findOneAndUpdate(
    {
        _id: req.user._id
    },
    ...
);
```

because `findOneAndUpdate()` expects a filter object.

---

# Updating Cover Image

The workflow is almost identical to updating the avatar.

Flow:

```text
Receive File

↓

Validate File

↓

Upload To Cloudinary

↓

Receive URL

↓

Update MongoDB

↓

Return Updated User
```

Again, use:

```js
findByIdAndUpdate()
```

instead of:

```js
findOneAndUpdate(req.user._id)
```

for cleaner and correct code.

---

# Complete File Upload Flow

```text
Frontend

↓

Multipart/Form-Data Request

↓

Multer Middleware

↓

Temporary Storage

↓

Cloudinary Upload

↓

Public Image URL

↓

MongoDB Stores URL

↓

API Response
```

---

# Why Store URLs Instead of Images?

We never store image files inside MongoDB.

Instead:

```text
MongoDB

↓

Stores

↓

https://res.cloudinary.com/...
```

Benefits:

* Smaller database
* Faster backups
* Easier scaling
* CDN delivery
* Better performance
* Easier image transformations

This is the standard architecture used in most production applications.

---

# Best Practices Learned

* Protect every update endpoint using authentication middleware.
* Never trust user IDs sent by the client.
* Always use `req.user` for authenticated operations.
* Verify the old password before allowing a password change.
* Use `save()` when schema middleware (such as password hashing) needs to run.
* Use `findByIdAndUpdate()` for simple profile updates.
* Validate uploaded files before processing them.
* Store image URLs instead of binary image data.
* Never expose sensitive fields like passwords or refresh tokens in API responses.

---

# Common Mistakes

### Updating Password Using findByIdAndUpdate()

Wrong:

```js
User.findByIdAndUpdate(...)
```

Reason:

Password hashing middleware will not execute.

Correct:

```js
user.password = newPassword;

await user.save();
```

---

### Returning Password

Wrong:

```js
return user;
```

Correct:

```js
.select("-password")
```

---

### Trusting Client IDs

Wrong:

```js
req.body.userId
```

Correct:

```js
req.user._id
```

---

### Incorrect findOneAndUpdate()

Wrong:

```js
User.findOneAndUpdate(
    req.user._id,
    ...
)
```

Correct:

```js
User.findOneAndUpdate(
    {
        _id: req.user._id
    },
    ...
)
```

or simply:

```js
User.findByIdAndUpdate(...)
```

---

# Interview Questions

### Why verify the old password before changing it?

To ensure the request is coming from the legitimate account owner and to prevent unauthorized password changes.

---

### Why use save() instead of findByIdAndUpdate() for passwords?

Because `save()` triggers Mongoose pre-save middleware, allowing password hashing to occur automatically.

---

### Why use req.user instead of req.body.userId?

`req.user` is populated after JWT verification and cannot be manipulated by the client, making it more secure.

---

### Why store image URLs instead of images in MongoDB?

Storing URLs keeps the database lightweight, improves scalability, and leverages dedicated storage/CDN services like Cloudinary.

---

### What does { new: true } do?

It tells Mongoose to return the updated document instead of the original one.

---

# Key Takeaways

* User profile management should always require authentication.
* `verifyJWT` provides authenticated user information through `req.user`.
* Password changes require old password verification.
* `save()` is essential when schema middleware must execute.
* Simple profile updates are efficiently handled with `findByIdAndUpdate()`.
* Avatar and cover image uploads follow the Multer → Cloudinary → MongoDB URL workflow.
* Cloudinary stores the actual image; MongoDB stores only its URL.
* Sensitive fields should never be returned in API responses.
* Proper validation and secure update patterns are essential for production-ready user management APIs.
