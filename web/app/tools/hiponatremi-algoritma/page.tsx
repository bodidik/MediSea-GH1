"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";

/**
 * Hiponatremi tanı algoritması — ESE/ESICM/ERA-EDTA klinik kılavuzu (Spasovski ve ark., Eur J Endocrinol 2014).
 *
 * Basamaklı: bir basamak yanıtlanmadan sonraki SORULMUYOR ve yanıt değişince alttaki yanıtlar
 * sıfırlanıyor — önceki yoldan kalan "idrar Na > 30" gibi bir yanıt, farklı bir dalda sessizce kullanılmasın.
 */
const OSM: Secenek[] = [
  { label: "< 275 mOsm/kg (hipotonik)", pts: 0 },
  { label: "275–295 mOsm/kg (izotonik)", pts: 0 },
  { label: "> 295 mOsm/kg (hipertonik)", pts: 0 },
];
const IDRAR_OSM: Secenek[] = [{ label: "≤ 100 mOsm/kg", pts: 0 }, { label: "> 100 mOsm/kg", pts: 0 }];
const IDRAR_NA: Secenek[] = [{ label: "≤ 30 mmol/L", pts: 0 }, { label: "> 30 mmol/L", pts: 0 }];
const DIURETIK: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];
const HACIM: Secenek[] = [{ label: "Azalmış", pts: 0 }, { label: "Normal (övolemik)", pts: 0 }];

type Sonuc = { baslik: string; nedenler: string; oneri: string };

