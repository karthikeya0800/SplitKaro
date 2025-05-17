import { CurrencyType } from "./redux/store";

export interface IUser {
  _id: string;
  email: string;
  currency?: CurrencyType;
}

export interface IParticipant {
  _id: string;
  userId: string;
  name: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaidBy {
  participantId: string;
  name: string;
}

export interface IPaidFor {
  participantId: string;
  name: string;
  amount?: number;
}

export interface IExpense {
  _id: string;
  userId: string;
  amount: number;
  description: string;
  paidBy: IPaidBy;
  paidFor: IPaidFor[];
  date: string;
  createdAt: string;
  updatedAt: string;
}
