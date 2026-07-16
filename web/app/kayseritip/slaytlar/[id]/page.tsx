import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SlaytViewer from './SlaytViewer';

interface Ders {
  id: string;
  baslik: string;
  aciklama?: string;
  ders?: string;
  ogretim_uyesi?: string;
  tarih?: string;
  dosya: string;
  tip: 'pdf' | 'pptx';
}

function dersiBul(id: string): Ders | null {
  try {
    const p = path.join(process.cwd(), 'content', 'kayseritip', 'slaytlar.json');
    const liste: Ders[] = JSON.parse(fs.readFileSync(p, 'utf-8')).dersler ?? [];
    return liste.find(d => d.id === id) ?? null;
  } catch { return null; }
}

export default async function SlaytDetay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ders = dersiBul(id);
  if (!ders) notFound();

  const dosyaUrl = `/api/kayseritip/dosya/${ders.dosya}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 52px)' }}>

      {/* Başlık çubuğu */}
      <div style={{
        background: '#fff', borderBottom: '0.5px solid #d0d8f0',
        padding: '10px 1.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
      }}>
        <Link href="/kayseritip/slaytlar" style={{
          fontSize: '12px', color: '#1a1a6b', textDecoration: 'none',
          border: '0.5px solid #c0c8e8', borderRadius: '6px', padding: '4px 10px',
          background: '#f0f0ff',
        }}>
          ← Slaytlar
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2a4a' }}>{ders.baslik}</div>
          <div style={{ fontSize: '11px', color: '#8a9aaa' }}>
            {ders.ders}{ders.ogretim_uyesi ? ` · ${ders.ogretim_uyesi}` : ''}{ders.tarih ? ` · ${ders.tarih}` : ''}
          </div>
        </div>
        <a
          href={dosyaUrl}
          download={ders.dosya}
          style={{
            fontSize: '12px', color: '#1a1a6b', textDecoration: 'none',
            border: '0.5px solid #c0c8e8', borderRadius: '6px', padding: '4px 10px',
            background: '#f0f0ff',
          }}
        >
          ⬇ İndir
        </a>
      </div>

      {/* Görüntüleyici */}
      <SlaytViewer dosyaUrl={dosyaUrl} tip={ders.tip} baslik={ders.baslik} />
    </div>
  );
}
