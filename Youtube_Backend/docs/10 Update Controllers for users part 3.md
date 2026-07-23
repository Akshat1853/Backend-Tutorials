# Writing Update Controllers for Users (Part 3)

---

# Overview

In the previous lessons, we built the authentication system of our backend.

Users could:

- Register
- Login
- Logout
- Refresh Access Token

In this lesson, we moved beyond authentication and started building **User Management APIs**. These APIs allow authenticated users to manage their profile, update their account details, upload profile images, and retrieve personalized information.

However, the biggest concept introduced in this lesson is the **MongoDB Aggregation Framework**.

Unlike previous lessons where most database operations used `find()`, `create()`, or `findById()`, this lesson demonstrates how MongoDB can process, transform, join, and reshape data directly inside the database using **Aggregation Pipelines**.

This is one of the most important MongoDB topics for real-world applications and technical interviews.

---

# Updated User Routes

The following routes were added to `user.routes.js`:

| Method | Route | Description | Protected |
|----------|----------------------|------------------------------------|------------|
| POST | `/change-password` | Change current password | ✅ |
| GET | `/current-user` | Get logged-in user's data | ✅ |
| PATCH | `/update-account` | Update full name and email | ✅ |
| PATCH | `/avatar` | Update avatar image | ✅ |
| PATCH | `/cover-image` | Update cover image | ✅ |
| GET | `/c/:username` | Fetch public channel profile | ✅ |
| GET | `/history` | Fetch watch history | ✅ |

Notice that every route (except authentication routes) uses:

```javascript
verifyJWT
```

because all these APIs require an authenticated user.

---

# Why Protected Routes?

Imagine anyone could call

```http
POST /change-password
```

without authentication.

That would mean anyone on the internet could change someone else's password.

Instead the request follows this flow:

```text
Client

     │

JWT Token

     │

verifyJWT Middleware

     │

Token Valid?

 ┌──────────────┐
 │              │
No             Yes
 │              │
401 Error   req.user Created
                 │
                 │
         Controller Executes
```

The middleware authenticates the request once and attaches the logged-in user to

```javascript
req.user
```

Every controller can then directly access the current user without querying the database again.

---

# upload.fields() vs upload.single()

During registration we uploaded two images simultaneously.

```javascript
upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
])
```

This is suitable when multiple files are expected.

Later, when the user only wants to update one image, there is no need to accept multiple files.

Instead we use

```javascript
upload.single("avatar")
```

or

```javascript
upload.single("coverImage")
```

This makes the middleware simpler and avoids unnecessary processing.

---

# Account Management APIs

---

# 1. Change Current Password

Route

```http
POST /change-password
```

Protected Route

```javascript
verifyJWT
```

---

## Workflow

```text
Receive Request

↓

Extract

oldPassword
newPassword

↓

Find Logged-in User

↓

Verify Old Password

↓

Password Correct?

↓

YES

↓

Replace Password

↓

Save User

↓

Return Success
```

---

## Why Verify the Old Password?

Suppose someone gains temporary access to your device.

If the API only accepted

```text
newPassword
```

the attacker could immediately lock you out of your account.

Therefore the backend first verifies

```javascript
user.isPasswordCorrect(oldPassword)
```

Only after successful verification does it update

```javascript
user.password = newPassword
```

---

## Why Isn't bcrypt Used Here?

Notice that the controller never hashes the password manually.

That's because the User model already contains a

```javascript
pre("save")
```

hook.

Whenever

```javascript
user.save()
```

is executed,

the hook automatically hashes the password before storing it in MongoDB.

This keeps controller logic clean and avoids repeating hashing logic everywhere.

---

# 2. Get Current User

Route

```http
GET /current-user
```

This API is extremely simple.

Instead of querying MongoDB again,

the middleware has already stored the authenticated user inside

```javascript
req.user
```

Therefore the controller simply returns

```javascript
req.user
```

without making another database call.

---

## Why Is This Better?

Without middleware

```text
Receive Request

↓

Extract Token

↓

Verify Token

↓

Find User

↓

Return User
```

Every controller would repeat this logic.

With middleware

```text
Receive Request

↓

verifyJWT

↓

req.user Available

↓

Return req.user
```

