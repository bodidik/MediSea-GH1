"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/(ydus)/context/UserContext";
import { xpKimligi } from "@/app/lib/xp";

/**
 * BU KONUDAKİ İLERLEMEN — konu sayfası modülleri listeliyordu (soru · kart ·
 * vaka) ama kullanıcının ne kadarını bitirdiğini söylemiyordu. Veri tarayıcıda
 * zaten vardı:
 *   - soru: ödenmiş kazanımlar `soru:<quiz iç kimliği>:<soru>` (app/lib/xp.ts)
 *   - kart: `medisea:kartlar:v1:<deste iç kimliği>` → bilinen kart kimlikleri
 *   - vaka: `vaka:<branş>/<vaka dosya adı>`
 *
 * Kimlikler SUNUCUDAN gelir: quiz ve deste depoda dosya adıyla değil İÇ
 * kimlikle (`veri.id`) saklanıyor — dosya adıyla aramak her zaman 0 verirdi
 * (aynı tuzak "Kaldığın yerden devam" kartında 404 olarak ölçüldü).
 *
 * Soru sayacı "ilk kez DOĞRU cevaplanan" soruları sayar (XP kuralıyla aynı);
 * yanlış cevaplanan soru burada sayılmaz, bu yüzden etiket "doğru".
 */
type Props = {
  branch: string;
  quizId: string | null;
  soruSayisi: number;
  desteler: { id: string; sayi: number }[];
  vakaIdler: string[];
};

export default function KonuIlerleme({ branch, quizId, soruSayisi, desteler, vakaIdler }: Props) {
  const { kazanimlar } = useUser();
  const [bilinenKart, setBilinenKart] = useState<number | null>(null);

  useEffect(() => {
    let toplam = 0;
    for (const d of desteler) {
      try {
        const v = JSON.parse(localStorage.getItem(`medisea:kartlar:v1:${d.id}`) || "[]");
        if (Array.isArray(v)) toplam += Math.min(new Set(v).size, d.sayi);
      } catch {}
    }
    setBilinenKart(toplam);
  }, [desteler]);

  if (bilinenKart === null) return null;

  const onek = quizId ? `soru:${quizId}:` : null;
  const dogru = onek ? Math.min(kazanimlar.filter((k) => k.startsWith(onek)).length, soruSayisi) : 0;
  const kartToplam = desteler.reduce((t, d) => t + d.sayi, 0);
  const vakaBitti = vakaIdler.filter((v) => kazanimlar.includes(xpKimligi.vaka(branch, v))).length;

  const satirlar = [
    quizId && soruSayisi > 0 && { etiket: "📝 Soru", deger: dogru, toplam: soruSayisi, ek: "doğru" },
    kartToplam > 0 && { etiket: "🃏 Kart", deger: bilinenKart, toplam: kartToplam, ek: "biliniyor" },
    vakaIdler.length > 0 && { etiket: "🏥 Vaka", deger: vakaBitti, toplam: vakaIdler.length, ek: "bitti" },
  ].filter(Boolean) as { etiket: string; deger: number; toplam: number; ek: string }[];
  if (!satirlar.length) return null;

  const hic = satirlar.every((s) => s.deger === 0);
  const tamam = satirlar.every((s) => s.deger >= s.toplam);

  return (
    <section
      aria-label="Bu konudaki ilerlemen"
      style={{
        maxWidth: "1100px", margin: "0 auto 12px", padding: "12px 16px",
        background: "#fff", border: "0.5px solid #d0e4f5", borderRadius: "12px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <p style={{ fontSize: "12px", fontWeight: 700, color: "#1a3a6b", margin: "0 0 8px" }}>
        {tamam ? "Bu konuyu bitirdin 🎉" : hic ? "Bu konuya henüz başlamadın" : "Bu konudaki ilerlemen"}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px" }}>
        {satirlar.map((s) => {
          const yuzde = Math.round((Math.min(s.deger, s.toplam) / s.toplam) * 100);
          return (
            <div key={s.etiket} style={{ flex: "1 1 150px", minWidth: 0 }}>
              <div style={{ fontSize: "12px", color: "#334155", display: "flex", justifyContent: "space-between", gap: "8px" }}>
                <span>{s.etiket}</span>
                <span style={{ fontWeight: 700 }}>{s.deger}/{s.toplam} {s.ek}</span>
              </div>
              <div aria-hidden="true" style={{ height: "6px", background: "#eef4fb", borderRadius: "999px", marginTop: "4px", overflow: "hidden" }}>
                <div style={{ width: `${yuzde}%`, height: "100%", background: yuzde >= 100 ? "#15803d" : "#2563eb", borderRadius: "999px" }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
