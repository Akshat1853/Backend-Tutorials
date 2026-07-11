// Import Cloudinary SDK (v2 API)
import { v2 as cloudinary } from "cloudinary";

// Import Node.js File System module
// Used to delete temporary files from local storage
import fs from "fs";

/*
|--------------------------------------------------------------------------
| Cloudinary Configuration
|--------------------------------------------------------------------------
|
| These credentials authenticate our backend application with Cloudinary.
| Values are stored in environment variables for security purposes.
|
*/

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // If no file path is provided, stop execution
    if (!localFilePath) return null;

    // upload file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Log uploaded file URL for debugging/development
    console.log("File is uploaded on Cloudinary:", response.url);
    fs.unlinkSync(localFilePath);
    
    // Return complete Cloudinary response object
    return response;
  } catch (error) {
    /*
    ------------------------------------------------------------------------
    | Cleanup Operation
    ------------------------------------------------------------------------
    |
    | If Cloudinary upload fails, the file still exists
    | inside the temporary local folder.
    |
    | To avoid unnecessary storage usage,
    | delete the temporary file immediately.
    |
    */

    fs.unlinkSync(localFilePath);

    // Return null to indicate upload failure
    return null;
  }
};

// Export utility function so it can be used in controllers
export { uploadOnCloudinary };
