# File Upload in Backend using Multer and Cloudinary

## Overview

In modern web applications, users frequently need to upload files such as:

* Profile pictures
* Product images
* Videos
* PDF documents
* Resumes
* Attachments
* Certificates

Handling file uploads efficiently is an important backend responsibility.

In this lesson, we implemented a file upload mechanism using:

* **Multer** (for handling incoming files)
* **Cloudinary** (for cloud storage)
* **Node.js File System (fs)** module (for cleanup operations)

The architecture follows a common industry-standard workflow:

```text
Client
   ↓
Multipart/Form-Data Request
   ↓
Multer Middleware
   ↓
Temporary Local Storage
   ↓
Cloudinary Upload
   ↓
Public URL Generated
   ↓
Store URL in Database
   ↓
Send Response to Client
```

---

# Why Do We Need File Uploads?

Many applications require users to upload files.

Examples:

### Social Media

* Profile Pictures
* Cover Photos
* Posts

### E-Commerce

* Product Images
* Product Videos

### Job Portals

* Resume Upload
* Certificates

### Educational Platforms

* Assignments
* Notes
* Project Files

Without a proper file upload mechanism, these features cannot be implemented.

---

# Where Can Files Be Stored?

There are three common approaches.

## 1. Store Files in Database

Files can be stored as:

* Binary Data
* Buffer
* BLOB (Binary Large Object)

Example:

```js
avatar: Buffer
```

### Problems

* Database size grows rapidly
* Backup becomes difficult
* Slower queries
* Higher storage costs
* Difficult scaling

Because of these reasons, storing images directly inside MongoDB is usually avoided.

---

## 2. Store Files on Server

Example:

```text
public/uploads/
```

Advantages:

* Easy implementation

Disadvantages:

* Server storage fills up
* Difficult scaling
* Data can be lost if server crashes

---

## 3. Store Files on Cloud Storage (Recommended)

Examples:

* Cloudinary
* AWS S3
* Firebase Storage
* Azure Blob Storage

Advantages:

* Scalable
* Secure
* CDN support
* Optimized delivery
* Better performance

This is the approach used in this lesson.

---

# Understanding the Complete Upload Flow

When a user uploads a file:

```text
User selects image
        ↓
Browser sends request
        ↓
Multer receives file
        ↓
File stored temporarily
        ↓
Cloudinary uploads file
        ↓
Cloudinary returns URL
        ↓
URL stored in database
        ↓
Temporary file deleted
```

The database stores only the URL, not the actual image.

---

# Why JSON Cannot Send Files

Normally APIs exchange data using JSON.

Example:

```json
{
  "username": "akshat"
}
```

JSON is designed for text data.

Files are binary data and cannot be efficiently transferred through normal JSON requests.

Therefore browsers use:

```text
multipart/form-data
```

for file uploads.

---

# Multipart/Form-Data

This encoding type allows sending:

* Text fields
* Images
* Videos
* PDFs
* Multiple files

within the same request.

Example:

```text
username = Akshat
avatar = profile.png
```

Multer is responsible for parsing this multipart request.

---

# Multer

## What is Multer?

Multer is an Express middleware used for handling:

```text
multipart/form-data
```

It processes incoming files and makes them accessible inside the request object.

---

## Why Multer is Needed

Express can easily handle:

```json
{
  "name": "Akshat"
}
```

But it cannot process:

```text
Image Files
PDFs
Videos
```

by itself.

Multer fills this gap.

---

# Multer Middleware File

## File: multer.middleware.js

```js
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
```

---

# Understanding diskStorage()

```js
multer.diskStorage()
```

This tells Multer:

```text
Store uploaded files on disk.
```

instead of keeping them in memory.

---

# destination()

```js
destination: function (req, file, cb)
```

Purpose:

Determines where uploaded files will be stored.

```js
cb(null, "./public/temp");
```

Result:

```text
public/
 └── temp/
```

All uploaded files are temporarily stored inside this folder.

---

# Why Temporary Storage?

Cloudinary uploads require a file path.

Therefore:

```text
Upload arrives
     ↓
Save locally
     ↓
Send to Cloudinary
     ↓
Delete local copy
```

This folder acts as a temporary holding area.

---

# filename()

```js
filename: function (req, file, cb)
```

Purpose:

Determines the filename of uploaded files.

Current implementation:

```js
cb(null, file.originalname);
```

Example:

If user uploads:

```text
myphoto.png
```

File will be stored as:

```text
myphoto.png
```

---

# Potential Issue with Original Filenames

Suppose two users upload:

```text
avatar.png
```

The second upload can overwrite the first.

In production applications, developers often generate unique filenames.

Example:

```js
Date.now() + "-" + file.originalname
```

or

```js
UUID
```

---

# Creating Multer Instance

```js
export const upload = multer({
  storage: storage,
});
```

This creates the configured middleware instance.

Later it can be used in routes.

Example:

```js
router.post(
  "/register",
  upload.single("avatar"),
  registerUser
);
```

---

# Middleware Concept

Middleware is a function that executes between:

```text
Request
    ↓
Middleware
    ↓
Controller
```

For uploads:

