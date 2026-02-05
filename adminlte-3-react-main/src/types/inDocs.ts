export interface IInDocsFormValues {
  issueNo: string;
  date: string;
  nameAddress: string;
  place: string;
  subject: string;
  documentsCount: string;
  referenceIssueNo: string;
  receivedIssueNo: string;
  fileHeadNo: string;
  stampReceived: string;
  remarks: string;
}

export interface IInDocs {
  _id: string;
  issueNo: string;
  date: string;
  nameAddress: string;
  place?: string;
  subject: string;
  documentsCount?: string;
  referenceIssueNo?: string;
  receivedIssueNo?: string;
  fileHeadNo?: string;
  stampReceived?: string;
  remarks?: string;
  addedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IInDocsResponse {
  data: IInDocs[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
