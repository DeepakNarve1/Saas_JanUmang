import * as Yup from "yup";
import { IInwardRegisterFormValues } from "@app/types/inwardRegister";
export type { IInwardRegisterFormValues };

export const inwardRegisterSchema = Yup.object().shape({
  issueNo: Yup.string().required("Issue No is required"),
  issueDate: Yup.date().required("Issue Date is required"),
  letterName: Yup.string().required("Letter Name is required"),
  letterReceivedDate: Yup.date().required("Letter Received Date is required"),
  fromWhomReceived: Yup.string().required("From Whom Received is required"),
});

export const inwardRegisterInitialValues: IInwardRegisterFormValues = {
  issueNo: "",
  issueDate: "",
  letterName: "",
  letterReceivedDate: "",
  fromWhomReceived: "",
  letterDescription: "",
  subject: "",
  fileNo: "",
  receivedLetterNumber: "",
  receivedLetterDate: "",
  attachment: "",
  replyToNumber: "",
  replyToDate: "",
  ourReplyNumber: "",
  ourReplyDate: "",
  forwardedLetterNumber: "",
  forwardedLetterDate: "",
  section: "",
  signedDate: "",
  sentTo: "",
  remarks: "",
};
