import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params; // "videos" | "notes" vb.
    // TODO: mevcut içeriğini buraya taşı
    return NextResponse.json({ ok: true, type });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
