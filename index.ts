import express from "express";
import dotenv from "dotenv";

// Load biến môi trường từ file env
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.route";
import { connectDB } from "./config/database.config";

const app = express();
const port = 8080;

// Kết nối CSDL
connectDB();

// Cấu hình CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // cho phép gửi cookie
  })
);

// Cho phép gửi dữ liệu lên dạng JSON
app.use(express.json());

// Cấu hình lấy cookie từ fe gửi lên
app.use(cookieParser());

// Thiết lập đường dẫn
app.use("/", routes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
