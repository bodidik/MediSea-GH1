import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1) Token: Bearer / ?secret= / x-revalidate-token
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  const qs = new URL(req.url).searchParams.get("secret") || "";
  const alt = req.headers.get("x-revalidate-token") || "";
  const token = bearer || qs || alt;

  if (!process.env.REVALIDATE_SECRET || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2) Body: { paths?: string[], tags?: string[] }
  let body: { paths?: string[]; tags?: string[] } = {};
  try { body = await req.json(); } catch {}

  const paths = Array.isArray(body.paths) ? body.paths : [];
  const tags  = Array.isArray(body.tags)  ? body.tags  : [];

  // 3) Revalidate
  try {
    const jobs: Promise<any>[] = [];
    // @ts-ignore - Next provides these in route handlers
    const rp = (global as any).revalidatePath;
    // @ts-ignore
    const rt = (global as any).revalidateTag;

    for (const p of paths) if (rp) jobs.push(rp(p));
    for (const t of tags)  if (rt) jobs.push(rt(t));
    await Promise.all(jobs);

    return NextResponse.json({ ok: true, paths, tags });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
