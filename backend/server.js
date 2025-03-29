import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoute from "./src/routes/userRoute.js";
import adminRoute from "./src/routes/adminRoute.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const port = process.env.PORT || 4000;

const corsOptions = {
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true, // Required for cookies
  methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
