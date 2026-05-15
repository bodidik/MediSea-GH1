'use client';
import SimulatorEngine, { SimData } from '../../components/SimulatorEngine';

// 1 MİLYON DOLARLIK VERİ YAPISI (Bunu ileride veritabanından da çekebilirsin)
const LUPUS_CASE_DATA: SimData = {
  id: "lupus_vaka_1",
  title: "Lupus Nefriti Kokpiti",
  topic: "Klinik Simülasyon",
  badgeId: "lupus_fatihi",
  returnUrl: "/tr/premium/ydus/profil", // Bitince profile atsın ki rozetini görsün
  initialStepId: "step_1",
  steps: {
    // 1. ADIM: KARŞILAMA
    "step_1": {
      id: "step_1",
      type: "scenario",
      title: "Bu aşamada ilk önceliğiniz ne olmalıdır?",
      content: "<strong class='text-blue-400'>VAKA:</strong> 28 yaşında kadın hasta, bilinen SLE tanısı mevcut. Son 1 haftadır bacaklarda ödem ve idrarda köpürme şikayetiyle başvuruyor.",
      clinicalData: "TA: 150/95 mmHg | Protein/Kreatinin: 3.5 g/g | Eritrosit Silindirleri (+)",
      options: [
        { id: "opt_a", text: "Renal Biyopsi Planlamak 💉", nextStepId: "step_2_success", xpAward: 20 },
        { id: "opt_b", text: "Direkt Yüksek Doz Steroid Başlamak", nextStepId: "step_2_fail" },
        { id: "opt_c", text: "Sadece ACE İnhibitörü ile Takip Etmek", nextStepId: "step_2_fail" }
      ]
    },
    // 2. ADIM: BAŞARI GERİ BİLDİRİMİ
    "step_2_success": {
      id: "step_2_success",
      type: "success",
      title: "Mükemmel Karar!",
      content: "SLE hastasında yeni gelişen proteinüri veya aktif idrar sedimi durumunda <strong>Renal Biyopsi</strong> altın standarttır.",
      nextStepId: "step_3_finish",
      buttonText: "Vakayı Sonuçlandır ➡️"
    },
    // HATA DURUMU
    "step_2_fail": {
      id: "step_2_fail",
      type: "fatal_error",
      content: "Biyopsi sonucu olmadan ağır immünsüpresif tedavi başlamak veya vakayı hafife almak hastada <strong>geri dönüşsüz renal hasara</strong> yol açabilir."
    },
    // FİNAL ADIMI
    "step_3_finish": {
      id: "step_3_finish",
      type: "finish",
      content: "Lupus Nefriti Sınıf IV (Diffüz Proliferatif) tanısı konuldu. <br/><br/>İndüksiyon tedavisi planlanıyor. Tebrikler uzman!"
    }
  }
};

export default function LupusSimulatorPage() {
  return <SimulatorEngine data={LUPUS_CASE_DATA} />;
}