import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AccountRequest } from "../interfaces/request.interface";
import Job from "../models/job.model";
import City from "../models/city.model";
import CV from "../models/cv.model";

export const registerPost = async (req: Request, res: Response) => {
  const existAccount = await AccountCompany.findOne({
    email: req.body.email,
  });

  if (existAccount) {
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!",
    });
    return;
  }

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  const newAccount = new AccountCompany(req.body);
  await newAccount.save();

  res.json({
    code: "success",
    message: "Đăng ký tài khoản thành công!",
  });
};

export const loginPost = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existAccount = await AccountCompany.findOne({
    email: email,
  });

  if (!existAccount) {
    res.json({
      code: "error",
      message: "Email không tồn tại trong hệ thống!",
    });
    return;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    `${existAccount.password}`
  );
  if (!isPasswordValid) {
    res.json({
      code: "error",
      message: "Sai mật khẩu!",
    });
    return;
  }

  // sign 3 tham số: thông tin muốn mã hóa, mã bảo mật, thời gian lưu
  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email,
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // production (https) = true, dev (htttp) = false
    sameSite: "lax", // Cho phép gửi cookie giữa các tên miền
  });

  res.json({
    code: "success",
    message: "Đăng nhập thành công!",
  });
};

export const profilePatch = async (req: AccountRequest, res: Response) => {
  if (req.file) {
    req.body.logo = req.file.path;
  } else {
    delete req.body.logo;
  }

  await AccountCompany.updateOne(
    {
      _id: req.account.id,
    },
    req.body
  );

  res.json({
    code: "success",
    message: "Cập nhật thành công!",
  });
};

export const createJobPost = async (req: AccountRequest, res: Response) => {
  try {
    req.body.companyId = req.account.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies
      ? req.body.technologies.split(", ")
      : [];
    req.body.images = [];

    if (req.files) {
      for (const file of req.files as any[]) {
        req.body.images.push(file.path);
      }
    }

    const newRecord = new Job(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Tạo công việc thành công!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const listJob = async (req: AccountRequest, res: Response) => {
  try {
    const companyId = req.account.id;

    const find = {
      companyId: companyId,
    };

    // Phân trang
    const limitItems = 2;
    let page = 1;
    if (req.query.page && parseInt(req.query.page as string) > 0) {
      page = parseInt(req.query.page as string);
    }
    const skip = (page - 1) * limitItems;
    const totalRecord = await Job.countDocuments(find);
    const totalPage = Math.ceil(totalRecord / limitItems);

    const jobs = await Job.find(find)
      .sort({
        createdAt: "desc",
      })
      .limit(limitItems)
      .skip(skip);

    const dataFinal = [];

    for (const item of jobs) {
      dataFinal.push({
        id: item.id,
        companyLogo: req.account.logo,
        title: item.title,
        companyName: req.account.companyName,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        position: item.position,
        workingForm: item.workingForm,
        companyCity: req.account.companyCity,
        technologies: item.technologies,
      });
    }

    res.json({
      code: "success",
      message: "Thành công!",
      jobs: dataFinal,
      totalPage: totalPage,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const editJob = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    const companyId = req.account.id;

    const jobDetail = await Job.findOne({
      _id: id,
      companyId: companyId,
    });

    if (!jobDetail) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ!",
      });
      return;
    }

    res.json({
      code: "success",
      message: "Cập nhật thành công!",
      jobDetail: jobDetail,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const editJobPatch = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    const companyId = req.account.id;

    const jobDetail = await Job.findOne({
      _id: id,
      companyId: companyId,
    });

    if (!jobDetail) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ!",
      });
      return;
    }

    req.body.companyId = companyId;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies
      ? req.body.technologies.split(", ")
      : [];

    req.body.images = [];
    if (req.files) {
      for (const file of req.files as any[]) {
        req.body.images.push(file.path);
      }
    }

    await Job.updateOne(
      {
        _id: id,
        companyId: companyId,
      },
      req.body
    );

    res.json({
      code: "success",
      message: "Cập nhật thành công!",
      jobDetail: jobDetail,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const deleteJobDel = async (req: AccountRequest, res: Response) => {
  try {
    const id = req.params.id;
    const companyId = req.account.id;

    const jobDetail = await Job.findOne({
      _id: id,
      companyId: companyId,
    });

    if (!jobDetail) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ!",
      });
      return;
    }

    await Job.deleteOne({
      _id: id,
      companyId: companyId,
    });

    res.json({
      code: "success",
      message: "Đã xóa công việc!",
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const list = async (req: Request, res: Response) => {
  let limitItems = 12;
  if (req.query.limitItems) {
    limitItems = parseInt(req.query.limitItems as string);
  }

  const companyList = await AccountCompany.find({}).limit(limitItems);

  const companyListFinal = [];
  for (const item of companyList) {
    const dataItem = {
      id: item.id,
      logo: item.logo,
      companyName: item.companyName,
      cityName: "",
      totalJob: 0,
    };

    const city = await City.findOne({
      _id: item.city,
    });
    dataItem.cityName = city ? (city.name as string) : "";

    const totalJob = await Job.countDocuments({
      companyId: item.id,
    });
    dataItem.totalJob = totalJob ? totalJob : 0;

    companyListFinal.push(dataItem);
  }

  res.json({
    code: "success",
    message: "Thành công!",
    companyList: companyListFinal,
  });
};

export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const record = await AccountCompany.findOne({
      _id: id,
    });

    if (!record) {
      res.json({
        code: "error",
        message: "Dữ liệu không hợp lệ!",
      });
      return;
    }

    const companyDetail = {
      id: record.id,
      logo: record.logo,
      companyName: record.companyName,
      address: record.address,
      companyModel: record.companyModel,
      companyEmployees: record.companyEmployees,
      workingTime: record.workingTime,
      workOvertime: record.workOvertime,
      description: record.description,
    };

    // Danh sách công việc của công ty
    const dataFinal = [];

    const jobs = await Job.find({
      companyId: record.id,
    }).sort({
      createdAt: "desc",
    });

    const city = await City.findOne({
      _id: record.city,
    });

    for (const item of jobs) {
      const itemFinal = {
        id: item.id,
        companyLogo: record.logo,
        title: item.title,
        companyName: record.companyName,
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        position: item.position,
        workingForm: item.workingForm,
        cityName: city?.name,
        technologies: item.technologies,
      };

      dataFinal.push(itemFinal);
    }

    res.json({
      code: "success",
      message: "Thành công!",
      companyDetail: companyDetail,
      jobs: dataFinal,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};

export const listCV = async (req: AccountRequest, res: Response) => {
  try {
    const companyId = req.account.id;

    const jobList = await Job.find({
      companyId: companyId,
    });

    const jobListId = jobList.map((item) => item.id);

    const cvs = await CV.find({
      jobId: { $in: jobListId },
    }).sort({
      createdAt: "desc",
    });
    
    const dataFinal = [];
    for (const item of cvs) {
      const jobDetail = await Job.findOne({
        _id: item.jobId,
      });

      if (jobDetail) {
        const itemFinal = {
          id: item.id,
          jobTitle: jobDetail.title,
          fullName: item.fullName,
          email: item.email,
          phone: item.phone,
          jobSalaryMin: jobDetail.salaryMin,
          jobSalaryMax: jobDetail.salaryMax,
          jobPosition: jobDetail.position,
          jobWorkingForm: jobDetail.workingForm,
          viewed: item.viewed,
          status: item.status,
        };

        dataFinal.push(itemFinal);
      }
    }

    res.json({
      code: "success",
      message: "Thành công!",
      cvs: dataFinal,
      // totalPage: totalPage,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
