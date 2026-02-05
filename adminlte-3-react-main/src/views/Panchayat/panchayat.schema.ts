import * as Yup from "yup";
import { IPanchayatFormValues } from "@app/types/panchayat";
export type { IPanchayatFormValues };

export const panchayatSchema = Yup.object().shape({
  name: Yup.string().required("Panchayat name is required"),
  state: Yup.string().optional(),
  division: Yup.string().optional(),
  district: Yup.string().optional(),
  parliament: Yup.string().optional(),
  assembly: Yup.string().optional(),
  block: Yup.string().required("Block is required"),
  booth: Yup.string().required("Booth is required"),
  year: Yup.string().optional(),
});

export const panchayatInitialValues: IPanchayatFormValues = {
  name: "",
  state: "",
  division: "",
  district: "",
  parliament: "",
  assembly: "",
  block: "",
  booth: "",
  year: "",
};
