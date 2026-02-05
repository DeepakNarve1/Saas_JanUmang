import * as Yup from "yup";
import { IDivisionFormValues } from "@app/types/division";
export type { IDivisionFormValues };

export const divisionSchema = Yup.object().shape({
  name: Yup.string().required("Division name is required"),
  state: Yup.string().required("State is required"),
});

export const divisionInitialValues: IDivisionFormValues = {
  name: "",
  state: "",
};
