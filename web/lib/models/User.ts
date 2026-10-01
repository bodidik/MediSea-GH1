import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserPlan = 'free' | 'member' | 'premium';
export type UserInstitution = 'kayseritip' | null;

export interface IUser extends Document {
  name: string;
  email: string;
  /** Google ile açılmış hesapta YOK; parola sıfırlamayla edinilir. */
  password?: string | null;
  /** Google hesabının kimliği (sub); e-postayla eşlenen hesaba ilk Google girişinde yazılır. */
  googleId?: string | null;
  /** Günlük PDF hakkı: Türkiye günü + o gün indirilen konu yolları (lib/pdf-hak.ts). */
  pdfIndirme?: { gun: string; konular: string[] } | null;
  plan: UserPlan;
  institution: UserInstitution;
  trialEndsAt: Date | null;
  /**
   * Parolanın EN SON ne zaman değiştiğini damgalar; eski oturumları
   * kapatmak için tek ölçüt bu (bkz. `auth.ts` jwt geri çağrısı).
   *
   * `updatedAt` KULLANILAMAZ: plan değişikliği, kurum ataması gibi
   * parolayla ilgisi olmayan her yazma onu da ileri atar ve kullanıcının
   * oturumu sebepsiz kapanırdı.
   */
  sifreDegistiAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, default: null },
    googleId:    { type: String, default: null },
    pdfIndirme:  { type: { gun: String, konular: [String] }, default: null },
    plan:        { type: String, enum: ['free', 'member', 'premium'], default: 'free' },
    institution: { type: String, enum: ['kayseritip', null], default: null },
    trialEndsAt: { type: Date, default: null },
    sifreDegistiAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);
export default User;
