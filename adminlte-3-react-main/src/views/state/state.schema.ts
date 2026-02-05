import * as Yup from "yup";
import { IStateFormValues } from "@app/types/state";
export type { IStateFormValues };

export const stateSchema = Yup.object().shape({
  name: Yup.string().required("State name is required"),
});

export const stateInitialValues: IStateFormValues = {
  name: "",
};
