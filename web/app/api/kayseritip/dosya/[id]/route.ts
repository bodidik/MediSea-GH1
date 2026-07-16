import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Kurum kontrolü
  const session = await auth();
  const institution = (session?.user as any)?.institution;
  const plan = (session?.user as any)?.plan;
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  if (institution !== 'kayseritip' && !isAdmin) {
    return new NextResponse('Yetkisiz', { status: 403 });
  }

  const { id } = await params;

  // Path traversal koruması
  const temizId = path.basename(id);
  const dosyaYolu = path.join(process.cwd(), 'public', 'kayseritip', 'dosyalar', temizId);

  if (!fs.existsSync(dosyaYolu)) {
    return new NextResponse('Dosya bulunamadı', { status: 404 });
  }

  const uzanti = path.extname(temizId).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.pdf':  'application/pdf',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppt':  'application/vnd.ms-powerpoint',
  };
  const mime = mimeMap[uzanti] ?? 'application/octet-stream';

  const dosya = fs.readFileSync(dosyaYolu);

  return new NextResponse(dosya, {
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `inline; filename="${temizId}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
