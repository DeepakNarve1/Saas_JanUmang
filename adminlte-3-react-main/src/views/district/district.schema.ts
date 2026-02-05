import * as Yup from "yup";
import { IDistrictFormValues } from "@app/types/district";
export type { IDistrictFormValues };

export const districtSchema = Yup.object().shape({
  name: Yup.string().required("District name is required"),
  division: Yup.string().required("Division is required"),
});

export const districtInitialValues: IDistrictFormValues = {
  name: "",
  division: "",
};
