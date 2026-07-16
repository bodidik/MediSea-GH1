import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const FILE = path.join(process.cwd(), 'content', 'kayseritip', 'duyurular.json');

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

function oku() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')); }
  catch { return { duyurular: [] }; }
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  return NextResponse.json(oku());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const { baslik, icerik, tur, sabitli } = await req.json();
  if (!baslik || !icerik) return NextResponse.json({ error: 'baslik ve icerik zorunlu' }, { status: 400 });

  const mevcut = oku();
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
  mevcut.duyurular = mevcut.duyurular.filter((d: any) => d.id !== id);
  fs.writeFileSync(FILE, JSON.stringify(mevcut, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const { id, ...guncelle } = await req.json();
  const mevcut = oku();
  mevcut.duyurular = mevcut.duyurular.map((d: any) =>
    d.id === id ? { ...d, ...guncelle } : d
  );
  fs.writeFileSync(FILE, JSON.stringify(mevcut, null, 2), 'utf-8');
  return NextResponse.json({ ok: true });
}
