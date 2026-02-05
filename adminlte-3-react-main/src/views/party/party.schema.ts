import * as Yup from "yup";
import { IPartyFormValues } from "@app/types/party";
export type { IPartyFormValues };

export const partySchema = Yup.object().shape({
  name: Yup.string().required("Party name is required"),
});

export const partyInitialValues: IPartyFormValues = {
  name: "",
};
