# Writing Update Controllers for Users (Part 4)

---

# Understanding Aggregation Pipeline Stages

In the previous section, we learned that an aggregation pipeline consists of multiple stages.

Each stage receives the output of the previous stage, performs a specific operation, and passes the processed documents to the next stage.

Think of it like a production line.

```text
Raw Data

↓

Stage 1

↓

Stage 2

↓

Stage 3

↓

Stage 4

↓

Final Response
```

Let's understand every stage used in our APIs.

---

# Stage 1 — `$match`

The first stage used in our `getUserChannelProfile()` API is

```javascript
{
    $match:{
        username: username.toLowerCase()
    }
}
```

---

## Purpose

`$match` filters documents.

It is equivalent to SQL's

```sql
WHERE
```

statement.

Example

```text
Users Collection

Akshat

Harry

Hitesh

Piyush

↓

Match username = harry

↓

Harry
```

Instead of processing every user in the database,

MongoDB immediately filters the required user.

---

## Why Use `$match` First?

Imagine there are

```text
50 Million Users
```

If we perform `$lookup` before filtering,

MongoDB will try to join all users.

That is extremely expensive.

Instead

```text
Filter First

↓

Process Less Data

↓

Better Performance
```

This is one of the biggest optimization techniques while writing aggregation pipelines.

---

# Stage 2 — `$lookup`

Probably the most important aggregation operator.

Think of SQL.

Whenever we want data from another table,

we use

```sql
JOIN
```

MongoDB equivalent

```javascript
$lookup
```

---

## What Does `$lookup` Do?

It joins two collections together.

Example

```text
Users Collection

↓

Lookup

↓

Subscriptions Collection

↓

Combined Result
```

---

In our API

```javascript
{
    $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
    }
}
```

MongoDB finds all subscription documents where

```text
Subscription.channel

=

Current User's _id
```

and stores them inside

```javascript
subscribers
```

---

## Result

Before lookup

```json
{
    "_id":"101",
    "username":"harry"
}
```

After lookup

```json
{
    "_id":"101",
    "username":"harry",

    "subscribers":[
        {...},
        {...},
        {...}
    ]
}
```

Notice

MongoDB always stores lookup results inside an **array**.

Even if there is only one matching document.

---

# Second `$lookup`

The second lookup is

```javascript
{
    $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
    }
}
```

This time MongoDB asks

> Which channels has this user subscribed to?

Result

```text
Current User

↓

Subscription Collection

↓

Subscribed Channels Array
```

Now we have

- Subscribers
- Channels Subscribed To

inside one document.

---

# Stage 3 — `$addFields`

Now both lookups have produced arrays.

But frontend doesn't want arrays.

Frontend wants

```text
Subscribers : 125

Following : 38
```

instead of

```text
Subscribers

[
...
...
...
125 documents
]
```

That's where

```javascript
$addFields
```

comes in.

---

## Purpose

Create new computed fields.

Example

```javascript
{
    subscribersCount:{
        $size:"$subscribers"
    }
}
```

MongoDB calculates

```text
Length Of Subscribers Array
```

---

Example

Before

```text
Subscribers

[
A,
B,
C,
D
]
```

After

```text
subscribersCount

4
```

Exactly the same logic is used for

```javascript
channelsSubscribedToCount
```

---

# `$size`

`$size` returns the number of elements inside an array.

Example

```text
Videos

[
Video1
Video2
Video3
]
```

Aggregation

```javascript
{
    totalVideos:{
        $size:"$videos"
    }
}
```

Output

```text
3
```

Very useful for

- Subscriber Count
- Likes Count
- Comments Count
- Playlist Count
- Watch History Count

---

# `$cond`

Another important operator.

Purpose

Conditional logic.

Exactly like JavaScript

```javascript
condition ? true : false
```

In our API

```javascript
isSubscribed:{
    $cond:{
        if:{...},
        then:true,
        else:false
    }
}
```

MongoDB checks

Is current user subscribed?

If yes

```text
true
```

otherwise

```text
false
```

---

# `$in`

Inside

```javascript
$cond
```

we used

```javascript
$in
```

Purpose

Check whether a value exists inside an array.

Example

```text
Subscribers

[
A,
B,
C
]
```

Question

```text
Does B exist?
```

Result

```text
true
```

Question

```text
Does X exist?
```

Result

```text
false
```

Our API checks whether

```text
Logged In User ID
```

exists inside

```text
Subscribers Array
```

If yes

```text
Subscribed Button
```

Otherwise

```text
Subscribe Button
```

This is exactly how YouTube decides which button to display.

---

# Stage 4 — `$project`

By now aggregation contains many unnecessary fields.

Example

```text
Subscribers Array

Subscribed Array

Internal Fields

ObjectIds

Temporary Data
```

Frontend doesn't need all this.

Therefore we use

```javascript
$project
```

Purpose

Return only required fields.

Example

```javascript
{
    fullName:1,
    username:1,
    avatar:1,
    coverImage:1,
    subscribersCount:1,
    isSubscribed:1
}
```

Result

```text
Clean Response

↓

Small Payload

↓

Fast Network Transfer
```

---

# Complete Channel Profile Pipeline

Putting everything together

```text
Users Collection

↓

Match Username

↓

Lookup Subscribers

↓

Lookup Following

↓

Calculate Subscriber Count

↓

Calculate Following Count

↓

Check Subscription Status

↓

Project Required Fields

↓

Return Response
```

This entire workflow happens inside MongoDB in a single database operation.

---

