import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/db';
import ContentAccess from '@/lib/models/ContentAccess';
import fs from 'fs';
import path from 'path';

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

/** Tüm branch'lardaki topic listesini JSON dosyalarından çek */
function topikListele() {
  const branchDir = path.join(process.cwd(), 'content', 'premium', 'ydus', 'branches');
  const topics: { id: string; baslik: string; branch: string }[] = [];
  try {
    for (const file of fs.readdirSync(branchDir)) {
      if (!file.endsWith('.json')) continue;
      const branch = JSON.parse(fs.readFileSync(path.join(branchDir, file), 'utf-8'));
      for (const kat of branch.kategoriler ?? []) {
        for (const konu of kat.konular ?? []) {
          topics.push({ id: konu.id, baslik: konu.baslik, branch: branch.meta.id });
        }
      }
    }
  } catch {}
  return topics;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  await dbConnect();
  const overrides = await ContentAccess.find({}).lean();
  const overrideMap: Record<string, string> = {};
  for (const o of overrides) overrideMap[o.topicId] = o.accessLevel;

  const topics = topikListele().map(t => ({
    ...t,
    accessLevel: overrideMap[t.id] ?? 'P',
  }));

  return NextResponse.json({ topics });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const { topicId, accessLevel } = await req.json();
  if (!['V', 'M', 'P'].includes(accessLevel)) {
    return NextResponse.json({ error: 'Geçersiz seviye' }, { status: 400 });
  }

  await dbConnect();
  await ContentAccess.findOneAndUpdate(
    { topicId },
    { accessLevel, updatedBy: session!.user!.email },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true });
}
