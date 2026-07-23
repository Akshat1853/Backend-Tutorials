# Learnings.md

# Writing Update Controllers for Users (Part 2)

# Subscription Model & Database Design

---

# Overview

In this lesson, a new model called **Subscription** was introduced.

Although it is a very small schema, it plays a huge role in applications like:

* YouTube
* Instagram
* Twitter (X)
* LinkedIn
* Medium

Almost every social media platform needs a way to represent relationships between users.

Examples:

```text
Akshat follows Harry

Harry follows Hitesh

John subscribes to Akshat

Alice follows Bob
```

Instead of storing all of these relationships inside the User document, we create a separate collection called **Subscription**.

---

# The Subscription Model

```js
import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
{
    subscriber:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },

    channel:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }

},
{
    timestamps:true
})

export const Subscription = mongoose.model(
    "Subscription",
    subscriptionSchema
)
```

This schema stores only two ObjectIds.

```text
Subscriber
Channel
```

That is enough to represent millions of subscriptions.

---

# Understanding the Two Fields

## Subscriber

```js
subscriber:{
    type:Schema.Types.ObjectId,
    ref:"User"
}
```

Subscriber means:

> The user who clicked the Subscribe button.

Example:

```text
Akshat subscribes to CodeWithHarry
```

Subscriber:

```text
Akshat
```

---

## Channel

```js
channel:{
    type:Schema.Types.ObjectId,
    ref:"User"
}
```

Channel means:

The user receiving the subscription.

Example:

```text
Akshat subscribes to CodeWithHarry
```

Channel:

```text
CodeWithHarry
```

---

# Example Database Entry

Suppose:

```text
Akshat ObjectId

64ab123
```

and

```text
CodeWithHarry ObjectId

71ef456
```

The Subscription document becomes:

```json
{
    "_id":"9001",

    "subscriber":"64ab123",

    "channel":"71ef456"
}
```

That's all.

No arrays.

No nested objects.

Just references.

---

# Visual Representation

```text
Akshat
   │
   │ subscribes to
   ▼
CodeWithHarry
```

Database:

```text
Subscriber ID
        │
        ▼
Subscription Collection
        │
        ▼
Channel ID
```

---

# Another Example

Suppose:

```text
A subscribes to B

A subscribes to C

A subscribes to D
```

Database:

```text
subscriber    channel

A             B

A             C

A             D
```

Each subscription is stored as a separate document.

---

# Reverse Example

Suppose:

```text
A subscribes to X

B subscribes to X

C subscribes to X
```

Database:

```text
subscriber      channel

A               X

B               X

C               X
```

Now we can easily count:

```text
Subscribers of X
```

---

# Why Not Store Subscribers Inside User?

Many beginners design their User schema like this:

```js
subscribers:[
    ObjectId,
    ObjectId,
    ObjectId
]
```

Looks simple.

But imagine:

```text
MrBeast
```

with

```text
350 Million Subscribers
```

Would you really want:

```text
350 Million ObjectIds
```

inside one MongoDB document?

Absolutely not.

---

# Problems With Large Arrays

Huge arrays create many issues.

## Large Documents

MongoDB documents have size limits.

Very large arrays eventually become problematic.

---

## Slow Updates

Whenever someone subscribes:

```text
Update User Document
```

Again.

And again.

And again.

Millions of updates.

---

## High Memory Usage

Large arrays consume more memory.

More RAM.

More disk.

More network bandwidth.

---

## Poor Scalability

As the platform grows:

```text
Subscribers

↓

Millions

↓

Performance Problems
```

---

# Better Solution

Instead:

```text
One Subscription

↓

One Document
```

Database grows naturally.

Example:

```text
Subscription

↓

1 Document

↓

Another Subscription

↓

Another Document

↓

Another Document
```

This scales extremely well.

---

# Relationship Type

This is called a

## Many-to-Many Relationship

Because:

One user can subscribe to many channels.

AND

One channel can have many subscribers.

Example:

```text
Akshat

↓

Harry

↓

Hitesh

↓

Codevolution
```

Akshat can subscribe to all of them.

Similarly:

```text
Harry

↓

Millions of Subscribers
```

Both sides have multiple relationships.

---

# Self Referencing Schema

Notice:

```js
ref:"User"
```

exists twice.

```js
subscriber

↓

User
```

and

```js
channel

↓

User
```

Both fields reference the same collection.

This is called a

## Self Referencing Relationship

because one User document references another User document.

Diagram:

```text
User

▲          ▲

│          │

subscriber channel

│          │

Subscription
```

---

# Why Use ObjectId?

Instead of storing:

```text
Username

Email

Name
```

we store:

```js
ObjectId
```

Reasons:

* Smaller storage
* Faster indexing
* Easier joins using populate()
* User details can change without affecting subscriptions

