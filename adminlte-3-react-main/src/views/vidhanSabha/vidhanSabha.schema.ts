import * as Yup from "yup";
import { IVidhanSabhaFormValues } from "@app/types/vidhanSabha";
export type { IVidhanSabhaFormValues };

export const vidhanSabhaSchema = Yup.object().shape({
  name: Yup.string().required("VidhanSabha name is required"),
  year: Yup.number().required("Year is required"),
});

export const vidhanSabhaInitialValues: IVidhanSabhaFormValues = {
  name: "",
  year: undefined,
};
