import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

const SLAYT_JSON = path.join(process.cwd(), 'content', 'kayseritip', 'slaytlar.json');
const DOSYA_DIR  = path.join(process.cwd(), 'public', 'kayseritip', 'dosyalar');

/** Yeni slayt metaverisi ekle */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const { id, baslik, aciklama, ders, ogretim_uyesi, tarih, dosya, tip } = await req.json();
  if (!id || !baslik || !dosya || !tip) {
    return NextResponse.json({ error: 'id, baslik, dosya ve tip zorunludur.' }, { status: 400 });
  }

  const mevcut = JSON.parse(fs.readFileSync(SLAYT_JSON, 'utf-8'));
  if (mevcut.dersler.find((d: any) => d.id === id)) {
    return NextResponse.json({ error: 'Bu id zaten var.' }, { status: 409 });
  }

  mevcut.dersler.push({ id, baslik, aciklama, ders, ogretim_uyesi, tarih, dosya, tip });
  fs.writeFileSync(SLAYT_JSON, JSON.stringify(mevcut, null, 2), 'utf-8');

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** Slayt dosyası yükle (multipart/form-data) */
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Dosya yok' }, { status: 400 });

  const izinliUzantilar = ['.pdf', '.pptx', '.ppt'];
  const uzanti = path.extname(file.name).toLowerCase();
  if (!izinliUzantilar.includes(uzanti)) {
    return NextResponse.json({ error: 'Sadece PDF ve PPTX desteklenir.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const hedef = path.join(DOSYA_DIR, path.basename(file.name));
  fs.writeFileSync(hedef, buffer);

  return NextResponse.json({ ok: true, dosya: path.basename(file.name) });
}
