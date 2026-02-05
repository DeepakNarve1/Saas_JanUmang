import * as Yup from "yup";
import { IDispatchRegisterFormValues } from "@app/types/dispatchRegister";
export type { IDispatchRegisterFormValues };

export const dispatchRegisterSchema = Yup.object().shape({
  date: Yup.date().required("Date is required"),
  year: Yup.string().required("Year is required"),
  month: Yup.string().required("Month is required"),
  dispatchNo: Yup.string().required("Dispatch No is required"),
});

export const dispatchRegisterInitialValues: IDispatchRegisterFormValues = {
  date: "",
  year: "",
  month: "",
  portalNo: "",
  samitiNo: "",
  dispatchNo: "",
  department: "",
  particulars: "",
  reference: "",
  district: "",
  block: "",
  panchayat: [],
  village: [],
  uploadLetter: null,
};
