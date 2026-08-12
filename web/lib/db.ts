import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null;
}

let cached = global._mongooseConn ?? null;

/**
 * MONGODB_URI kontrolü BİLEREK modül düzeyinde değil.
 *
 * Modül içe aktarılırken fırlatınca `next build` çöküyordu: "Collecting page
 * data" aşaması her route handler'ı import ediyor, /api/admin/access da bu
 * dosyayı çekiyor. Yani hiçbir bağlantı kurulmadığı hâlde derleme, çalışma
 * zamanına ait bir sırrın varlığına bağımlı hâle geliyordu (Vercel'de her
 * dağıtım bu yüzden kırıldı).
 *
 * Kontrol çağrı anına taşındı: import yan etkisiz, hata ise veritabanı
 * gerçekten kullanılmak istendiğinde ve aynı mesajla çıkıyor. process.env'i
 * çağrı anında okumak sunucusuz ortamda da doğru olan davranış.
 */
export async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env değişkeni tanımlı değil');

  if (cached && mongoose.connection.readyState === 1) return cached;
  cached = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 10000,
  });
  global._mongooseConn = cached;
  return cached;
}
