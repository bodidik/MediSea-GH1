// C:\Users\hucig\Medknowledge\web\app\api\branch-counts\route.ts
//
// Branş başına konu sayısı. Çalışma Alanım'daki kapsama görünümü buradan
// beslenir — o sayfa istemci bileşeni olduğu için dosya sistemine erişemez.
//
// Not: Buradaki veri herkese açık içerik sayımıdır, kullanıcıya özel bir şey
// içermez; oturum gerektirmez ve arka uca bağımlı değildir.

import { NextResponse } from "next/server";
import { getTopicCounts } from "@/app/lib/topic-counts";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ counts: getTopicCounts() });
}
