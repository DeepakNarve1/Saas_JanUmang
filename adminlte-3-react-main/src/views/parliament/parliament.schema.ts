import * as Yup from "yup";
import { IParliamentFormValues } from "@app/types/parliament";
export type { IParliamentFormValues };

export const parliamentSchema = Yup.object().shape({
  name: Yup.string().required("Parliament name is required"),
  state: Yup.string().required("State is required"),
  division: Yup.string().required("Division is required"),
  district: Yup.string().optional(),
});

export const parliamentInitialValues: IParliamentFormValues = {
  name: "",
  state: "",
  division: "",
  district: "",
};
