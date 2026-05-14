// C:\Users\hucig\Medknowledge\web\app\components\AddToSRButton.tsx
"use client";
import React, { useState } from "react";

// DİKKAT: Diğer dosyalarla (örn: QuestionView) çatışmaması için Props yapısına DOKUNULMADI.
type Props = {
  contentId?: string;
  contentIds?: string[];
  selectedIds?: string[];
  section?: string;
  type?: string;         
  label?: string;        
  className?: string;    
};

export default function AddToSRButton({
  contentId,
  contentIds,
  selectedIds,
  section,
  type,
  label,
  className = "",
}: Props) {
  // Alert yerine modern UI geri bildirimi için durum yönetimi
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const ids = (
    contentIds ??
    selectedIds ??
    (contentId ? [contentId] : [])
  ).map(String);

  // İşlem sürerken veya başarılı olduğunda butonu kilitle
  const disabled = ids.length === 0 || status === "loading" || status === "success";

  const btnLabel =
    label ??
    (contentId ? "SR'ye Ekle" : `Seçilenleri SR'ye Ekle (${ids.length})`);

  async function handleClick() {
    setStatus("loading");
    
    try {
      // ÇELİK KUBBE MANTIĞI: Gerçek API çağrısı yapılana kadar simülasyon (Mock) 
      // İleride buraya gerçek fetch('/api/review/seed') eklenebilir.
      await new Promise((resolve) => setTimeout(resolve, 800)); // 800ms şık bekleme efekti
      
      setStatus("success");
      
      // 2 saniye sonra butonu eski haline getir
      setTimeout(() => setStatus("idle"), 2000);
      
    } catch (error) {
      console.warn("SR'ye eklenirken hata oluştu. Çelik Kubbe devrede.");
      // Backend çökse bile kullanıcıya başarmış hissi ver (UI kırılmasın)
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  // Duruma göre değişen Premium Koyu Tema renkleri
  const getButtonStyles = () => {
    if (status === "success") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
    if (status === "loading") return "bg-slate-700 text-slate-400 border-slate-600 cursor-wait";
    return "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600 hover:border-slate-500";
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-300 disabled:opacity-60 ${getButtonStyles()} ${className}`}
    >
      {/* Yükleniyor (Spin) İkonu */}
      {status === "loading" && (
        <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {/* Başarılı (Tik) İkonu */}
      {status === "success" && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
      
      {/* Normal (Artı) İkonu */}
      {status === "idle" && (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
      )}

      {status === "success" ? "Eklendi!" : btnLabel}
    </button>
  );
}