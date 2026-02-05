import * as Yup from "yup";
import { IBlockFormValues } from "@app/types/block";
export type { IBlockFormValues };

export const blockSchema = Yup.object().shape({
  name: Yup.string().required("Block name is required"),
  state: Yup.string().optional(),
  division: Yup.string().optional(),
  district: Yup.string().optional(),
  parliament: Yup.string().optional(),
  assembly: Yup.string().optional(),
  year: Yup.string().optional(),
});

export const blockInitialValues: IBlockFormValues = {
  name: "",
  state: "",
  division: "",
  district: "",
  parliament: "",
  assembly: "",
};
