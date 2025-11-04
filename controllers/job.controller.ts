import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";

export const detail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const record = await Job.findOne({
      _id: id,
    });

    if (!record) {
      res.json({
        code: "success",
        message: "Thất bại!",
      });
      return;
    }

    const companyInfo = await AccountCompany.findOne({
      _id: record.companyId,
    });

    if (!companyInfo) {
      res.json({
        code: "success",
        message: "Thất bại!",
      });
      return;
    }

    const jobDetail = {
      id: record.id,
      title: record.title,
      companyName: companyInfo.companyName,
      salaryMin: record.salaryMin,
      salaryMax: record.salaryMax,
      images: record.images,
      position: record.position,
      workingForm: record.workingForm,
      companyAddress: companyInfo.address,
      technologies: record.technologies,
      description: record.description,
      companyLogo: companyInfo.logo,
      companyId: record.companyId,
      companyModel: companyInfo.companyModel,
      companyEmployees: companyInfo.companyEmployees,
      workingTime: companyInfo.workingTime,
      workingOverTime: companyInfo.workOvertime,
    };

    res.json({
      code: "success",
      message: "Thành công!",
      jobDetail: jobDetail,
    });
  } catch (error) {
    res.json({
      code: "success",
      message: "Thất bại!",
    });
  }
};
