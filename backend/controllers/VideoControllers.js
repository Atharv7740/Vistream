const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegStatic);

const { getStreamingUrl, listVideosInS3 } = require("../services/s3Service");

/**
 * @desc Fetch all available videos (local + S3)
 * @route GET /api/video
 */
const getAllVideos = async (req, res) => {
  try {
    const videoDirectory = path.join(__dirname, "..", "videos");

    let videos = [];

    if (fs.existsSync(videoDirectory)) {
      const files = fs.readdirSync(videoDirectory);
      const mp4Files = files.filter(file => path.extname(file).toLowerCase() === ".mp4");

      const localVideos = mp4Files.map(file => ({
        id: path.parse(file).name,
        name: file,
        source: "local",
      }));
      videos = [...videos, ...localVideos];
    }

    try {
      const s3Videos = await listVideosInS3();
      const s3VideoList = s3Videos.map(item => ({
        id: item.key.replace("videos/", "").replace(".mp4", ""),
        name: item.key.split("/").pop(),
        key: item.key,
        source: "s3",
      }));
      videos = [...videos, ...s3VideoList];
    } catch (s3Err) {
      console.log("S3 not configured, serving local videos only");
    }

    res.status(200).json({
      status: "success",
      count: videos.length,
      data: videos,
    });
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ status: "error", message: "Failed to fetch videos" });
  }
};

/**
 * @desc Stream video content efficiently with byte-range support (local + S3)
 * @route GET /api/video/watch?id={id}
 */
const getVideoStream = async (req, res) => {
  try {
    const { id, key, source } = req.query;
    if (!id && !key) return res.status(400).json({ error: "Video ID is required" });

    if (source === "s3" && key) {
      const signedUrl = await getStreamingUrl(key);
      return res.redirect(signedUrl);
    }

    const videoPath = path.resolve("videos", `${id}.mp4`);
    if (!fs.existsSync(videoPath)) return res.status(404).json({ error: "Video not found" });

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600",
      });
      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);

    if (isNaN(start) || start >= fileSize)
      return res.status(416).send("Requested range not satisfiable");

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=3600",
      Connection: "keep-alive",
    };

    res.writeHead(206, headers);
    const stream = fs.createReadStream(videoPath, { start, end });
    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.end();
    });
    stream.pipe(res);
  } catch (err) {
    console.error("Error streaming video:", err);
    res.status(500).json({ error: "Internal server error while streaming video" });
  }
};

/**
 * @desc Serve or auto-generate a video thumbnail using fluent-ffmpeg
 * @route GET /api/video/thumbnail?videoId={id}
 */
const getThumbnail = async (req, res) => {
  try {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ error: "Video ID is required" });

    const thumbnailDir = path.join(__dirname, "..", "thumbnails");
    const thumbnailPath = path.join(thumbnailDir, `${videoId}.jpg`);

    // Create thumbnails folder if missing
    if (!fs.existsSync(thumbnailDir)) fs.mkdirSync(thumbnailDir, { recursive: true });

    // If thumbnail already exists, send it
    if (fs.existsSync(thumbnailPath)) return res.sendFile(thumbnailPath);

    // Generate thumbnail using fluent-ffmpeg
    const videoPath = path.join(__dirname, "..", "videos", `${videoId}.mp4`);
    if (!fs.existsSync(videoPath)) return res.status(404).json({ error: "Video not found" });

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ["2"], // capture at 2s mark
        filename: `${videoId}.jpg`,
        folder: thumbnailDir,
        size: "320x?",
      })
      .on("end", () => res.sendFile(thumbnailPath))
      .on("error", (err) => {
        console.error("Thumbnail generation error:", err);
        res.status(500).json({ error: "Failed to generate thumbnail" });
      });

  } catch (err) {
    console.error("Error getting thumbnail:", err);
    res.status(500).json({ error: "Failed to serve thumbnail" });
  }
};

module.exports = {
  getAllVideos,
  getVideoStream,
  getThumbnail,
};
