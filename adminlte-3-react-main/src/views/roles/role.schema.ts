import * as Yup from "yup";
import { IRoleFormValues } from "@app/types/role";
export type { IRoleFormValues };

export const roleSchema = Yup.object().shape({
  name: Yup.string().required("Role name is required"),
  displayName: Yup.string().required("Display name is required"),
  description: Yup.string().optional(),
  permissions: Yup.array().of(Yup.string()).min(0),
  status: Yup.string()
    .oneOf(["active", "inactive"])
    .required("Status is required"),
  tenantId: Yup.string().optional(),
});

export const roleInitialValues: IRoleFormValues = {
  name: "",
  displayName: "",
  description: "",
  permissions: [],
  status: "active",
  tenantId: "",
};
