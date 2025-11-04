import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import City from "../models/city.model";

export const search = async (req: Request, res: Response) => {
  const dataFinal = [];
  if (Object.keys(req.query).length > 0) {
    const find: any = {};

    if (req.query.language) {
      find.technologies = req.query.language;
    }

    if (req.query.city) {
      const city = await City.findOne({
        name: req.query.city,
      });

      if (city) {
        const listCompanyInCity = await AccountCompany.find({
          city: city.id,
        });

        const listIdCompanyInCity = listCompanyInCity.map((item) => item.id);
        find.companyId = { $in: listIdCompanyInCity };
      } else {
        find.companyId = "__no_match__";
      }
    }

    if (req.query.company) {
      const company = await AccountCompany.findOne({
        companyName: req.query.company,
      });
      find.companyId = company?.id;
    }

    if (req.query.keyword) {
      const keywordRegex = new RegExp(req.query.keyword as string, "i");
      find.title = keywordRegex;
    }

    const jobs = await Job.find(find).sort({ createdAt: "desc" });

    for (const item of jobs) {
      const itemFinal = {
        id: item.id,
        companyLogo: "",
        title: item.title,
        companyName: "",
        salaryMin: item.salaryMin,
        salaryMax: item.salaryMax,
        position: item.position,
        workingForm: item.workingForm,
        cityName: "",
        technologies: item.technologies,
      };

      const companyInfo = await AccountCompany.findOne({
        _id: item.companyId,
      });

      if (companyInfo) {
        itemFinal.companyLogo = companyInfo.logo as string;
        itemFinal.companyName = companyInfo.companyName as string;

        const city = await City.findOne({
          _id: companyInfo.city,
        });

        itemFinal.cityName = city?.name as string;

        dataFinal.push(itemFinal);
      }
    }
  }

  res.json({
    code: "success",
    message: "Thành công!",
    jobs: dataFinal,
  });
};
