import mongoose, { Schema, Model } from 'mongoose';

export type AccessLevel = 'V' | 'M' | 'P';

export interface IContentAccess {
  topicId:     string;
  accessLevel: AccessLevel;
  updatedBy:   string;
  updatedAt:   Date;
}

const ContentAccessSchema = new Schema<IContentAccess>(
  {
    topicId:     { type: String, required: true, unique: true, index: true },
    accessLevel: { type: String, enum: ['V', 'M', 'P'], default: 'P' },
    updatedBy:   { type: String, default: 'admin' },
  },
  { timestamps: true }
);

const ContentAccess: Model<IContentAccess> =
  mongoose.models.ContentAccess ??
  mongoose.model<IContentAccess>('ContentAccess', ContentAccessSchema);

export default ContentAccess;
