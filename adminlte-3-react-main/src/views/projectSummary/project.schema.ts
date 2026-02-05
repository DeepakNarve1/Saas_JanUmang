import * as Yup from "yup";
import { IProjectFormValues } from "@app/types/project";
export type { IProjectFormValues };

export const projectSchema = Yup.object().shape({
  district: Yup.string().required("District is required"),
  block: Yup.string().required("Block is required"),
  department: Yup.string().required("Department is required"),
  workName: Yup.string().required("Work Name is required"),
  projectCost: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Project Cost is required")
    .min(0, "Cost cannot be negative"),
  proposalEstimate: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Proposal Estimate is required")
    .min(0, "Estimate cannot be negative"),
  tsNoDate: Yup.string().nullable(),
  asNoDate: Yup.string().nullable(),
  status: Yup.string().required("Status is required"),
  officerName: Yup.string().nullable(),
  contactNumber: Yup.string()
    .nullable()
    .matches(/^[0-9]{10}$/, "Contact number must be 10 digits"),
  remarks: Yup.string().nullable(),
  currentProgress: Yup.string().nullable(),
});

export const projectInitialValues: IProjectFormValues = {
  district: "",
  block: "",
  department: "",
  workName: "",
  projectCost: "",
  proposalEstimate: "",
  tsNoDate: "",
  asNoDate: "",
  status: "Pending",
  officerName: "",
  contactNumber: "",
  remarks: "",
  currentProgress: "",
};
