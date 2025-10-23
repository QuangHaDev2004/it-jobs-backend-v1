import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    companyName: String,
    email: String,
    password: String,
    address: String,
    companyModel: String,
    companyEmployees: String,
    workingTime: String,
    workOvertime: String,
    phone: String,
    description: String,
    logo: String,
    city: String,
  },
  {
    timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
  }
);

const AccountCompany = mongoose.model(
  "AccountCompany",
  schema,
  "accounts-company"
);

export default AccountCompany;
