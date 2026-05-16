import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// SADECE YAZMA (PUT) İŞLEMİ İÇİN
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    
    // Canonical klasöründeki tüm branşları tarayıp dosyayı bulacağız
    const baseDir = path.join(process.cwd(), "content", "canonical");
    const branches = fs.readdirSync(baseDir);
    let foundPath = null;

    for (const branch of branches) {
      const checkPath = path.join(baseDir, branch, `${slug}.json`);
      if (fs.existsSync(checkPath)) {
        foundPath = checkPath;
        break;
      }
    }

    if (!foundPath) {
      return NextResponse.json({ ok: false, error: "Dosya bulunamadı" }, { status: 404 });
    }

    // 1. Mevcut dosyayı oku
    const existingData = JSON.parse(fs.readFileSync(foundPath, "utf-8"));

    // 2. Gelen verilerle güncelle (Özet veya Seksiyonlar)
    if (body.summary !== undefined) {
      existingData.summary = body.summary;
    }
    
    // Eğer bloklar güncelleniyorsa (JSON'daki heading/text yapısına geri çevirerek kaydediyoruz)
    if (body.sections !== undefined) {
      existingData.sections = body.sections.map((s: any) => ({
        heading: s.title,
        text: s.html,
        visibility: s.visibility || "V"
      }));
    }

    // Güncelleme tarihini at
    if (!existingData.meta) existingData.meta = {};
    existingData.meta.updatedAt = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });

    // 3. Dosyaya geri yaz
    fs.writeFileSync(foundPath, JSON.stringify(existingData, null, 2), "utf-8");

    return NextResponse.json({ ok: true, message: "Başarıyla kaydedildi" });

  } catch (error: any) {
    console.error("Kayıt Hatası:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}