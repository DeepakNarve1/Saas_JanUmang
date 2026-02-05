import * as Yup from "yup";

export const visitorSchema = Yup.object({
  district: Yup.string().required("District is required"),
  vidhansabha: Yup.string().required("Vidhansabha is required"),
  block: Yup.string().required("Block is required"),
  date: Yup.string().required("Date is required"),
  time: Yup.string().required("Time is required"),
  name: Yup.string().required("Name is required"),
  category: Yup.string().required("Category is required"),
  post: Yup.string().required("Post is required"),
  place: Yup.string().required("Place is required"),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Invalid mobile number")
    .required("Mobile Number is required"),
  incomingVisitor: Yup.string().required("Selection is required"),
  message: Yup.string().required("Message is required"),
  visitorType: Yup.string().required("Visitor Type is required"),
  attendBy: Yup.string().required("Attend By is required"),
  remarks: Yup.string().required("Remarks is required"),
  bhaiyakanirdesh: Yup.string().required("Field is required"),
  addedBy: Yup.string().required("Added By is required"),
});

import { IVisitorFormValues } from "@app/types/visitor";
export type { IVisitorFormValues };

export const visitorInitialValues: IVisitorFormValues = {
  district: "",
  vidhansabha: "",
  block: "",
  date: "",
  time: "",
  name: "",
  category: "",
  post: "",
  place: "",
  mobileNumber: "",
  incomingVisitor: "VISITOR",
  message: "",
  visitorType: "General Visitor",
  attendBy: "",
  remarks: "",
  bhaiyakanirdesh: "",
  addedBy: "",
};
