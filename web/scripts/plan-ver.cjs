#!/usr/bin/env node
/**
 * Bir kullanıcının üyelik planını değiştirir.
 *
 * İnşaat aşamasında premium içeriği görebilmek için tasarlandı: siteden normal
 * şekilde kayıt ol, sonra bu betikle kendi hesabını premium'a yükselt. Böylece
 * canlı siteye "herkesin bildiği geçici parola" gibi kalıcı bir arka kapı
 * açmamış oluyoruz — yetki gerçek hesapta durur, geri almak da tek komut.
 *
 * Kullanım (web/ dizininden):
 *   node scripts/plan-ver.cjs --liste
 *   node scripts/plan-ver.cjs ornek@eposta.com premium
 *   node scripts/plan-ver.cjs ornek@eposta.com free
 *
 * Bağlantı dizesi web/.env.local içindeki MONGODB_URI'den okunur; parametre
 * olarak geçirilmez ki komut geçmişine sır düşmesin.
 */
const path = require('path');
// Yol betiğin kendi konumuna göre çözülüyor: hangi dizinden çağrılırsa
// çağrılsın .env.local'i bulur. Aksi halde depo kökünden çalıştırınca
// "MONGODB_URI yok" der ve sebebi anlaşılmaz görünür.
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');

const GECERLI_PLANLAR = ['free', 'member', 'premium'];

async function main() {
  const [arg1, arg2] = process.argv.slice(2);

  if (!arg1) {
    console.log('Kullanım:\n  node scripts/plan-ver.cjs --liste\n  node scripts/plan-ver.cjs <e-posta> <free|member|premium>');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI bulunamadı. web/.env.local dosyasının yerinde olduğundan emin ol.');
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
  const users = mongoose.connection.collection('users');

  try {
    if (arg1 === '--liste') {
      const hepsi = await users
        .find({}, { projection: { email: 1, plan: 1, name: 1, _id: 0 } })
        .toArray();
      if (hepsi.length === 0) {
        console.log('Hiç kullanıcı yok. Önce siteden kayıt ol: /kayit');
        return;
      }
      console.log(`${hepsi.length} kullanıcı:`);
      for (const u of hepsi) {
        console.log(`  ${u.plan.padEnd(8)} ${u.email}${u.name ? '  (' + u.name + ')' : ''}`);
      }
      return;
    }

    const eposta = arg1.toLowerCase().trim();
    const plan = arg2;

    if (!GECERLI_PLANLAR.includes(plan)) {
      console.error(`Geçersiz plan: ${plan ?? '(verilmedi)'}. Şunlardan biri olmalı: ${GECERLI_PLANLAR.join(', ')}`);
      process.exit(1);
    }

    const mevcut = await users.findOne({ email: eposta }, { projection: { plan: 1, _id: 0 } });
    if (!mevcut) {
      console.error(`${eposta} adresiyle kayıtlı kullanıcı yok. Önce siteden kayıt ol, sonra tekrar dene.`);
      console.error('Mevcut hesapları görmek için: node scripts/plan-ver.cjs --liste');
      process.exit(1);
    }

    if (mevcut.plan === plan) {
      console.log(`${eposta} zaten "${plan}" planında. Değişiklik yapılmadı.`);
      return;
    }

    await users.updateOne({ email: eposta }, { $set: { plan, updatedAt: new Date() } });
    console.log(`${eposta}: ${mevcut.plan} → ${plan}`);
    console.log('\nÖNEMLİ: Plan oturum açarken JWT\'ye yazılıyor. Açık oturumun varsa');
    console.log('çıkış yapıp tekrar giriş yapmadan yeni plan geçerli olmaz.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error('Hata:', err.message);
  process.exit(1);
});
