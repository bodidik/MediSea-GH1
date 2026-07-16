import mongoose, { Schema, Model } from 'mongoose';

/**
 * KayseriTıp içi yetki sistemi.
 * institution: 'kayseritip' olan her kullanıcı buraya bakılır.
 * Kayıt yoksa → sadece öğrenci (görüntüle/indir).
 */
export type KtRol = 'ogrenci' | 'ogretim_gorevlisi' | 'kt_admin';

export interface IKtYetki {
  email:      string;          // User.email ile eşleşir
  rol:        KtRol;
  // ogretim_gorevlisi için: hangi stajId/alanId çiftlerine yetkiliyse
  // ["ic-hastaliklari-donem4/gastroenteroloji", ...]
  // boş dizi → hiçbir alana yetki yok
  // kt_admin için bu alan dikkate alınmaz (tümüne erişir)
  alanlar:    string[];
  notlar?:    string;
  updatedBy:  string;
}

const KtYetkiSchema = new Schema<IKtYetki>(
  {
    email:     { type: String, required: true, unique: true, lowercase: true },
    rol:       { type: String, enum: ['ogrenci', 'ogretim_gorevlisi', 'kt_admin'], default: 'ogrenci' },
    alanlar:   { type: [String], default: [] },
    notlar:    { type: String, default: '' },
    updatedBy: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

const KtYetki: Model<IKtYetki> =
  mongoose.models.KtYetki ?? mongoose.model<IKtYetki>('KtYetki', KtYetkiSchema);

export default KtYetki;
