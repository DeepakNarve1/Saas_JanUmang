import * as Yup from "yup";
import {
  IGenericSamitiFormValues,
  IBhagoriaSamitiFormValues,
} from "@app/types/vidhasabhaSamiti";

export type { IGenericSamitiFormValues, IBhagoriaSamitiFormValues };

export const genericSamitiSchema = Yup.object().shape({
  uniqueId: Yup.string().optional(),
  year: Yup.string().required("Year is required"),
  acMpNo: Yup.string().optional(),
  block: Yup.string().required("Block is required"),
  sector: Yup.string().optional(),
  microSectorNo: Yup.string().optional(),
  microSectorName: Yup.string().optional(),
  boothName: Yup.string().optional(),
  boothNo: Yup.string().optional(),
  gramPanchayat: Yup.string().optional(),
  village: Yup.string().optional(),
  faliya: Yup.string().optional(),
  totalMembers: Yup.string()
    .matches(/^\d*$/, "Must be a valid number")
    .optional(),
  image: Yup.string().optional(),
});

export const bhagoriaSamitiSchema = Yup.object().shape({
  uniqueId: Yup.string().optional(),
  block: Yup.string().required("Block is required"),
  date: Yup.string().required("Date is required"),
  day: Yup.string().required("Day is required"),
  bhagoriaHat: Yup.string().required("Bhagoria Hat is required"),
  numberOfDol: Yup.string()
    .matches(/^\d*$/, "Must be a valid number")
    .optional(),
  inChargeName: Yup.string().optional(),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Must be exactly 10 digits")
    .optional(),
  remark: Yup.string().optional(),
});

export const genericSamitiInitialValues: IGenericSamitiFormValues = {
  uniqueId: "",
  year: new Date().getFullYear().toString(),
  acMpNo: "",
  block: "",
  sector: "",
  microSectorNo: "",
  microSectorName: "",
  boothName: "",
  boothNo: "",
  gramPanchayat: "",
  village: "",
  faliya: "",
  totalMembers: "",
  image: "",
  fileName: "",
};

export const bhagoriaSamitiInitialValues: IBhagoriaSamitiFormValues = {
  uniqueId: "",
  block: "",
  date: "",
  day: "",
  bhagoriaHat: "",
  numberOfDol: "",
  inChargeName: "",
  mobileNumber: "",
  remark: "",
};
