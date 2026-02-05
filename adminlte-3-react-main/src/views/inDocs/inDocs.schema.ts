import * as Yup from "yup";
import { IInDocsFormValues } from "@app/types/inDocs";
export type { IInDocsFormValues };

export const inDocsSchema = Yup.object().shape({
  issueNo: Yup.string().required("Issue No is required"),
  date: Yup.date().required("Date is required"),
  nameAddress: Yup.string().required("Name & Address is required"),
  subject: Yup.string().required("Subject is required"),
});

export const inDocsInitialValues: IInDocsFormValues = {
  issueNo: "",
  date: new Date().toISOString().split("T")[0],
  nameAddress: "",
  place: "",
  subject: "",
  documentsCount: "",
  referenceIssueNo: "",
  receivedIssueNo: "",
  fileHeadNo: "",
  stampReceived: "",
  remarks: "",
};
