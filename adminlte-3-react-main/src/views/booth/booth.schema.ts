import * as Yup from "yup";
import { IBoothFormValues } from "@app/types/booth";
export type { IBoothFormValues };

export const boothSchema = Yup.object().shape({
  name: Yup.string().required("Booth name is required"),
  code: Yup.string().optional(),
  state: Yup.string().optional(),
  division: Yup.string().optional(),
  district: Yup.string().optional(),
  parliament: Yup.string().optional(),
  assembly: Yup.string().optional(),
  block: Yup.string().required("Block is required"),
  year: Yup.string().optional(),
});

export const boothInitialValues: IBoothFormValues = {
  name: "",
  code: "",
  state: "",
  division: "",
  district: "",
  parliament: "",
  assembly: "",
  block: "",
  year: "",
};
