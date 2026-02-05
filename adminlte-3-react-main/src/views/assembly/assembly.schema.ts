import * as Yup from "yup";
import { IAssemblyFormValues } from "@app/types/assembly";
export type { IAssemblyFormValues };

export const assemblySchema = Yup.object().shape({
  name: Yup.string().required("Assembly name is required"),
  state: Yup.string().required("State is required"),
  division: Yup.string().required("Division is required"),
  district: Yup.string().optional(),
  parliament: Yup.string().required("Parliament is required"),
});

export const assemblyInitialValues: IAssemblyFormValues = {
  name: "",
  state: "",
  division: "",
  district: "",
  parliament: "",
};
