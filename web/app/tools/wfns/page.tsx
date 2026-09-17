"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * WFNS subaraknoid kanama derecelendirmesi (Teasdale ve ark., J Neurosurg 1988).
 * Glasgow Koma Skalası + motor defisit.
 *
 * GKS 15 ile motor defisit bileşimi ÖZGÜN TABLODA YOK. Araç onu sessizce I ya da II'ye
 * yuvarlamıyor; "tanımsız" diyor.
 */
const GKS_E: Secenek[] = [
  { label: "Açmıyor", pts: 1 }, { label: "Acıyla", pts: 2 }, { label: "Sesle", pts: 3 }, { label: "Kendiliğinden", pts: 4 },
];
const GKS_V: Secenek[] = [
  { label: "Yanıt yok", pts: 1 }, { label: "Anlamsız sesler", pts: 2 }, { label: "Uygunsuz sözcükler", pts: 3 },
  { label: "Konfüze", pts: 4 }, { label: "Oryante", pts: 5 },
];
const GKS_M: Secenek[] = [
  { label: "Yanıt yok", pts: 1 }, { label: "Ekstansiyon", pts: 2 }, { label: "Anormal fleksiyon", pts: 3 },
  { label: "Çekme", pts: 4 }, { label: "Lokalize ediyor", pts: 5 }, { label: "Emirlere uyuyor", pts: 6 },
];
const DEFISIT: Secenek[] = [
  { label: "Yok", pts: 0 },
  { label: "Var (hemiparezi, afazi)", pts: 1 },
];

const BANTLAR: Bant[] = [
  { aralik: "GKS 15 · defisit yok", etiket: "Derece I", alt: "İyi klinik derece.", renk: "emerald" },
  { aralik: "GKS 13–14 · defisit yok", etiket: "Derece II", alt: "İyi klinik derece.", renk: "emerald" },
  { aralik: "GKS 13–14 · defisit var", etiket: "Derece III", alt: "Orta klinik derece.", renk: "amber" },
  { aralik: "GKS 7–12", etiket: "Derece IV", alt: "Kötü klinik derece (defisitten bağımsız).", renk: "rose" },
  { aralik: "GKS 3–6", etiket: "Derece V", alt: "Kötü klinik derece (defisitten bağımsız).", renk: "rose" },
];

function dereceBul(gks: number, defisit: boolean): { sira: number; bant: Bant } | "tanimsiz" {
  if (gks <= 6) return { sira: 5, bant: BANTLAR[4] };
  if (gks <= 12) return { sira: 4, bant: BANTLAR[3] };
  if (gks <= 14) return defisit ? { sira: 3, bant: BANTLAR[2] } : { sira: 2, bant: BANTLAR[1] };
  return defisit ? "tanimsiz" : { sira: 1, bant: BANTLAR[0] };
}

export default function WfnsPage() {
  const [e, setE] = React.useState<number | null>(null);
  const [v, setV] = React.useState<number | null>(null);
  const [m, setM] = React.useState<number | null>(null);
  const [d, setD] = React.useState<number | null>(null);

  const gks = e !== null && v !== null && m !== null ? GKS_E[e].pts + GKS_V[v].pts + GKS_M[m].pts : null;
  const sonuc = gks !== null && d !== null ? dereceBul(gks, d === 1) : null;
  const eksik = [e, v, m].filter((x) => x === null).length + (d === null ? 1 : 0);

  return (
    <OlcekKabugu
      slug="wfns"
      ikon="🧠"
      baslik="WFNS SAK Derecesi"
      altBaslik="World Federation of Neurosurgical Societies · GKS + Motor Defisit"
      paylasim={{ gks, defisit: d }}
      not={
        <p>
          Değerlendirme resüsitasyondan sonra yapılır; sedasyon, nöbet sonrası dönem ve hidrosefali GKS'yi geçici olarak düşürür. Derece I–III
          "iyi", IV–V "kötü klinik derece" olarak gruplanır. GKS 15 ile motor defisit bileşimi özgün sınıflamada tanımlı değildir.
          Teasdale GM ve ark., J Neurosurg 1988.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="gks-e" baslik="GKS — Göz açma (E)" secenekler={GKS_E} secili={e} onSec={setE} />
        <SecimMaddesi id="gks-v" baslik="GKS — Sözel yanıt (V)" secenekler={GKS_V} secili={v} onSec={setV} />
        <SecimMaddesi id="gks-m" baslik="GKS — Motor yanıt (M)" secenekler={GKS_M} secili={m} onSec={setM} />
        <SecimMaddesi id="defisit" baslik="Majör fokal motor defisit" aciklama="Hemiparezi ya da afazi." secenekler={DEFISIT} secili={d} onSec={setD} rozetGizle />
      </div>

      {sonuc === "tanimsiz" && (
        <div role="alert" className="p-6 rounded-[2rem] border-2 border-dashed border-amber-200 bg-amber-50 space-y-1">
          <p className="text-lg font-black text-amber-900">GKS 15 + motor defisit: WFNS'te tanımlı değil</p>
          <p className="text-[12px] text-amber-900">Özgün sınıflama bu bileşimi içermiyor; derece uydurulmadı. Hunt-Hess ile birlikte değerlendirin.</p>
        </div>
      )}
      {/* Panel KOŞULSUZ basılıyor: içindeki canlı bölge (role=status) DOM'dan çıkarsa
          tanımsız durumdan dönüşte ilk duyuru kaçar. */}
      <SkorPaneli
        skor={sonuc && sonuc !== "tanimsiz" ? sonuc.sira : null}
        payda={5}
        skorBasligi="DERECE"
        bantlar={BANTLAR}
        aktif={sonuc && sonuc !== "tanimsiz" ? sonuc.bant : null}
        eksikMetni={sonuc === "tanimsiz" ? "Derece tanımlı değil" : `${eksik} alan yanıtlanmadı`}
        ek={gks !== null ? <p className="text-[11px] font-bold text-slate-700">GKS {gks} (E{GKS_E[e!].pts} V{GKS_V[v!].pts} M{GKS_M[m!].pts})</p> : null}
      />
    </OlcekKabugu>
  );
}
