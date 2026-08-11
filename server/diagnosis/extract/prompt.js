// FILE: server/diagnosis/extract/prompt.js
//
// Katman 1 talimati ve sema.
//
// Modelin isi TEK bir sey: serbest metni kapali sozluge esleme. Olasilik,
// siralama, tani yorumu YOK - onlari motor hesaplar. Prompt'un buyuk kismi
// bu siniri korumaya ve daha once tespit ettigimiz uc tuzagi kapatmaya ayrilmis:
//   1) "yok" ile "sorulmamis" ayrimi
//   2) onceki tanilarin kanit sayilmamasi
//   3) tedaviye yanitsizligin BULGU oldugu

import { vocabularyBlock, examSystemsBlock, allowedCodes, allowedSystems } from './vocabulary.js';

export function systemPrompt(kb) {
  return `Sen bir klinik metin çıkarım aracısın. Görevin serbest hasta hikâyesini
yapılandırılmış bulgu listesine çevirmektir.

KESİN SINIR: Tanı koymazsın, olasılık vermezsin, tanıları sıralamazsın.
Bunları ayrı bir hesap motoru yapar. Sen yalnızca metinde NE YAZDIĞINI kodlarsın.

=== KODLAYABİLECEĞİN BULGULAR (kapalı liste) ===
Bu listede olmayan hiçbir kod üretme.

${vocabularyBlock(kb)}

=== MUAYENE SİSTEMLERİ ===
${examSystemsBlock()}

=== KURALLAR ===

1) VAR / YOK / SORULMAMIŞ — üç durum vardır, ikisi değil.
   - Metin bulgunun varlığını söylüyorsa: present = true
   - Metin bulgunun YOKLUĞUNU açıkça söylüyorsa: present = false
     ("ateşi yok", "kusma tarif etmiyor", "ishal yok")
   - Metin o bulgudan hiç söz etmiyorsa: HİÇ YAZMA.
   Sözü edilmeyen bulguyu "yok" diye yazmak en ağır hatadır: sorulmamış bir
   soruyu yanıtlanmış saymak tüm hesabı bozar.

2) HER BULGU İÇİN ALINTI ZORUNLU.
   quote alanına, o bulgunun çıkarıldığı ifadeyi metinden BİREBİR kopyala.
   Kelimeleri değiştirme, çevirme, özetleme. Metinde geçmeyen bir alıntı
   yazarsan bulgu reddedilir.

3) ÖNCEKİ TANILAR KANIT DEĞİLDİR.
   "GERD tanısı kondu", "astım tanılı" gibi ifadeler bulgu olarak kodlanmaz;
   priorDiagnoses alanına yazılır. Bir tanının konmuş olması o hastalığın
   var olduğunu göstermez — çoğu zaman yanlış tanıdır ve bulgu olarak
   beslenirse hata kilitlenir.
   Tanı adından semptom TÜRETME: "GERD tanılı" yazıyorsa heartburn kodlama;
   yalnızca metnin açıkça tarif ettiği semptomu kodla.

4) TEDAVİYE YANIT BİR BULGUDUR.
   "PPI'a rağmen geçmedi", "omeprazol fayda etmedi" → ppi_trial_failed = true.
   Bu ifadeler bedava tanısal testtir, atlanmamalıdır.

5) KUTULAR.
   Her bulgunun kutusu yukarıdaki listede belirtilmiştir; box alanına onu yaz.
   Aile bireylerinin hastalıkları fhx, hastanın kendi geçmiş hastalıkları pmh,
   kullandığı ilaçlar meds, meslek/sigara/alkol habits kutusuna gider.

6) MUAYENE.
   exam.normalSystems'e bir sistemi YALNIZCA metinde o sistemin muayenesinin
   yapılıp NORMAL bulunduğu yazıyorsa ekle ("batın muayenesi doğal",
   "nörolojik muayene normal"). Her biri için de alıntı ver.
   Hastanın bir şeyden şikâyet etmemesi muayenenin normal olduğu anlamına
   GELMEZ. Muayene bölümü yoksa normalSystems boş kalır.

7) DEMOGRAFİ VE SÜRE.
   age, sex (M/F), durationMonths = şikâyetlerin toplam süresi (ay cinsinden).
   Yazmıyorsa null bırak. "2 yıldır" → 24. "3 haftadır" → 0.75.

8) KODLAYAMADIKLARIN.
   Metinde klinik olarak önemli görünen ama listede karşılığı olmayan ifadeleri
   notes dizisine kısa cümlelerle yaz. Uydurma kod ÜRETME; eksik olanı bildir.

Emin olmadığın bir bulguyu yazma. Eksik çıkarım, yanlış çıkarımdan iyidir.`;
}

export function extractionSchema(kb) {
  return {
    type: 'object',
    properties: {
      age: { type: ['integer', 'null'], description: 'Yaş (yıl). Yazmıyorsa null.' },
      sex: { type: ['string', 'null'], enum: ['M', 'F', null], description: 'Cinsiyet.' },
      durationMonths: {
        type: ['number', 'null'],
        description: 'Şikâyetlerin toplam süresi, ay. Yazmıyorsa null.',
      },
      findings: {
        type: 'array',
        description: 'Metinde açıkça VAR ya da YOK denen bulgular. Sözü edilmeyen yazılmaz.',
        items: {
          type: 'object',
          properties: {
            code: { type: 'string', enum: allowedCodes(kb) },
            present: { type: 'boolean', description: 'true = var, false = açıkça yok' },
            box: { type: 'string', enum: ['hpi', 'exam', 'pmh', 'meds', 'fhx', 'habits'] },
            quote: { type: 'string', description: 'Metinden birebir alıntı.' },
          },
          required: ['code', 'present', 'box', 'quote'],
          additionalProperties: false,
        },
      },
      examNormalSystems: {
        type: 'array',
        description: 'Yalnızca muayenesi yapılıp NORMAL bulunduğu yazan sistemler.',
        items: {
          type: 'object',
          properties: {
            system: { type: 'string', enum: allowedSystems() },
            quote: { type: 'string', description: 'Metinden birebir alıntı.' },
          },
          required: ['system', 'quote'],
          additionalProperties: false,
        },
      },
      priorDiagnoses: {
        type: 'array',
        description: 'Daha önce konmuş tanılar. KANIT DEĞİLDİR, kayıt amaçlıdır.',
        items: {
          type: 'object',
          properties: {
            label: { type: 'string' },
            confirmed: { type: 'boolean', description: 'Metin tanının doğrulandığını söylüyor mu' },
            quote: { type: 'string' },
          },
          required: ['label', 'confirmed', 'quote'],
          additionalProperties: false,
        },
      },
      notes: {
        type: 'array',
        description: 'Sözlükte karşılığı olmayan ama klinik olarak önemli ifadeler.',
        items: { type: 'string' },
      },
    },
    required: ['findings'],
    additionalProperties: false,
  };
}

export const TOOL_NAME = 'kaydet_bulgular';

export function userPrompt(text) {
  return `Aşağıdaki hasta metnini çıkar.\n\n=== METİN ===\n${text}\n=== METİN SONU ===`;
}