Suppose:

```text
Harry
```

changes username.

Subscription documents remain valid because ObjectId never changes.

---

# What Does ref:"User" Mean?

```js
ref:"User"
```

tells Mongoose:

This ObjectId belongs to the User collection.

Later we can use:

```js
.populate()
```

to replace ObjectIds with complete user information.

Example:

Without populate:

```json
{
    "subscriber":"64ab..."
}
```

After populate:

```json
{
    "subscriber":{
        "_id":"64ab...",
        "username":"akshat",
        "avatar":"..."
    }
}
```

This is one of the most useful Mongoose features.

---

# timestamps:true

```js
timestamps:true
```

automatically creates:

```text
createdAt

updatedAt
```

Useful because now we know:

```text
When User Subscribed
```

Example:

```text
Subscribed

↓

20 July 2026
```

This can be used for:

* Analytics
* Activity feeds
* Notifications
* Sorting

---

# Real World Flow

Imagine:

```text
Akshat clicks Subscribe
```

Backend receives:

```http
POST /subscribe
```

Controller:

```text
Receive User IDs

↓

Create Subscription

↓

Save In MongoDB

↓

Return Success
```

Database:

```text
subscriber

↓

Akshat ID

channel

↓

Harry ID
```

Subscription complete.

---

# How Unsubscribe Works

When user clicks:

```text
Unsubscribe
```

Backend simply deletes:

```text
Subscriber ID

+

Channel ID
```

matching document.

No arrays need updating.

Very efficient.

---

# Future Features Enabled

With this schema, many features become easy.

---

## Count Subscribers

```text
How many users subscribed to Harry?
```

Simply count:

```text
channel = Harry
```

---

## Count Channels

```text
How many channels did Akshat subscribe to?
```

Count:

```text
subscriber = Akshat
```

---

## Subscription List

Show:

```text
Channels I'm subscribed to
```

Query:

```text
subscriber = Current User
```

---

## Subscriber List

Show:

```text
People subscribed to me
```

Query:

```text
channel = Current User
```

---

## Mutual Connections

Possible using aggregation.

Example:

```text
Users following each other
```

---

# Why Separate Collection Is Better

Comparison:

## Store Inside User

```text
User

↓

Huge Arrays

↓

Large Documents

↓

Slow Updates

↓

Poor Scaling
```

---

## Separate Collection

```text
One Subscription

↓

One Document

↓

Easy Queries

↓

Easy Updates

↓

Infinite Scaling
```

This is why almost every social platform follows this approach.

---

# Best Practices Learned

* Model relationships using separate collections when data can grow significantly.
* Use `ObjectId` references instead of duplicating user information.
* Keep documents small and focused.
* Use `ref` to enable Mongoose population.
* Use `timestamps` to track when relationships are created.
* Design schemas with future scalability in mind.

---

# Common Mistakes

### Storing Subscriber Arrays Inside User

Wrong:

```js
subscribers:[
    ObjectId,
    ObjectId,
    ObjectId
]
```

Better:

```text
Subscription Collection
```

---

### Storing Username Instead of ObjectId

Wrong:

```text
subscriber:"akshat"
```

Correct:

```js
subscriber:ObjectId
```

Usernames and emails can change, but ObjectIds remain constant.

---

### Duplicating User Data

Avoid storing:

```text
Username

Avatar

Email
```

inside the Subscription document.

Store only ObjectIds and fetch details using `populate()` when needed.

---

# Interview Questions

### Why create a separate Subscription collection?

To efficiently model many-to-many relationships, improve scalability, and avoid storing massive arrays inside user documents.

---

### What is a self-referencing schema?

A schema where multiple fields reference the same collection. In this case, both `subscriber` and `channel` reference the `User` model.

---

### Why use ObjectId instead of username?

ObjectIds are immutable, smaller, indexed, and allow efficient lookups and population.

---

### What is the purpose of `ref` in Mongoose?

`ref` tells Mongoose which collection an ObjectId belongs to, enabling the use of `.populate()`.

---

### What does `timestamps: true` provide?

It automatically adds `createdAt` and `updatedAt` fields to each document.

---

# Key Takeaways

* A Subscription represents a relationship between two users.
* `subscriber` is the user who subscribes.
* `channel` is the user being subscribed to.
* Both fields reference the `User` model, creating a self-referencing relationship.
* This design models a many-to-many relationship efficiently.
* A separate Subscription collection scales far better than storing subscriber arrays in user documents.
* Using `ObjectId` references keeps the schema lightweight and consistent.
* `populate()` can later be used to fetch complete user information from these references.
* This schema forms the foundation for features like subscriptions, followers, following lists, subscriber counts, and recommendations in large-scale social media applications.
