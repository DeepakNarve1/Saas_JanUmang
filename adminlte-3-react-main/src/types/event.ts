export interface IEventFormValues {
  uniqueId: string;
  district: string;
  year: string;
  month: string;
  receivingDate: string;
  programDate: string;
  time: string;
  eventType: string;
  eventDetails: string;
  priority: string;
  venueCity: string;
  referencePerson: string;
  contactNumber: string;
  address: string;
  name: string;
  location: string;
  probability: string;
  duration: string;
  attended: string;
  pressConference: string;
  dispatchDate: string;
  dispatchNumber: string;
  remarks: string;
  addedBy: string;
}

export interface IEvent {
  _id: string;
  uniqueId: string;
  district: string;
  year: string;
  month: string;
  receivingDate: string;
  programDate: string;
  time: string;
  eventType: string;
  eventDetails: string;
  priority: string;
  venueCity: string;
  referencePerson: string;
  contactNumber: string;
  address: string;
  name: string;
  location: string;
  probability: string;
  duration: string;
  attended: string;
  pressConference: string;
  dispatchDate: string;
  dispatchNumber: string;
  remarks: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEventResponse {
  data: IEvent[];
  count: number;
  total: number;
  page: number;
  limit: number;
}
