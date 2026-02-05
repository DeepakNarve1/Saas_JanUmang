export interface IInwardRegisterFormValues {
  issueNo: string;
  issueDate: string;
  letterName: string;
  letterReceivedDate: string;
  fromWhomReceived: string;
  letterDescription: string;
  subject: string;
  fileNo: string;
  receivedLetterNumber: string;
  receivedLetterDate: string;
  attachment: string;
  replyToNumber: string;
  replyToDate: string;
  ourReplyNumber: string;
  ourReplyDate: string;
  forwardedLetterNumber: string;
  forwardedLetterDate: string;
  section: string;
  signedDate: string;
  sentTo: string;
  remarks: string;
}

export interface IInwardRegister {
  _id: string;
  issueNo: string;
  issueDate: string;
  letterName: string;
  letterReceivedDate: string;
  fromWhomReceived: string;
  letterDescription?: string;
  subject?: string;
  fileNo?: string;
  receivedLetterNumber?: string;
  receivedLetterDate?: string;
  attachment?: string;
  replyToNumber?: string;
  replyToDate?: string;
  ourReplyNumber?: string;
  ourReplyDate?: string;
  forwardedLetterNumber?: string;
  forwardedLetterDate?: string;
  section?: string;
  signedDate?: string;
  sentTo?: string;
  remarks?: string;
  addedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IInwardRegisterResponse {
  data: IInwardRegister[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
