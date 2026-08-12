// C:\Users\hucig\Medknowledge\web\lib\models\StudyStat.ts
//
// Kullanıcının çalışma verisi — kullanıcı başına TEK belge.
//
// Neden bu model var:
// Çalışma araçları (vurgu, not, çizim, tekrar) tarayıcıda localStorage'da
// duruyordu. Bu iki şeyi imkânsız kılıyordu: cihaz değiştirince veri gitmesi
// ve profil/premium sayfalarının gerçek sayı gösterebilmesi.
//
// Eski Express tarafındaki UserStat koleksiyonu bu işi yapmıyor: satırları
// `mk_uid` adlı ANONİM bir tarayıcı çerezine göre anahtarlanmış, yani oturum
// açan kullanıcıyla ilişkisi yok ve cihazlar arası taşınmıyor. Burada anahtar
// User belgesinin _id'si — ürünün gerçek kimliği.

import mongoose, { Schema, type Model } from "mongoose";

/** Depoda tutulan şekil. Model tipi bundan türer (bkz. dosya sonu). */
export interface IStudyStat {
  userId: string;
  marks: number;
  notes: number;
  strokes: number;
  cards: number;
  due: number;
  streak: number;
  pages: number;
  studiedAt?: Date | null;
  payload?: unknown;
  payloadBytes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const StudyStatSchema = new Schema<IStudyStat>(
  {
    /** User._id (string). Oturumdaki session.user.id ile birebir. */
    userId: { type: String, required: true, unique: true, index: true },

    /* ── Türetilmiş sayaçlar ──────────────────────────────────────────
       Profil ve premium panosu bunları okur. Ayrı tutulmalarının sebebi
       payload'ı açmadan sorgulanabilmeleri (liderlik, kohort analizi vb.). */
    marks: { type: Number, default: 0 }, // vurgu
    notes: { type: Number, default: 0 }, // notu olan sayfa
    strokes: { type: Number, default: 0 }, // el çizimi vuruşu
    cards: { type: Number, default: 0 }, // tekrar kartı
    due: { type: Number, default: 0 }, // şu an çalışılabilir kart
    streak: { type: Number, default: 0 }, // kesintisiz gün
    pages: { type: Number, default: 0 }, // dokunulmuş konu sayısı
    studiedAt: { type: Date }, // son çalışma anı

    /* ── Tam yedek ────────────────────────────────────────────────────
       study-backup.ts'in ürettiği şeklin aynısı. Cihaz değiştirince geri
       yüklemek için. Şema burada bilinçli olarak GEVŞEK (Mixed): çalışma
       araçlarının depo şeması sürüm atladıkça (marks:v2 → v3) bu modelin
       değişmesi gerekmesin. Doğrulama study-backup.ts'te yapılıyor. */
    payload: { type: Schema.Types.Mixed, default: null },

    /** payload boyutu (bayt). 16 MB'lik belge sınırına yaklaşmayı izlemek için. */
    payloadBytes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const StudyStat: Model<IStudyStat> =
  mongoose.models.StudyStat ?? mongoose.model<IStudyStat>("StudyStat", StudyStatSchema);

export default StudyStat;
