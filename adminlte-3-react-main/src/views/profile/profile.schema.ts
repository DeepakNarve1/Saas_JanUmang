import * as Yup from "yup";
import { IProfileSettingsFormValues } from "@app/types/profile";

export type { IProfileSettingsFormValues };

export const profileSettingsSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Invalid mobile number")
    .optional(),
  agreeTerms: Yup.boolean().oneOf([true], "You must agree to the terms"),
});

export const profileSettingsInitialValues: IProfileSettingsFormValues = {
  name: "",
  email: "",
  mobile: "",
  experience: "",
  skills: "",
  agreeTerms: false,
};

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export const changePasswordInitialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
