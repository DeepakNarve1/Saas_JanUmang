import * as Yup from "yup";
import { ISamitiFormValues } from "@app/types/samiti";
export type { ISamitiFormValues };

export const samitiSchema = Yup.object().shape({
  name: Yup.string().required("Samiti name is required"),
});

export const samitiInitialValues: ISamitiFormValues = {
  name: "",
};
