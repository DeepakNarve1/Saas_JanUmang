import * as Yup from "yup";

export const voterSchema = Yup.object().shape({
  name: Yup.string().required("Voter name is required"),
  fatherName: Yup.string().required("Father name is required"),
  mobileNumber: Yup.string()
    .required("Mobile number is required")
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  age: Yup.number()
    .required("Age is required")
    .min(18, "Age must be at least 18")
    .max(120, "Please enter a valid age"),
  cast: Yup.string().required("Caste is required"),
  subcast: Yup.string().required("Sub-Caste is required"),
  fulladdress: Yup.string().required("Full address is required"),
  blockname: Yup.string().required("Block is required"),
  boothname: Yup.string().required("Booth name is required"),
  boothno: Yup.string().required("Booth number is required"),
  panchayat: Yup.string().required("Panchayat is required"),
  village: Yup.string().required("Village is required"),
  fallaMarjra: Yup.string().required("Falla/Marjra is required"),
  voterId: Yup.string().required("Voter ID (Epic) is required"),
  image: Yup.string().optional(),
});

import { IVoterFormValues } from "@app/types/voter";
export type { IVoterFormValues };

export const voterInitialValues: IVoterFormValues = {
  name: "",
  fatherName: "",
  mobileNumber: "",
  age: "",
  cast: "",
  subcast: "",
  fulladdress: "",
  blockname: "",
  boothname: "",
  boothno: "",
  panchayat: "",
  village: "",
  fallaMarjra: "",
  voterId: "",
  image: "",
};
