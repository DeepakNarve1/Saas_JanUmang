import * as Yup from "yup";
import { ICallFormValues } from "@app/types/call";
export type { ICallFormValues };

export const callSchema = Yup.object().shape({
  date: Yup.string().required("Date & Time is required"),
  category: Yup.string().required("Category is required"),
  name: Yup.string().required("Name is required"),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile No is required"),
  subject: Yup.string().required("Subject is required"),
  description: Yup.string().required("Description is required"),
});

export const callInitialValues: ICallFormValues = {
  date: "",
  category: "",
  name: "",
  mobile: "",
  subject: "",
  assignDate: "",
  address: "",
  description: "",
  remark: "",
  tenantId: "",
};
