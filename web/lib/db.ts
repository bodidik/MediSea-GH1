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
/**
 * Panele yapıştırılan değer kirli gelebilir: baştaki/sondaki boşluk, sarmalayan
 * tırnak, `MONGODB_URI=` öneki. 2 Eki 2026'da canlıdaki değer böyleydi ve
 * mongoose "Invalid scheme" ile düşüp Google girişini sessizce kırıyordu.
 * Temizledikten sonra biçim hâlâ yanlışsa DEĞERİ basmadan (içinde parola var)
 * yalnızca şeklini günlüğe yaz.
 */
export function mongoUriTemizle(ham: string): string {
  let s = ham.trim();
  if (s.startsWith('MONGODB_URI=')) s = s.slice('MONGODB_URI='.length).trim();
  while (s.length >= 2 && /^["'`]/.test(s) && s[s.length - 1] === s[0]) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

export async function dbConnect() {
  const ham = process.env.MONGODB_URI;
  if (!ham) throw new Error('MONGODB_URI env değişkeni tanımlı değil');
  const uri = mongoUriTemizle(ham);
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    console.error(
      `[db] MONGODB_URI biçimi bozuk: uzunluk ${ham.length}, ilk karakter kodu ${ham.charCodeAt(0)}, ` +
        `"mongodb" içeriyor: ${ham.includes('mongodb')}`,
    );
    throw new Error('MONGODB_URI biçimi bozuk (mongodb:// ya da mongodb+srv:// ile başlamalı)');
  }

  if (cached && mongoose.connection.readyState === 1) return cached;
  cached = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 10000,
  });
  global._mongooseConn = cached;
  return cached;
}
