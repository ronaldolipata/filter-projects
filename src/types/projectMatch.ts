import { Types } from 'mongoose';

export type ProjectMatch = {
  _id?: Types.ObjectId;
  title?: string | RegExp;
  services?: object | string;
  year?: number;
  status?: string;
  deleted: boolean;
};
