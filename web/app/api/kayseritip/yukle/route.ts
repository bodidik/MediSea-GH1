import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ktKullaniciAl, yuklemeyeYetkili } from '@/lib/ktYetki';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const SLAYT_JSON = path.join(process.cwd(), 'content', 'kayseritip', 'slaytlar.json');

/**
 * Dosyanın HİÇ OLMAMASI meşru bir ilk çalıştırmadır; VAR olup okunamaması
 * "bilmiyoruz" demektir ve bilmezken üzerine yazılmaz.
 */
function slaytIndeksiniOku(): { dersler?: unknown[]; dosyalar?: unknown[] } | null {
  if (!fs.existsSync(SLAYT_JSON)) return { dersler: [], dosyalar: [] };
  try {
    const j = JSON.parse(fs.readFileSync(SLAYT_JSON, 'utf-8'));
    return j && typeof j === 'object' ? j : null;
  } catch { return null; }
}
const DOSYA_DIR  = path.join(process.cwd(), 'public', 'kayseritip', 'dosyalar');

export async function POST(req: NextRequest) {
  const session = await auth();
  const user = session?.user as any;
  const kt = await ktKullaniciAl();

  if (!kt) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const formData  = await req.formData();
  const file      = formData.get('file')    as File   | null;
  const stajId    = formData.get('stajId')  as string | null;
  const alanId    = formData.get('alanId')  as string | null;
  const baslik    = formData.get('baslik')  as string | null;
  const aciklama  = formData.get('aciklama') as string | null;

  if (!file || !stajId || !alanId || !baslik) {
    return NextResponse.json({ error: 'Eksik alan.' }, { status: 400 });
  }

  if (!yuklemeyeYetkili(kt, stajId, alanId)) {
    return NextResponse.json({ error: 'Bu alana yükleme yetkiniz yok.' }, { status: 403 });
  }

  const izinliUzantilar = ['.pdf', '.pptx', '.ppt', '.doc', '.docx'];
  const uzanti = path.extname(file.name).toLowerCase();
  if (!izinliUzantilar.includes(uzanti)) {
    return NextResponse.json({ error: 'Desteklenmeyen dosya türü.' }, { status: 400 });
  }

  // Benzersiz dosya adı — orijinal isim + uuid prefix
  const guvenliAd = `${randomUUID().slice(0, 8)}-${path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const hedef = path.join(DOSYA_DIR, guvenliAd);

  /**
   * İndeks dosyayı DİSKE YAZMADAN ÖNCE okunuyor. Sıra bir dönem tersti ve
   * iki kusur üretiyordu:
   *
   *   - İndeks okunamazsa istek 500 veriyor AMA yüklenen dosya diskte
   *     kalıyordu: arayüzden görünmeyen, kimsenin silmediği öksüz dosya.
   *     Kullanıcı da yüklemenin başarısız olduğunu sanıyordu.
   *   - Okuma korumasızdı; SLAYT_JSON henüz yoksa (ilk yükleme) readFileSync
   *     fırlatıyor ve yükleme HİÇ çalışmıyordu.
   */
  const mevcut = slaytIndeksiniOku();
  if (!mevcut) {
    return NextResponse.json(
      { error: 'Slayt dizini okunamadı; dosya yüklenmedi.' },
      { status: 500 }
    );
  }

  if (!fs.existsSync(DOSYA_DIR)) fs.mkdirSync(DOSYA_DIR, { recursive: true });
  fs.writeFileSync(hedef, Buffer.from(await file.arrayBuffer()));

  const tip = uzanti === '.pdf' ? 'pdf' : uzanti.startsWith('.ppt') ? 'pptx' : 'diger';

  const yeniDosya = {
    id:          randomUUID(),
    stajId,
    alanId,
    baslik,
    aciklama:    aciklama ?? '',
    yukleyenAd:  user.name ?? 'Anonim',
    yukleyenEmail: user.email,
    tarih:       new Date().toISOString(),
    dosya:       guvenliAd,
    tip,
  };

  mevcut.dosyalar = [yeniDosya, ...(mevcut.dosyalar ?? [])];
  fs.writeFileSync(SLAYT_JSON, JSON.stringify(mevcut, null, 2), 'utf-8');

  return NextResponse.json({ ok: true, dosya: yeniDosya }, { status: 201 });
}
