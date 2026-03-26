const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDb = require("./db");
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");
const discoverRoutes = require("./Routes/discoverRoutes");
const movieRoutes = require("./Routes/movieRoutes");
const tvRoutes = require("./Routes/tvRoutes");
const videoRoutes = require("./Routes/videoRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const { startExpiryJob } = require("./jobs/subscriptionExpiry");

dotenv.config();
connectDb();

const app = express();

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the ViStream backend server" });
});

app.use("/api/discover", discoverRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/tv", tvRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", status: "failure" });
});

const port = process.env.PORT || 3332;
app.listen(port, () => {
  console.log(`Server Running at http://localhost:${port}`);
  startExpiryJob();
});
