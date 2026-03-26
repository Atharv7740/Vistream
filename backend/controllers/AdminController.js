const User = require("../models/User");
const { Subscription } = require("../models/Subscription");
const fs = require("fs");
const path = require("path");
const {
  uploadVideoToS3,
  getStreamingUrl,
  deleteVideoFromS3,
  listVideosInS3,
} = require("../services/s3Service");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry -refreshToken");
    
    const usersWithSubscription = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.getActiveSubscription(user._id);
        return {
          ...user.toObject(),
          isPremium: !!subscription,
          subscription: subscription
            ? {
                plan: subscription.plan,
                endDate: subscription.endDate,
              }
            : null,
        };
      })
    );

    res.status(200).json({
      status: "success",
      count: usersWithSubscription.length,
      data: usersWithSubscription,
    });
  } catch (err) {
    console.error("[Admin] Error fetching users:", err);
    res.status(500).json({
      status: "failure",
      message: "Failed to fetch users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -otp -otpExpiry -refreshToken");

    if (!user) {
      return res.status(404).json({
        status: "failure",
        message: "User not found",
      });
    }

    const subscriptions = await Subscription.find({ userId: id }).sort({ createdAt: -1 });
    const activeSubscription = await Subscription.getActiveSubscription(id);

    res.status(200).json({
      status: "success",
      data: {
        ...user.toObject(),
        isPremium: !!activeSubscription,
        activeSubscription: activeSubscription,
        subscriptionHistory: subscriptions,
      },
    });
  } catch (err) {
    console.error("[Admin] Error fetching user:", err);
    res.status(500).json({
      status: "failure",
      message: "Failed to fetch user",
    });
  }
};

const getAllVideos = async (req, res) => {
  try {
    const localVideoDir = path.join(__dirname, "..", "videos");
    
    let videos = [];

    if (fs.existsSync(localVideoDir)) {
      const files = fs.readdirSync(localVideoDir);
      const mp4Files = files.filter((file) => path.extname(file).toLowerCase() === ".mp4");
      
      videos = mp4Files.map((file) => ({
        id: path.parse(file).name,
        name: file,
        source: "local",
      }));
    }

    try {
      const s3Videos = await listVideosInS3();
      const s3VideoList = s3Videos.map((item) => ({
        id: item.key.replace("videos/", "").replace(".mp4", ""),
        name: item.key.split("/").pop(),
        key: item.key,
        source: "s3",
        size: item.size,
        lastModified: item.lastModified,
      }));
      videos = [...videos, ...s3VideoList];
    } catch (s3Err) {
      console.log("[Admin] S3 not configured, using local storage only");
    }

    res.status(200).json({
      status: "success",
      count: videos.length,
      data: videos,
    });
  } catch (err) {
    console.error("[Admin] Error fetching videos:", err);
    res.status(500).json({
      status: "failure",
      message: "Failed to fetch videos",
    });
  }
};

const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "failure",
        message: "No video file provided",
      });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const contentType = req.file.mimetype || "video/mp4";

    const result = await uploadVideoToS3(fileBuffer, fileName, contentType);

    res.status(201).json({
      status: "success",
      message: "Video uploaded successfully",
      data: {
        key: result.key,
        url: result.url,
      },
    });
  } catch (err) {
    console.error("[Admin] Error uploading video:", err);
    res.status(500).json({
      status: "failure",
      message: "Failed to upload video",
      error: err.message,
    });
  }
};

const uploadVideoLocal = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "failure",
        message: "No video file provided",
      });
    }

    const videoDir = path.join(__dirname, "..", "videos");
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(videoDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    res.status(201).json({
      status: "success",
      message: "Video uploaded successfully",
      data: {
        id: fileName.replace(".mp4", ""),
        name: fileName,
        source: "local",
      },
    });
  } catch (err) {
    console.error("[Admin] Error uploading video:", err);
    res.status(500).json({
      status: "failure",
      message: "Failed to upload video",
      error: err.message,
    });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { key, source } = req.query;

    if (source === "s3" && key) {
      await deleteVideoFromS3(key);
    } else {
      const videoPath = path.join(__dirname, "..", "videos", `${id}.mp4`);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    res.status(200).json({
      status: "success",
      message: "Video deleted successfully",
    });
  } catch (err) {
    console.error("[Admin] Error deleting video:", err);
    res.status(500).json({
      status: "failure",
      message: "Failed to delete video",
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    const activeSubscriptions = await Subscription.find({
      status: "active",
      endDate: { $gt: new Date() },
    });

    const premiumUsers = activeSubscriptions.length;
    const freeUsers = totalUsers - premiumUsers;

    const revenue = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt role");

    res.status(200).json({
      status: "success",
      data: {
        totalUsers,
        premiumUsers,
        freeUsers,
        revenue,
        activeSubscriptions: activeSubscriptions.length,
        recentUsers,
      },
    });
  } catch (err) {
    console.error("[Admin] Error fetching stats:", err);
    res.status(500).json({
      status: "failure",
      message: "Failed to fetch dashboard stats",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getAllVideos,
  uploadVideo,
  uploadVideoLocal,
  deleteVideo,
  getDashboardStats,
};
