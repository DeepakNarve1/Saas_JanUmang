import * as Yup from "yup";
import { IDepartmentFormValues } from "@app/types/department";
export type { IDepartmentFormValues };

export const departmentSchema = Yup.object().shape({
  name: Yup.string().required("Department name is required"),
});

export const departmentInitialValues: IDepartmentFormValues = {
  name: "",
};
