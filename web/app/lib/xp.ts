/**
 * XP KURALI — tek kaynak. Motorlar puanı buradan alır, liderlik ve profil
 * metni kuralı buradan anlatır.
 *
 * Bir dönem canlıda XP kazandıran HİÇBİR yol yoktu: puan veren tek kod
 * (`completeModule`) rotaya alınmayan eski simülasyon sayfalarındaydı; her
 * kullanıcı "Puanın 0 xp" görüyor ve sıralamada kalıcı olarak sonuncuydu.
 *
 * Kalibrasyon: 1072 soru × 10 + 66 set × 50 + 15 vaka × 50 ≈ 14.800 —
 * `rutbe.ts`teki en üst basamak (12.000) çalışmayla ulaşılabilir, hediye
 * edilmez. Her kazanım bir KİMLİĞE bağlı ve bir kez sayılır: aynı soruyu
 * ikinci kez doğru cevaplamak puan vermez.
 */
export const XP = {
  /** Bir sorunun İLK doğru cevabı. */
  dogruCevap: 10,
  /** Bir soru setini sonuna kadar çözmek (yalnızca yanlışlar turu sayılmaz). */
  setBitir: 50,
  /** Bir klinik vakayı sonuna kadar çözmek. */
  vakaBitir: 50,
} as const;

export const xpKimligi = {
  soru: (setId: string, soruId: string) => `soru:${setId}:${soruId}`,
  set: (setId: string) => `set:${setId}`,
  vaka: (branch: string, vakaId: string) => `vaka:${branch}/${vakaId}`,
};

/** Kuralın okunur hâli — liderlik ve profil aynı cümleyi basar. */
export const XP_KURALI_METNI =
  `Her sorunun ilk doğru cevabı ${XP.dogruCevap}, bitirdiğin her soru seti ` +
  `${XP.setBitir}, her klinik vaka ${XP.vakaBitir} seyir mili kazandırır.`;