Cleaner code.

Less duplication.

Better performance.

---

# 3. Update Account Details

Route

```http
PATCH /update-account
```

Purpose

Update

- Full Name
- Email

---

## Workflow

```text
Receive Request

↓

Validate Fields

↓

Find Logged-in User

↓

Update Document

↓

Return Updated User
```

Uses

```javascript
findByIdAndUpdate()
```

along with

```javascript
{
    new:true
}
```

Without

```javascript
new:true
```

MongoDB returns the old document.

With

```javascript
new:true
```

MongoDB returns the updated document.

---

# Updating User Images

Two APIs were added

```http
PATCH /avatar

PATCH /cover-image
```

Both follow the same flow.

```text
Client Uploads Image

↓

Multer

↓

Temporary Storage

↓

Cloudinary Upload

↓

Receive Public URL

↓

Update MongoDB

↓

Delete Local File

↓

Return Updated User
```

---

# Why Store Only Image URLs?

Instead of storing the entire image inside MongoDB,

the backend stores

```text
https://res.cloudinary.com/...
```

This approach has several advantages.

### Smaller Database

Only a string is stored.

### Faster Queries

The database returns a URL instead of huge binary data.

### Easier Backups

Backups become much smaller.

### Better Scalability

Millions of images can be handled without bloating the database.

This architecture is used by almost every production application.

---

# Introduction to MongoDB Aggregation Framework ⭐⭐⭐⭐⭐

This is the biggest concept introduced in this lesson.

Everything before this lesson relied on operations like

```javascript
find()

findOne()

findById()

create()

findByIdAndUpdate()
```

These operations work perfectly when we simply want to retrieve or modify documents.

But what if we want something more complex?

For example:

- Return a user's subscriber count.
- Return how many channels the user follows.
- Determine whether the currently logged-in user is subscribed.
- Join information from multiple collections.
- Return only selected fields.
- Perform calculations before sending the response.

Performing all of this manually inside Node.js would require multiple database queries.

Instead,

MongoDB provides the **Aggregation Framework**.

---

# What is Aggregation?

Aggregation is MongoDB's data processing framework.

Instead of simply retrieving documents,

it processes them through multiple stages.

Think of it as an assembly line inside a factory.

```text
Raw Documents

↓

Stage 1

↓

Stage 2

↓

Stage 3

↓

Stage 4

↓

Processed Result
```

Each stage receives the output of the previous stage.

---

# Why is it Called a Pipeline?

Because data flows through multiple processing stages.

Exactly like water flowing through a pipe.

```text
Input

↓

Filter

↓

Join

↓

Calculate

↓

Remove Extra Fields

↓

Output
```

Each stage performs one specific task.

---

# Why Not Process Everything in Node.js?

Without Aggregation

```text
Find User

↓

Find Subscribers

↓

Count Subscribers

↓

Find Following

↓

Count Following

↓

Determine Subscription Status

↓

Create Response

↓

Send Response
```

Multiple database queries.

Extra JavaScript processing.

Higher response time.

---

Using Aggregation

```text
Single Aggregation Pipeline

↓

MongoDB Performs Everything

↓

Processed Result

↓

Send Response
```

Only one optimized database operation.

---

# Aggregation vs Normal Queries

| Normal Query | Aggregation |
|--------------|-------------|
| Fetch documents | Process documents |
| Limited transformations | Powerful transformations |
| Usually returns raw data | Returns processed data |
| Simple CRUD operations | Analytics, joins, calculations |
| Often requires multiple queries | Frequently completed in a single pipeline |

---

# Real World Example

Imagine opening someone's YouTube channel.

The page displays

```text
Username

Subscriber Count

Channels Following

Profile Picture

Subscribed Button
```

This information comes from multiple collections.

Without Aggregation

Backend would perform many separate queries.

With Aggregation

MongoDB prepares the entire response before sending it back.

---

# Aggregation Pipeline Stages

Every aggregation consists of multiple stages.

In this lesson we learned:

- `$match`
- `$lookup`
- `$addFields`
- `$size`
- `$cond`
- `$in`
- `$project`

Each of these stages performs a specific task.

In the next section we will study every stage individually and understand how the `getUserChannelProfile()` API is built using these operators.

---