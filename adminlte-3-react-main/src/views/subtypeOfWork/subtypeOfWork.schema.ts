import * as Yup from "yup";
import { ISubTypeOfWorkFormValues } from "@app/types/subtypeOfWork";
export type { ISubTypeOfWorkFormValues };

export const subtypeOfWorkSchema = Yup.object().shape({
  typeOfWork: Yup.string().required("Type of Work is required"),
  subTypeOfWork: Yup.string().required("Sub Type of Work is required"),
});

export const subtypeOfWorkInitialValues: ISubTypeOfWorkFormValues = {
  typeOfWork: "",
  subTypeOfWork: "",
};
