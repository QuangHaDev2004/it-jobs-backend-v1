import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.route";
import { connectDB } from "./config/database.config";

const app = express();
const port = 8080;

// Load biến môi trường từ file env
dotenv.config();

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

// Thiết lập đường dẫn
app.use("/", routes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`);
});
