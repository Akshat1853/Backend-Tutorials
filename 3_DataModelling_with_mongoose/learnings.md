# learnings.md

# Data Modeling with MongoDB and Mongoose

## Introduction

When building backend applications, one of the most important tasks is deciding how data should be stored in the database. This process is known as **Data Modeling**.

A well-designed data model helps create applications that are:

* Easy to maintain
* Scalable
* Efficient
* Consistent
* Less prone to bugs and invalid data

Before creating collections and documents, we should determine:

* What information needs to be stored?
* What fields should each document contain?
* Which fields are required?
* What data type should each field have?
* How different pieces of data relate to each other?

---

# What is Data Modeling?

Data modeling is the process of designing the structure of data before storing it in a database.

For example, in an e-commerce application we may have:

## User

```js
{
  name: "Akshat",
  email: "akshat@gmail.com",
  password: "hashedPassword"
}
```

## Product

```js
{
  title: "iPhone",
  price: 99999,
  image: "image-url"
}
```

## Order

```js
{
  user: "userId",
  products: ["productId1", "productId2"],
  totalAmount: 199998
}
```

Designing these structures before implementation is called **Data Modeling**.

---

# What is Mongoose?

Mongoose is an **ODM (Object Data Modeling) Library** for MongoDB and Node.js.

It acts as a layer between your Node.js application and MongoDB.

Instead of directly working with MongoDB collections and documents, Mongoose allows us to define:

* Schemas
* Models
* Validation Rules
* Relationships
* Middleware

and provides a cleaner, more structured way to interact with the database.

---

# Why Do We Need Mongoose?

MongoDB is a **schema-less database**.

This means documents inside the same collection can have completely different structures.

Example:

```js
{
  name: "Akshat"
}
```

and

```js
{
  name: "Akshat",
  age: 21,
  city: "Delhi"
}
```

can both exist in the same collection.

While this flexibility is useful, it can lead to inconsistent data.

Mongoose solves this problem by enforcing a structure.

Example:

```js
const userSchema = new mongoose.Schema({
  name: String,
  age: Number
});
```

Now documents are expected to follow a defined format.

---

# Advantages of Mongoose

## 1. Schema Enforcement

Schemas provide a clear structure for documents.

```js
const userSchema = new mongoose.Schema({
  name: String,
  age: Number
});
```

---

## 2. Validation

Mongoose can validate data before it is saved.

```js
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  }
});
```

Common validation rules:

* required
* min
* max
* minlength
* maxlength
* enum
* match
* unique

---

## 3. Relationships

Mongoose allows documents to reference other documents.

```js
const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});
```

---

## 4. Middleware

Middleware allows code execution before or after database operations.

Example:

```js
userSchema.pre("save", function(next) {
  console.log("Saving User");
  next();
});
```

Common use cases:

* Password hashing
* Logging
* Auditing
* Data transformations

---

## 5. Cleaner Query API

```js
const users = await User.find();
```

Provides a more developer-friendly interface than the native MongoDB driver.

---

# Schema vs Model

## Schema

A Schema is a blueprint that defines:

* Fields
* Data Types
* Validation Rules
* Default Values

Example:

```js
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number
});
```

---

## Model

A Model is created from a schema and is used to interact with the database.

```js
const User = mongoose.model("User", userSchema);
```

Example:

```js
await User.create({
  name: "Akshat",
  age: 21
});
```

### Easy Way to Remember

* Schema = Blueprint
* Model = Tool used to work with MongoDB

---

# Data Modeling Process

## Step 1: Understand Requirements

Example:

An e-commerce application may need:

* Users
* Products
* Orders

---

## Step 2: Identify Entities

Entities usually become collections.

```text
Users
Products
Orders
```

---

## Step 3: Define Fields

### User

```js
{
  name,
  email,
  password
}
```

### Product

```js
{
  title,
  price,
  stock
}
```

### Order

```js
{
  user,
  products,
  totalAmount
}
```

---

## Step 4: Create Schemas

```js
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  stock: Number
});
```

---

## Step 5: Create Models

```js
const Product = mongoose.model(
  "Product",
  productSchema
);
```

---

# Embedding vs Referencing

One of the most important MongoDB design decisions.

## Embedding

Store related data inside the same document.

```js
{
  name: "Akshat",
  addresses: [
    {
      city: "Delhi",
      pincode: "110001"
    }
  ]
}
```

### Advantages

* Faster reads
* Fewer database queries

### Disadvantages

* Larger documents
* Data duplication

---

## Referencing

Store relationships using ObjectIds.

```js
{
  title: "Learning Mongoose",
  author: ObjectId("...")
}
```

### Advantages

* Less duplication
* Better normalization

### Disadvantages

* Requires additional queries

---

# Common Mongoose Data Types

```js
String
Number
Boolean
Date
Array
Object
ObjectId
Buffer
Mixed
Map
Decimal128
```

Example:

```js
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  isAdmin: Boolean,
  createdAt: Date
});
```

---

# Alternatives to Mongoose

Although Mongoose is the most popular ODM for MongoDB, other options exist.

## 1. MongoDB Native Driver

Official MongoDB driver.

```js
const { MongoClient } = require("mongodb");
```

### Advantages

* Faster
* Direct MongoDB access
* Full control

