// web/types/question.ts

export type Option = { key: string; text: string };

export type Question = {
  section?: string;
  title?: string;
  id: string;                 // question id (UI tarafı)
  contentId?: string;         // SR/işaretleme vb. için tekil id
  stem: string;               // soru kökü
  options?: Option[];         // şıklar
  answer?: string;            // doğru şık (örn. "A")
  explanation?: string;       // açıklama
  vignette?: string;          // vaka metni (opsiyonel)
};