# Understanding `getWatchHistory()`

The second API introduced in this lesson is

```http
GET /history
```

Unlike the previous API,

this one demonstrates **Nested Aggregation Pipelines**.

This is an advanced MongoDB feature.

---

## Overall Flow

```text
Logged In User

↓

Find User

↓

Lookup Videos

↓

Each Video

↓

Lookup Owner

↓

Project Owner

↓

Convert Owner Array

↓

Return Watch History
```

---

# Step 1 — `$match`

First,

MongoDB finds the currently logged-in user.

```javascript
{
    $match:{
        _id:ObjectId(req.user._id)
    }
}
```

Only one user moves to the next stage.

---

# Step 2 — Lookup Videos

The user document contains

```text
watchHistory

[
VideoId1,
VideoId2,
VideoId3
]
```

Using

```javascript
$lookup
```

MongoDB replaces these IDs with complete video documents.

Before

```text
watchHistory

[
ObjectId
ObjectId
]
```

After

```text
watchHistory

[
Video Object
Video Object
]
```

---

# Nested `$lookup`

Every video contains

```text
owner
```

which is again

```text
ObjectId
```

We don't want just the ID.

We want

- Owner Name
- Username
- Avatar

Therefore another lookup is written **inside the first lookup's pipeline**.

Diagram

```text
User

↓

Videos

↓

Each Video

↓

Users Collection

↓

Owner Details
```

This is called

## Nested Aggregation Pipeline

One aggregation pipeline running inside another.

---

# Why Use Nested Lookup?

Without nested lookup

Frontend receives

```json
{
    "owner":"64ab..."
}
```

Frontend cannot display

- Channel Name
- Avatar

With nested lookup

```json
{
    "owner":{
        "username":"akshat",
        "avatar":"..."
    }
}
```

Everything needed is already available.

---

# `$first`

One important thing to remember.

`$lookup`

always returns an array.

Example

```json
owner:[
    {
        "username":"akshat"
    }
]
```

But every video has only one owner.

Instead of

```text
owner[0]
```

we convert

```javascript
$first:"$owner"
```

Result

```json
owner:{
    "username":"akshat"
}
```

Much cleaner response.

---

# Why Aggregation Is Preferred Here

Imagine implementing watch history without aggregation.

```text
Find User

↓

Loop Through Videos

↓

Find Owner

↓

Loop Again

↓

Attach Owner

↓

Return Response
```

Multiple database calls.

Extra JavaScript processing.

More response time.

With aggregation

```text
Single Pipeline

↓

MongoDB Handles Everything

↓

Optimized Response
```

---

# Aggregation Operators Learned

| Operator | Purpose |
|-----------|----------|
| `$match` | Filters documents |
| `$lookup` | Joins another collection |
| `$addFields` | Creates computed fields |
| `$size` | Counts array elements |
| `$cond` | Conditional logic |
| `$in` | Checks if value exists inside array |
| `$project` | Returns selected fields |
| `$first` | Converts lookup array into a single object |

---

# Best Practices

- Always place `$match` as early as possible.
- Return only required fields using `$project`.
- Avoid unnecessary lookups.
- Keep pipelines readable by separating logical stages.
- Prefer aggregation instead of multiple database queries whenever complex relationships are involved.
- Use nested pipelines only when required, as they are more computationally expensive than simple lookups.

---

# Common Mistakes

### Performing Multiple Queries Instead of Aggregation

Many beginners write

```text
Find User

↓

Find Subscribers

↓

Find Videos

↓

Find Owners

↓

Merge Everything
```

Instead,

let MongoDB do the heavy lifting.

---

### Forgetting `$lookup` Returns Arrays

Even if only one document matches,

`$lookup`

returns

```javascript
[]
```

Always remember to use

```javascript
$first
```

when appropriate.

---

### Returning Unnecessary Fields

Never return entire MongoDB documents if the frontend only needs five fields.

Use

```javascript
$project
```

to keep responses lightweight.

---

### Incorrect Stage Ordering

Wrong

```text
Lookup

↓

Match
```

Correct

```text
Match

↓

Lookup
```

Filter first.

Join later.

---

# Interview Questions

### What is the MongoDB Aggregation Framework?

### What is an Aggregation Pipeline?

### Explain the purpose of `$match`.

### How is `$lookup` similar to SQL JOIN?

### Why does `$lookup` always return an array?

### What is the purpose of `$addFields`?

### Difference between `$project` and `$addFields`?

### Explain `$size` with an example.

### Explain `$cond` with an example.

### What does `$first` do?

### What are Nested Aggregation Pipelines?

### Why is Aggregation preferred over multiple database queries?

### Explain the aggregation pipeline used in `getUserChannelProfile()`.

### Explain the aggregation pipeline used in `getWatchHistory()`.

---

# Key Takeaways

- Aggregation Framework is MongoDB's most powerful data processing feature.
- Aggregation Pipelines execute multiple processing stages inside the database.
- `$match` filters documents before expensive operations.
- `$lookup` joins related collections similar to SQL JOIN.
- `$addFields` creates calculated fields without modifying stored documents.
- `$project` controls the final response sent to the client.
- `$cond` and `$in` help build dynamic responses such as determining whether the current user is subscribed.
- Nested `$lookup` allows related data to be fetched recursively, making APIs more expressive.
- Using aggregation significantly reduces the number of database calls and improves application performance.
- The `getUserChannelProfile()` and `getWatchHistory()` APIs are excellent real-world examples of why aggregation is one of the most important MongoDB concepts for backend developers.