export default function HiponatremiAlgoritmaPage() {
  const [osm, setOsm] = React.useState<number | null>(null);
  const [uosm, setUosm] = React.useState<number | null>(null);
  const [una, setUna] = React.useState<number | null>(null);
  const [diur, setDiur] = React.useState<number | null>(null);
  const [hacim, setHacim] = React.useState<number | null>(null);

  // Üst basamak değişince alt basamakları sıfırla.
  const secOsm = (v: number | null) => { setOsm(v); setUosm(null); setUna(null); setDiur(null); setHacim(null); };
  const secUosm = (v: number | null) => { setUosm(v); setUna(null); setDiur(null); setHacim(null); };
  const secUna = (v: number | null) => { setUna(v); setDiur(null); setHacim(null); };
  const secDiur = (v: number | null) => { setDiur(v); setHacim(null); };

  let sonuc: Sonuc | null = null;
  if (osm === 2) sonuc = { baslik: "Hipertonik hiponatremi", nedenler: "Hiperglisemi, mannitol, gliserol, radyokontrast.", oneri: "Glukoz yüksekse düzeltilmiş Na'yı hesaplayın; neden düzeltilir, hipotonik hiponatremi gibi tedavi edilmez." };
  else if (osm === 1) sonuc = { baslik: "İzotonik hiponatremi", nedenler: "Psödohiponatremi (ağır hipertrigliseridemi, paraproteinemi), izotonik sıvı birikimi (glisin, sorbitol irrigasyonu).", oneri: "Direkt iyon seçici elektrotla (kan gazı cihazı) Na ölçümü ile doğrulayın." };
  else if (osm === 0 && uosm === 0) sonuc = { baslik: "Hipotonik, idrar osmolalitesi ≤ 100", nedenler: "Aşırı su alımı (primer polidipsi), düşük solüt alımı (bira potomanisi, çay-tost diyeti).", oneri: "Su alımını kısıtlayın, solüt alımını artırın; düzeltme hızını yakından izleyin — su diürezi Na'yı hızla yükseltebilir." };
  else if (osm === 0 && uosm === 1 && una === 0) sonuc = { baslik: "Düşük efektif arteriyel hacim (idrar Na ≤ 30)", nedenler: "Böbrek dışı kayıp (ishal, kusma, üçüncü boşluk), kalp yetmezliği, siroz, nefrotik sendrom.", oneri: "Hipovolemide izotonik sıvı; hipervolemide sıvı ve tuz kısıtlaması, altta yatan hastalığın tedavisi." };
  else if (osm === 0 && uosm === 1 && una === 1 && diur === 1) sonuc = { baslik: "İdrar Na > 30 + diüretik ya da böbrek hastalığı", nedenler: "Diüretik (özellikle tiyazid), kronik böbrek hastalığı — ama SIADH gibi diğer nedenler de olası.", oneri: "Diüretiği kesmeyi değerlendirin; diüretik kesildikten sonra yeniden değerlendirin." };
  else if (osm === 0 && uosm === 1 && una === 1 && diur === 0 && hacim === 0) sonuc = { baslik: "İdrar Na > 30, hacim azalmış", nedenler: "Kusma (bikarbonatüri ile), primer adrenal yetmezlik, böbrek ya da serebral tuz kaybı, gizli diüretik kullanımı.", oneri: "Kortizol ve ACTH; izotonik sıvı ile hacim replasmanı." };
  else if (osm === 0 && uosm === 1 && una === 1 && diur === 0 && hacim === 1) sonuc = { baslik: "İdrar Na > 30, övolemik", nedenler: "SIADH, sekonder adrenal yetmezlik, (ağır) hipotiroidi, gizli diüretik kullanımı.", oneri: "Kortizol ve TSH ile adrenal ve tiroid yetmezliğini dışlayın; SIADH'de sıvı kısıtlaması — Furst oranı için Serbest Su Klirensi aracını kullanın." };

  return (
    <OlcekKabugu
      slug="hiponatremi-algoritma"
      ikon="🧂"
      baslik="Hiponatremi Tanı Algoritması"
      altBaslik="Serum ve İdrar Osmolalitesi · İdrar Na · Hacim Durumu"
      paylasim={{ sonuc: sonuc?.baslik ?? null }}
      not={
        <p>
          Ağır semptomlu hiponatremide (kusma, nöbet, somnolans, koma) algoritma beklenmez: 150 mL %3 NaCl 20 dakikada, hedef ilk saatte 5 mmol/L artış.
          Kronik hiponatremide ilk 24 saatte Na artışı 10 mmol/L'yi (osmotik demiyelinizasyon riski yüksekse 8) geçmemelidir; hız hesabı için Sodyum
          Yönetimi aracını kullanın. İdrar testleri diüretik ya da hipotonik sıvı verilmeden önce alınmalıdır. Spasovski G ve ark., Eur J Endocrinol 2014.
        </p>
      }
    >
      <div className="space-y-3">
        <SecimMaddesi id="osm" baslik="1. Ölçülmüş serum osmolalitesi" secenekler={OSM} secili={osm} onSec={secOsm} rozetGizle />
        {osm === 0 && <SecimMaddesi id="uosm" baslik="2. İdrar osmolalitesi" secenekler={IDRAR_OSM} secili={uosm} onSec={secUosm} rozetGizle />}
        {osm === 0 && uosm === 1 && <SecimMaddesi id="una" baslik="3. İdrar Na (spot)" secenekler={IDRAR_NA} secili={una} onSec={secUna} rozetGizle />}
        {osm === 0 && uosm === 1 && una === 1 && (
          <SecimMaddesi id="diur" baslik="4. Diüretik kullanımı ya da böbrek hastalığı var mı?" secenekler={DIURETIK} secili={diur} onSec={secDiur} rozetGizle />
        )}
        {osm === 0 && uosm === 1 && una === 1 && diur === 0 && (
          <SecimMaddesi id="hacim" baslik="5. Ekstraselüler sıvı hacmi" aciklama="Ortostatik hipotansiyon, taşikardi, mukoza kuruluğu, BUN/kreatinin oranı." secenekler={HACIM} secili={hacim} onSec={setHacim} rozetGizle />
        )}
      </div>

      <SonucDuyuru metin={sonuc ? sonuc.baslik : null} />
      {sonuc ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50 space-y-2">
          <p className="text-xl font-black text-blue-900">{sonuc.baslik}</p>
          <p className="text-[13px] font-bold text-slate-800"><span className="font-black">Olası nedenler: </span>{sonuc.nedenler}</p>
          <p className="text-[13px] font-bold text-slate-800"><span className="font-black">Yaklaşım: </span>{sonuc.oneri}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Sıradaki basamağı yanıtlayın</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
