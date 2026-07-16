'use client';
import { useState } from 'react';

interface Props {
  dosyaUrl: string;
  tip: 'pdf' | 'pptx';
  baslik: string;
}

export default function SlaytViewer({ dosyaUrl, tip, baslik }: Props) {
  const [tamEkran, setTamEkran] = useState(false);

  // PDF: iframe ile native görüntüleme
  if (tip === 'pdf') {
    return (
      <div style={{
        flex: 1, position: 'relative',
        outline: tamEkran ? 'none' : undefined,
      }}>
        <button
          onClick={() => setTamEkran(f => !f)}
          style={{
            position: 'absolute', top: '10px', right: '16px', zIndex: 10,
            fontSize: '11px', fontWeight: 600, padding: '4px 10px',
            background: 'rgba(26,26,107,0.85)', color: '#fff',
            border: 'none', borderRadius: '6px', cursor: 'pointer',
          }}
        >
          {tamEkran ? '⊠ Küçült' : '⊞ Tam Ekran'}
        </button>
        <iframe
          src={`${dosyaUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          title={baslik}
          style={{
            width: '100%', height: '100%', border: 'none',
            position: tamEkran ? 'fixed' : 'relative',
            top: tamEkran ? 0 : undefined,
            left: tamEkran ? 0 : undefined,
            zIndex: tamEkran ? 9999 : undefined,
          }}
        />
      </div>
    );
  }

  // PPTX: tarayıcı desteklemez, seçenek sun
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '20px', padding: '2rem',
      background: '#f8f9ff',
    }}>
      <div style={{ fontSize: '48px' }}>📊</div>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2a4a', marginBottom: '8px' }}>
          {baslik}
        </h2>
        <p style={{ fontSize: '13px', color: '#6a7a9a', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          PPTX dosyaları tarayıcıda doğrudan açılamaz. Aşağıdaki seçeneklerden birini kullan:
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '360px' }}>
        <a
          href={dosyaUrl}
          download
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '10px',
            padding: '14px 18px', textDecoration: 'none', color: '#1a2a4a',
          }}
        >
          <span style={{ fontSize: '22px' }}>⬇</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Bilgisayara İndir</div>
            <div style={{ fontSize: '11px', color: '#8a9aaa' }}>PowerPoint ile aç</div>
          </div>
        </a>

        <a
          href={`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + dosyaUrl : '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '10px',
            padding: '14px 18px', textDecoration: 'none', color: '#1a2a4a',
          }}
        >
          <span style={{ fontSize: '22px' }}>🌐</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Online Görüntüle</div>
            <div style={{ fontSize: '11px', color: '#8a9aaa' }}>Microsoft Office Online (public URL gerekir)</div>
          </div>
        </a>
      </div>

      <div style={{
        background: '#fff8e6', border: '0.5px solid #f0d080', borderRadius: '8px',
        padding: '10px 14px', fontSize: '12px', color: '#7a4a00', maxWidth: '400px', textAlign: 'center',
      }}>
        💡 Tavsiye: Slaytları yüklerken PDF olarak dönüştürün — tarayıcıda tam desteklenir ve korumalı kalır.
      </div>
    </div>
  );
}
