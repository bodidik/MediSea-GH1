import { NextRequest, NextResponse } from 'next/server';
import { yoneticiEpostasiMi } from "@/lib/yonetici";
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const FILE = path.join(process.cwd(), 'content', 'kayseritip', 'duyurular.json');

function isAdmin(session: any) {
  return yoneticiEpostasiMi(session?.user?.email);
}

/**
 * Okuma hatasını BOŞ LİSTEYE çevirmek veri kaybettirir: POST/DELETE/PATCH
 * üçü de oku-değiştir-yaz yapıyor, yani dosya bir kez okunamadığında
 * üzerine yalnızca yeni kayıt yazılıp ÖNCEKİ BÜTÜN DUYURULAR siliniyordu.
 *
 * Ayrım şart: dosyanın HİÇ OLMAMASI meşru bir boş başlangıçtır, ama VAR olup
 * okunamaması "bilmiyoruz" demektir ve bilmezken yazmak olmaz.
 */
function oku(): { duyurular: any[] } | null {
  if (!fs.existsSync(FILE)) return { duyurular: [] };
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    return Array.isArray(j?.duyurular) ? j : null;
  } catch { return null; }
}

/** Okunamayan dosyanın üstüne yazmaktansa dürüstçe reddet. */
function okunamadi() {
  return NextResponse.json(
    { error: 'Duyuru dosyası okunamadı; üzerine yazılmadı.' },
    { status: 500 }
  );
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const veri = oku();
  if (!veri) return okunamadi();
  return NextResponse.json(veri);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const { baslik, icerik, tur, sabitli } = await req.json();
  if (!baslik || !icerik) return NextResponse.json({ error: 'baslik ve icerik zorunlu' }, { status: 400 });

  const mevcut = oku();
  if (!mevcut) return okunamadi();
  const yeni = {
    id: randomUUID().slice(0, 8),
    baslik,
    icerik,
    tur: tur ?? 'bilgi',
    sabitli: sabitli ?? false,
    tarih: new Date().toISOString(),
    yayinda: true,
  };
  mevcut.duyurular = [yeni, ...mevcut.duyurular];
  fs.writeFileSync(FILE, JSON.stringify(mevcut, null, 2), 'utf-8');
  return NextResponse.json({ ok: true, duyuru: yeni }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const { id } = await req.json();
  const mevcut = oku();
  if (!mevcut) return okunamadi();
  mevcut.duyurular = mevcut.duyurular.filter((d: any) => d.id !== id);
  fs.writeFileSync(FILE, JSON.stringify(mevcut, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const { id, ...guncelle } = await req.json();
  const mevcut = oku();
  if (!mevcut) return okunamadi();
  mevcut.duyurular = mevcut.duyurular.map((d: any) =>
    d.id === id ? { ...d, ...guncelle } : d
  );
  fs.writeFileSync(FILE, JSON.stringify(mevcut, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}
