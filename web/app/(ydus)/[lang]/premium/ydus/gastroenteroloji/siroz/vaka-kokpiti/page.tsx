'use client';
import SimulatorEngine, { SimData } from '../../../../components/SimulatorEngine';
// Not: import yolunu kendi klasör derinliğine göre '../components/SimulatorEngine' vb. olarak ayarla

const DKA_CASE_DATA: SimData = {
  id: "dka_vaka_1",
  title: "DKA Resüsitasyon Kokpiti",
  topic: "Board Simülasyonu",
  badgeId: "dka_kaptani", // Profil sayfasında bu rozeti verecek
  returnUrl: "/tr/premium/ydus/profil",
  initialStepId: "step_1",
  steps: {
    // 1. ADIM: SENARYO
    "step_1": {
      id: "step_1",
      type: "scenario",
      title: "Tedaviye nasıl başlamalısınız?",
      content: "<strong class='text-purple-400'>VAKA:</strong> 19 yaşında Tip 1 DM hastası, bulantı, kusma ve karın ağrısı ile getirildi.",
      clinicalData: "Glukoz: 450 mg/dL | pH: 7.12 | HCO3: 10 mEq/L | K: 3.2 mEq/L",
      options: [
        { id: "opt_a", text: "Hemen 0.1 U/kg/saat İnsülin İnfüzyonu Başlamak 💉", nextStepId: "step_2_fail" },
        { id: "opt_b", text: "IV Sıvı ve Potasyum Replasmanı Başlamak, İnsülini Bekletmek 💧", nextStepId: "step_2_success", xpAward: 30 }
      ]
    },
    // 2. ADIM: DOĞRU KARAR (Potasyum Yönetimi)
    "step_2_success": {
      id: "step_2_success",
      type: "success",
      title: "Hayati Karar!",
      content: "Potasyum <strong>3.3 mEq/L'nin altındayken</strong> asla insülin başlanmaz! İnsülin hücre içine K+ girişini tetikleyerek ölümcül hipokalemiye ve aritmiye yol açabilir. Önce K+ replasmanı!",
      nextStepId: "step_3_finish",
      buttonText: "Vakayı Tamamla ➡️"
    },
    // HATA: İYATROJENİK KARDİYAK ARREST
    "step_2_fail": {
      id: "step_2_fail",
      type: "fatal_error",
      content: "Düşük potasyumlu hastada insülin başladınız. Hastada ani kardiyak arrest gelişti. Unutmayın: <strong>\"Potasyum görmeden insülin verme!\"</strong>",
      buttonText: "Hatanızdan Öğrenip Tekrar Deneyin 🔄"
    },
    // FİNAL ADIMI
    "step_3_finish": {
      id: "step_3_finish",
      type: "finish",
      title: "Tebrikler Uzman!",
      content: "Potasyumu güvenli sınıra çektiniz, resüsitasyonu başarıyla tamamladınız. Anyon açığı kapandı."
    }
  }
};

export default function DkaSimulatorPage() {
  return <SimulatorEngine data={DKA_CASE_DATA} />;
}