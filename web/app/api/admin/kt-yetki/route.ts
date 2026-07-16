import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/db';
import KtYetki from '@/lib/models/KtYetki';

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  await dbConnect();
  const liste = await KtYetki.find({}).lean();
  return NextResponse.json({ liste });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });

  const { email, rol, alanlar, notlar } = await req.json();
  if (!email || !rol) return NextResponse.json({ error: 'email ve rol zorunlu' }, { status: 400 });

  await dbConnect();
  const yetki = await KtYetki.findOneAndUpdate(
    { email: email.toLowerCase() },
    { rol, alanlar: alanlar ?? [], notlar: notlar ?? '', updatedBy: session!.user!.email },
    { upsert: true, new: true }
  );
  return NextResponse.json({ ok: true, yetki });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  const { email } = await req.json();
  await dbConnect();
  await KtYetki.deleteOne({ email: email.toLowerCase() });
  return NextResponse.json({ ok: true });
}
