import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Video Schema
const videoSchema = new Schema(
  {
    // Cloudinary URL of uploaded video
    videoFile: {
      type: String,
      required: true,
    },

    // Thumbnail image URL
    thumbnail: {
      type: String,
      required: true,
    },

    // Video title
    title: {
      type: String,
      required: true,
    },

    // Video description
    description: {
      type: String,
      required: true,
    },

    // Video duration (seconds)
    duration: {
      type: Number,
      required: true,
    },

    // Total video views
    views: {
      type: Number,
      default: 0,
    },

    // Determines whether video is publicly visible
    isPublished: {
      type: Boolean,
      default: true,
    },

    // User who owns/uploaded the video
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Plugin adds pagination support to aggregation queries
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);