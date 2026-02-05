import * as Yup from "yup";

export const phoneDirectorySchema = Yup.object({
  name: Yup.string().required("Name is required"),
  post: Yup.string().optional(),
  department: Yup.string().optional(),
  district: Yup.string().optional(),
  block: Yup.string().required("Block is required"),
  party: Yup.string().optional(),
  number: Yup.string()
    .matches(/^[0-9]{10}$/, "Number must be exactly 10 digits")
    .required("Number is required"),
  alternateNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Alternate Number must be exactly 10 digits")
    .optional(),
  email: Yup.string().email("Invalid email format").optional(),
  remark: Yup.string().optional(),
  status: Yup.string().required("Status is required"),
});

import { IPhoneDirectoryFormValues } from "@app/types/phoneDirectory";
export type { IPhoneDirectoryFormValues };

export const phoneDirectoryInitialValues: IPhoneDirectoryFormValues = {
  name: "",
  post: "",
  department: "",
  district: "",
  block: "Other",
  party: "",
  number: "",
  alternateNumber: "",
  email: "",
  remark: "",
  status: "Active",
};
