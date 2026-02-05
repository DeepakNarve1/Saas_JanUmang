import * as Yup from "yup";
import { IVillageFormValues } from "@app/types/village";
export type { IVillageFormValues };

export const villageSchema = Yup.object().shape({
  name: Yup.string().required("Village name is required"),
  state: Yup.string().optional(),
  division: Yup.string().optional(),
  district: Yup.string().optional(),
  parliament: Yup.string().optional(),
  assembly: Yup.string().optional(),
  block: Yup.string().required("Block is required"),
  booth: Yup.string().required("Booth is required"),
  panchayat: Yup.string().required("Panchayat is required"),
});

export const villageInitialValues: IVillageFormValues = {
  name: "",
  state: "",
  division: "",
  district: "",
  parliament: "",
  assembly: "",
  block: "",
  booth: "",
  panchayat: "",
};