```text
Request
   ↓
Multer
   ↓
Controller
```

Multer processes the file before the controller runs.

---

# Cloudinary

## What is Cloudinary?

Cloudinary is a cloud-based media management service.

It provides:

* File Storage
* Image Hosting
* Video Hosting
* CDN Delivery
* Image Optimization

---

# Why Use Cloudinary?

Instead of storing images on our server:

```text
Our Server
```

we store them on:

```text
Cloudinary Servers
```

Benefits:

* Better scalability
* Faster delivery
* Reduced server load
* Automatic optimization

---

# Cloudinary Utility File

## File: cloudinary.js

```js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
```

---

# Cloudinary SDK Import

```js
import { v2 as cloudinary } from "cloudinary";
```

Cloudinary provides an SDK that allows backend applications to communicate with Cloudinary services.

---

# File System Module

```js
import fs from "fs";
```

Node.js built-in module.

Used for:

* Reading files
* Writing files
* Deleting files
* Managing folders

In this lesson it is used for cleanup.

---

# Cloudinary Configuration

```js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

This authenticates our backend with Cloudinary.

---

# uploadOnCloudinary()

```js
const uploadOnCloudinary = async (localFilePath) => {}
```

Purpose:

A reusable utility function that uploads a local file to Cloudinary.

---

# Async Function

```js
async
```

Uploading files involves:

* Network requests
* External servers
* Waiting for responses

These operations take time.

Therefore asynchronous programming is required.

---

# File Validation Check

```js
if (!localFilePath) return null;
```

Purpose:

Prevent upload attempts when no file exists.

Avoids runtime errors.

---

# Uploading File to Cloudinary

```js
const response =
  await cloudinary.uploader.upload(
    localFilePath,
    {
      resource_type: "auto",
    }
  );
```

This sends the file to Cloudinary.

---

# resource_type: "auto"

```js
resource_type: "auto"
```

Cloudinary automatically detects:

* Image
* Video
* PDF
* Other supported formats

Without manually specifying file types.

Examples:

```text
profile.png → image
resume.pdf → raw
movie.mp4 → video
```

---

# Cloudinary Response

Cloudinary returns an object containing:

```js
{
  url,
  secure_url,
  public_id,
  format,
  created_at
}
```

and many other properties.

---

# Logging Upload Success

```js
console.log(
  "File is uploaded on cloudinary",
  response.url
);
```

Useful during development to verify uploads.

---

# Returning Response

```js
return response;
```

Allows the controller to access:

* URL
* Public ID
* Metadata

and store required information in the database.

---

# Error Handling

```js
try {
}
catch(error) {
}
```

Possible failures:

* Network issues
* Invalid credentials
* Cloudinary downtime
* Invalid file

Proper error handling prevents application crashes.

---

# Cleanup Operation

```js
fs.unlinkSync(localFilePath);
```

Purpose:

Delete the temporary file.

---

# Why Delete Temporary Files?

Imagine:

```text
1000 uploads/day
```

If temporary files are never deleted:

```text
public/temp
```

would continuously grow.

Problems:

* Wasted storage
* Reduced server performance
* Disk space exhaustion

Cleanup prevents these issues.

---

# Why Cleanup Happens Inside catch()

Current implementation:

```js
catch(error) {
  fs.unlinkSync(localFilePath);
}
```

Meaning:

If upload fails:

```text
Temporary file exists
Cloudinary upload failed
Delete local file
```

This prevents orphaned files.

---

# Real Production Flow

Example: User Registration

```text
User uploads avatar
          ↓
Multer receives file
          ↓
Stored in public/temp
          ↓
Cloudinary upload
          ↓
Cloudinary returns URL
          ↓
URL saved in MongoDB
          ↓
User document created
          ↓
Response sent
```

Database document:

```js
{
  username: "akshat",
  avatar:
   "https://res.cloudinary.com/..."
}
```

Notice:

Only URL is stored.

Actual image remains on Cloudinary.

---

# Security Considerations

Production applications should also implement:

### File Type Validation

Allow only:

```text
jpg
jpeg
png
pdf
```

---

### File Size Limits

Prevent uploads like:

```text
5 GB video
```

Example:

```js
limits: {
  fileSize: 5 * 1024 * 1024
}
```

---

### Unique Filenames

Prevent overwriting.

---

### Virus Scanning

Important for enterprise systems.

---

### Authentication

Only authorized users should upload files.

---

# Key Takeaways

1. File uploads are handled using `multipart/form-data`.
2. Express cannot process uploaded files directly.
3. Multer is used to parse multipart requests.
4. `diskStorage()` stores files temporarily on disk.
5. Uploaded files are placed inside `public/temp`.
6. Cloudinary is used as cloud storage.
7. Credentials are stored using environment variables.
8. `uploadOnCloudinary()` is a reusable utility function.
9. `async/await` handles asynchronous uploads.
10. `resource_type: "auto"` automatically detects file types.
11. Cloudinary returns metadata including public URLs.
12. Temporary files should be deleted after failures.
13. Databases usually store file URLs instead of actual files.
14. Separating middleware and utility logic improves maintainability.
15. This upload architecture is widely used in modern Node.js applications.
