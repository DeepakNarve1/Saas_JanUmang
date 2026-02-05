import * as Yup from "yup";
import { IWorkTypeFormValues } from "@app/types/workType";
export type { IWorkTypeFormValues };

export const workTypeSchema = Yup.object().shape({
  name: Yup.string().required("Work type name is required"),
});

export const workTypeInitialValues: IWorkTypeFormValues = {
  name: "",
};
