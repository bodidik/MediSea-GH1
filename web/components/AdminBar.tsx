"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  apiBaseUrl: string;
};

export default function AdminBar({ slug, apiBaseUrl }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Editör Modu Durumları
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    summary: "",
    html: ""
  });

  // --- VERİYİ ÇEK VE MODALI AÇ ---
  const handleEditClick = async () => {
    setLoading(true);
    try {
      // Mevcut veriyi backend'den al
      const res = await fetch(`${apiBaseUrl}/api/content/${slug}`);
      const data = await res.json();

      // Formu doldur (İlk section'ın HTML'ini alıyoruz şimdilik)
      setEditData({
        title: data.title || "",
        summary: data.summary || "",
        html: data.sections?.[0]?.html || "" 
      });
      
      setIsEditing(true); // Modalı aç
    } catch (error) {
      alert("Veri çekilemedi!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- KAYDET (UPDATE) ---
  const handleSave = async () => {
    setLoading(true);
    try {
      // Gönderilecek paket
      const payload = {
        title: editData.title,
        summary: editData.summary,
        sections: [
          {
            title: "Genel Bilgi", // Başlık sabit kalsın şimdilik
            html: editData.html,  // Düzenlenen HTML
            visibility: "V"
          }
        ]
      };

      const res = await fetch(`${apiBaseUrl}/api/content/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Başarıyla güncellendi!");
        setIsEditing(false); // Modalı kapat
        router.refresh(); // Sayfayı yenile
      } else {
        alert("❌ Hata oluştu.");
      }
    } catch (error) {
      console.error(error);
      alert("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  };

  // --- SİLME (DELETE) ---
  const handleDelete = async () => {
    if (!window.confirm("Bu sayfayı silmek istediğine emin misin?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/content/${slug}`, { method: "DELETE" });
      if (res.ok) {
        alert("Silindi 👋");
        router.push("/tr/topics/romatoloji");
        router.refresh();
      }
    } catch (err) { alert("Hata!"); } 
    finally { setLoading(false); }
  };

  return (
    <>
      {/* --- ADMIN BAR (Kırmızı Kutu) --- */}
      <div style={{
        position: "fixed", bottom: "20px", right: "20px", zIndex: 9999,
        backgroundColor: "white", border: "3px solid #dc2626", padding: "15px",
        borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", width: "240px",
        display: "flex", flexDirection: "column", gap: "10px", fontFamily: "sans-serif"
      }}>
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
          <strong style={{ color: "#dc2626", fontSize: "12px", display: "block" }}>ADMIN PANEL</strong>
          <span style={{ fontSize: "10px", color: "#666" }}>{slug.substring(0, 20)}...</span>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          <button onClick={handleEditClick} disabled={loading} style={{
            flex: 1, padding: "8px", backgroundColor: "#f3f4f6", border: "1px solid #ddd",
            borderRadius: "5px", cursor: "pointer", fontWeight: "bold"
          }}>✏️ DÜZENLE</button>
          
          <button onClick={handleDelete} disabled={loading} style={{
            flex: 1, padding: "8px", backgroundColor: "#dc2626", color: "white", border: "none",
            borderRadius: "5px", cursor: "pointer", fontWeight: "bold"
          }}>🗑️ SİL</button>
        </div>
      </div>

      {/* --- DÜZENLEME MODALI (POP-UP) --- */}
      {isEditing && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.8)", zIndex: 10000,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            backgroundColor: "white", width: "80%", maxWidth: "800px", height: "80%",
            padding: "20px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "15px"
          }}>
            <h2 style={{ margin: 0, color: "#333" }}>İçeriği Düzenle</h2>
            
            {/* Başlık Input */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>Başlık</label>
              <input 
                type="text" 
                value={editData.title} 
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
              />
            </div>

            {/* Özet Input */}
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>Özet</label>
              <textarea 
                value={editData.summary} 
                onChange={(e) => setEditData({...editData, summary: e.target.value})}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", height: "60px" }}
              />
            </div>

            {/* HTML Editör (Textarea) */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
                HTML İçerik (Resim kodları burada)
              </label>
              <textarea 
                value={editData.html} 
                onChange={(e) => setEditData({...editData, html: e.target.value})}
                style={{ 
                  width: "100%", flex: 1, padding: "10px", 
                  border: "1px solid #ccc", borderRadius: "5px", 
                  fontFamily: "monospace", fontSize: "14px", lineHeight: "1.4",
                  backgroundColor: "#282c34", color: "#abb2bf" // Kod görünümü için koyu tema
                }}
              />
            </div>

            {/* Modal Butonları */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setIsEditing(false)}
                style={{ padding: "10px 20px", backgroundColor: "#ccc", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                İptal
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
              >
                💾 KAYDET
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}