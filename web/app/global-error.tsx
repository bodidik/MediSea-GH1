"use client";

import { useEffect } from "react";

/**
 * SON ÇARE SINIRI — `app/layout.tsx`in kendisi hata verdiğinde.
 *
 * `app/error.tsx` kökteki her segmenti kapsıyor ama KÖK DÜZENİ kapsamıyor:
 * düzen çökerse React ağacı hiç kurulamadığı için o sınır da çizilemiyor.
 * Next bu durumda `global-error.tsx` arıyor, bulamazsa kendi varsayılan
 * ekranını basıyor (İngilizce, markasız, çıkışsız).
 *
 * Bu dosya kök düzenin YERİNE geçtiği için `<html>` ve `<body>` etiketlerini
 * KENDİSİ vermek zorunda — düzenden hiçbir şey miras almıyor. Aynı sebeple
 * Tailwind sınıflarına da güvenilmiyor: stil sayfası düzen üzerinden
 * yükleniyor ve burada yüklenmemiş olabilir. Renkler bu yüzden satır içi.
 *
 * `lang="tr"`: kök düzendeki dil beyanı da kaybolduğu için burada
 * yeniden verilmezse ekran okuyucu metni yanlış dille okur.
 */
export default function GenelHata({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[genel hata sınırı]", error?.message, error?.digest);
  }, [error]);

  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F9FC",
          color: "#1a2a3a",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "34rem",
            width: "100%",
            textAlign: "center",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "24px",
            padding: "2.5rem",
          }}
        >
          <div style={{ fontSize: "2.25rem", marginBottom: ".5rem" }} aria-hidden="true">
            ⚓
          </div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#1a3a6b",
              margin: "0 0 .5rem",
            }}
          >
            MediSea şu an açılamıyor
          </h1>
          <p
            style={{
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#4a5a7a",
              margin: "0 0 1.5rem",
            }}
          >
            Bizim tarafımızda bir aksaklık oldu. Çalışman ve notların
            tarayıcında duruyor, kaybolmadı.
          </p>
          {/*
            ÇIKIŞ YOLU ŞART. Ölçüldü: bu kartta bağlantı sayısı SIFIRDI —
            yalnızca "Tekrar dene" vardı. Hata kalıcıysa (yeniden deneme
            aynı hataya düşüyorsa) kullanıcı çıkmazda kalıyordu; deponun
            hata kartı kuralı "her kartta geri dönülecek bir bağlantı".

            <Link> DEĞİL düz <a>: bu sınır KÖK DÜZEN çizilemediğinde
            devreye giriyor, yani istemci yönlendiricisi sağlam sayılamaz.
            Tam sayfa yüklemesi tek güvenilir kaçış.
          */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{
              background: "#1a3a6b",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
              kural TAM SAYFA YÜKLEMESİNİ önlemek için var; burada yükleme
              KASITLI. Bu sınır kök düzen çizilemediğinde devreye giriyor,
              yani istemci yönlendiricisi ve bozuk istemci durumu sağlam
              sayılamaz; yumuşak gezinme aynı bozuk ağaca geri dönebilir. */}
          <a
            href="/"
            style={{
              background: "#fff",
              color: "#1a3a6b",
              border: "1px solid #b8cfe8",
              borderRadius: "999px",
              padding: "10px 24px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Ana sayfaya dön
          </a>
          </div>
        </div>
      </body>
    </html>
  );
}
