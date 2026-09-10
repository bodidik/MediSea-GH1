import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * PAROLA SIFIRLAMA JETONU.
 *
 * HAM JETON HİÇBİR ZAMAN SAKLANMAZ — yalnızca SHA-256 özeti. Sebep: veritabanı
 * okunabilir hale gelirse (yedek sızıntısı, salt-okunur erişim), saklanan ham
 * jetonlar doğrudan hesap ele geçirme anlamına gelirdi. Özet saklandığında
 * saldırganın elindeki değer işe yaramaz; doğrulama, gelen ham jetonun özeti
 * alınarak yapılır.
 *
 * `expiresAt` üzerinde TTL indeksi var: MongoDB süresi dolmuş kaydı kendisi
 * siliyor, temizlik için ayrı bir iş gerekmiyor. TTL SİLME GECİKMELİ olabilir
 * (arka plan görevi ~60 sn'de bir koşar), bu yüzden süre denetimi kodda DA
 * yapılıyor — indekse güvenip kontrolü atlamak, gecikme penceresinde süresi
 * dolmuş jetonu kabul etmek olurdu.
 *
 * `kullanildiAt` tek kullanımlık olmayı sağlıyor: kayıt silinmiyor, işaretleniyor.
 * Silseydik "bu jeton daha önce kullanıldı" ile "böyle bir jeton hiç olmadı"
 * ayrımını kaybederdik.
 */
export interface ISifreSifirlamaJetonu extends Document {
  kullaniciId: mongoose.Types.ObjectId;
  jetonOzeti: string;
  expiresAt: Date;
  kullanildiAt: Date | null;
  createdAt: Date;
}

const SifreSifirlamaJetonuSchema = new Schema<ISifreSifirlamaJetonu>(
  {
    kullaniciId:  { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jetonOzeti:   { type: String, required: true, unique: true, index: true },
    expiresAt:    { type: Date, required: true },
    kullanildiAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

/* TTL: süresi dolan kayıt kendiliğinden silinir. */
SifreSifirlamaJetonuSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SifreSifirlamaJetonu: Model<ISifreSifirlamaJetonu> =
  mongoose.models.SifreSifirlamaJetonu ??
  mongoose.model<ISifreSifirlamaJetonu>('SifreSifirlamaJetonu', SifreSifirlamaJetonuSchema);

export default SifreSifirlamaJetonu;