### Disadvantages

* No schema enforcement
* Manual validation
* More boilerplate code

---

## 2. Prisma

Modern ORM/ODM with excellent TypeScript support.

### Advantages

* Auto-generated types
* Great developer experience
* Supports multiple databases

### Disadvantages

* Additional abstraction layer

---

## 3. Typegoose

Built on top of Mongoose.

### Advantages

* Class-based syntax
* Better TypeScript integration

Example:

```ts
class User {
  name!: string;
  age!: number;
}
```

---

## 4. MikroORM

TypeScript-first ORM supporting SQL and NoSQL databases.

### Best For

Large-scale applications requiring advanced ORM features.

---

# Storing Images in MongoDB

## Can MongoDB Store Images?

Yes.

MongoDB supports storing binary data through the **Buffer** data type.

Example:

```js
const userSchema = new mongoose.Schema({
  profilePic: Buffer
});
```

A Buffer stores raw binary data directly inside the database.

---

# Why Images Are Usually Not Stored in MongoDB

Although possible, storing images directly in MongoDB is generally avoided in production applications.

## 1. Database Size Increases Rapidly

Images are significantly larger than normal document data.

```text
User Data -> Few KB
Image -> Several MB
```

A large number of images can dramatically increase database size.

---

## 2. Slower Database Performance

Databases are optimized for:

* Reading records
* Writing records
* Querying data

They are not optimized for repeatedly serving large media files.

---

## 3. Expensive Scaling

Large media files lead to:

* Larger backups
* Slower replication
* Higher infrastructure costs

---

# Recommended Approach for Image Storage

Instead of storing actual images inside MongoDB:

1. Upload image to a storage service.
2. Receive a public URL.
3. Store only the URL inside MongoDB.

```text
Image
   ↓
Storage Service
   ↓
Public URL
   ↓
MongoDB
```

---

# Option 1: Local Server Storage

Store uploaded files inside a public folder.

```text
public/
  uploads/
    image1.jpg
    image2.jpg
```

Database:

```js
{
  image: "/uploads/image1.jpg"
}
```

### Advantages

* Simple
* No third-party dependency

### Disadvantages

* Difficult to scale
* Not ideal for cloud deployments

---

# Option 2: AWS S3

A very common industry solution.

Flow:

```text
Frontend
   ↓
Backend
   ↓
AWS S3 Bucket
   ↓
Public URL Returned
   ↓
Store URL in MongoDB
```

Example:

```js
{
  image:
  "https://mybucket.s3.amazonaws.com/product1.jpg"
}
```

### Benefits

* Scalable
* Reliable
* High performance
* Industry standard

---

# Option 3: Cloudinary

Cloudinary is a media storage and optimization platform.

Flow:

```text
Upload
   ↓
Cloudinary
   ↓
Public URL
   ↓
MongoDB
```

Example Response:

```js
{
  secure_url:
  "https://res.cloudinary.com/demo/image/upload/sample.jpg"
}
```

Stored in MongoDB:

```js
{
  image:
  "https://res.cloudinary.com/demo/image/upload/sample.jpg"
}
```

### Benefits

* Easy integration
* Free tier
* Image optimization
* Video support
* Automatic transformations

---

# Why Image Fields Are Usually Strings

Since applications usually store image URLs instead of image data, image fields are commonly defined as strings.

Example:

```js
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String
});
```

Multiple images:

```js
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  images: [String]
});
```

The string stores the URL that points to the actual image.

---

# Real-World Example

Database Record:

```js
{
  title: "iPhone 16",
  price: 99999,
  image:
  "https://res.cloudinary.com/demo/image/upload/iphone16.jpg"
}
```

Frontend Request:

```text
GET /products
```

Backend Response:

```js
{
  title: "iPhone 16",
  price: 99999,
  image:
  "https://res.cloudinary.com/demo/image/upload/iphone16.jpg"
}
```

Frontend simply renders:

```html
<img src="image-url" />
```

No image data is fetched from MongoDB itself.

---

# Interview Questions

## Why Use Mongoose If MongoDB Is Already Schema-less?

MongoDB provides flexibility, but large applications require consistency.

Mongoose provides:

* Schema Enforcement
* Validation
* Relationships
* Middleware
* Better Code Organization
* Improved Maintainability

---

## Why Are Image Fields Usually Strings?

Because production applications generally store images in dedicated storage services such as AWS S3 or Cloudinary and save only the public URL inside MongoDB.

Since URLs are text values, image fields are usually defined as:

```js
image: String
```

or

```js
images: [String]
```

instead of using Buffer.

---

# Quick Revision

* Data Modeling is the process of designing database structures before implementation.
* Mongoose is an ODM for MongoDB and Node.js.
* Schema defines document structure.
* Model interacts with MongoDB collections.
* Mongoose provides validation, middleware, relationships, and schema enforcement.
* Embedding stores related data inside the same document.
* Referencing stores relationships using ObjectIds.
* MongoDB can store files using Buffer.
* Images are usually not stored directly in MongoDB.
* Preferred approach:

  * Upload image to storage service.
  * Receive URL.
  * Store URL in MongoDB.
* Common image storage solutions:

  * Local Server
  * AWS S3
  * Cloudinary
* Image fields are typically stored as String URLs rather than Buffers.
