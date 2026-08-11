// FILE: server/diagnosis/extract/fixtures.js
//
// Altin vakalar: metin + o metinden CIKARILMASI GEREKEN sey.
//
// Bunlar birim testi degil, ISABET OLCUMU icindir (eval.js). Cikarim
// nondeterministiktir; gectigi/kaldigi degil, NE KADAR isabet ettigi olculur.
// Birim testleri sahte tasiyiciyla kisitlarin calistigini dogrular.

export const VIGNETTE_TR = {
  id: 'tr-59e-yorgunluk',
  text: `59 yaşında erkek hasta, birinci basamağa yorgunluk, zaman zaman olan üst
karın ağrısı ve zihinsel bulanıklık yakınmalarıyla başvurdu. Şikâyetleri yaklaşık
2 yıl önce başlamış; o dönemde yapılan değerlendirme sonucunda gastroözofageal
reflü hastalığı tanısı konmuş. Omeprazol başlanmasına rağmen karın ağrısı yalnızca
ara sıra hafiflemiş. Zamanla kabızlık yakınması eklenmiş, yaklaşık iki günde bir
dışkılıyormuş. Son bir yılda yorgunluğu belirgin biçimde artmış; sürekli bir
zihin bulanıklığı tarifliyor. Çok adımlı yönergeleri takip etmekte zorlandığını
ve unutkanlık yaşadığını belirtiyor; hekime başvurmasının asıl nedeni bu olmuş.
Geçmişinde böbrek taşı öyküsü var. Ateş, göğüs ağrısı, kusma ve ishal tariflemiyor.`,

  expect: {
    age: 59,
    sex: 'M',
    durationMonthsRange: [18, 30],

    // Bulunmasi ZORUNLU olanlar
    mustFind: [
      { code: 'fatigue', present: true },
      { code: 'abdominal_pain_upper', present: true },
      { code: 'cognitive_impairment', present: true },
      { code: 'constipation', present: true },
      { code: 'nephrolithiasis_history', present: true },
      // "omeprazole ragmen ancak ara sira hafiflemis" -> GERD'i dislayan bulgu
      { code: 'ppi_trial_failed', present: true },
      // Acik negatifler: "yok" demek "sorulmamis" demek degildir
      { code: 'fever', present: false },
      { code: 'chest_pain', present: false },
      { code: 'vomiting', present: false },
      { code: 'diarrhea', present: false },
    ],

    // Bulunmamasi gerekenler
    mustNotFind: [
      // GERD TANISINDAN semptom turetilmemeli: metin yanma tarif etmiyor
      'heartburn',
      // Muayene yapilmamis; hicbir muayene bulgusu kodlanamaz
      'pallor', 'epigastric_tenderness', 'goiter', 'reduced_vibration_sense',
      // Sorulmamis olanlar "yok" diye yazilmamali
      'weight_loss', 'melena', 'snoring', 'depressed_mood', 'smoking',
    ],

    // Konmus ama dogrulanmamis tani: kayit altina alinir, kanit sayilmaz
    mustPriorDiagnosis: /reflü|gerd/i,
    examNormalSystems: [],
  },
};

export const VIGNETTE_TR_FULL = {
  id: 'tr-59e-tam-not',
  text: `59 yaşında erkek. İki yıldır süren yorgunluk, aralıklı üst karın ağrısı ve
unutkanlık yakınmasıyla başvurdu. İki günde bir dışkılıyor. Ateşi yok, kusma ve
ishal tariflemiyor.

Özgeçmiş: Böbrek taşı öyküsü mevcut. On yıldır hipertansiyon tanısıyla takipli.
Bilinen ülser öyküsü yok.

Kullandığı ilaçlar: Hidroklorotiyazid 25 mg, omeprazol 20 mg. Lityum kullanımı yok.

Soygeçmiş: Ailede kolorektal kanser öyküsü yok. Ailede bilinen paratiroid
hastalığı ya da MEN1 yok.

Alışkanlıklar: Sigara içmiyor, alkol kullanmıyor. Mesleki kurşun maruziyeti tarif
etmiyor; emekli öğretmen.

Fizik muayene: Genel durumu iyi, soluk görünümde değil. Batın muayenesi doğal,
hassasiyet ve organomegali saptanmadı. Nörolojik muayene normal. Cilt muayenesi
olağan. Boyun muayenesinde tiroid palpe edilmedi.`,

  expect: {
    age: 59,
    sex: 'M',
    durationMonthsRange: [18, 30],

    mustFind: [
      { code: 'fatigue', present: true },
      { code: 'abdominal_pain_upper', present: true },
      { code: 'cognitive_impairment', present: true },
      { code: 'constipation', present: true },
      { code: 'nephrolithiasis_history', present: true },
      { code: 'hypertension_history', present: true },
      { code: 'thiazide_use', present: true },
      // Acikca yok denenler
      { code: 'fever', present: false },
      { code: 'vomiting', present: false },
      { code: 'diarrhea', present: false },
      { code: 'peptic_ulcer_history', present: false },
      { code: 'lithium_use', present: false },
      { code: 'family_history_colorectal_ca', present: false },
      { code: 'family_history_men1', present: false },
      { code: 'smoking', present: false },
      { code: 'alcohol_heavy', present: false },
      { code: 'occupational_lead_exposure', present: false },
      { code: 'pallor', present: false },
    ],

    mustNotFind: ['heartburn', 'melena', 'snoring'],
    mustPriorDiagnosis: null,
    // Muayenesi yapilip normal bulunan sistemler
    examNormalSystems: ['abdomen', 'neuro', 'skin', 'neck'],
  },
};

export const FIXTURES = [VIGNETTE_TR, VIGNETTE_TR_FULL];
