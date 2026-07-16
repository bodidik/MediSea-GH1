import fs from 'fs';
import path from 'path';
import Link from 'next/link';

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

function slaytlariYukle(): Ders[] {
  try {
    const p = path.join(process.cwd(), 'content', 'kayseritip', 'slaytlar.json');
    return JSON.parse(fs.readFileSync(p, 'utf-8')).dersler ?? [];
  } catch { return []; }
}

const TIP_STIL: Record<string, { bg: string; color: string; etiket: string }> = {
  pdf:  { bg: '#fff0f0', color: '#8b1a1a', etiket: 'PDF'  },
  pptx: { bg: '#fff4e6', color: '#7a3800', etiket: 'PPTX' },
};

export default function SlaytlarPage() {
  const dersler = slaytlariYukle();

  const gruplar = dersler.reduce<Record<string, Ders[]>>((acc, d) => {
    const key = d.ders ?? 'Diğer';
    (acc[key] ??= []).push(d);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a2a4a', margin: '0 0 4px' }}>Ders Slaytları</h1>
        <p style={{ fontSize: '13px', color: '#6a7a9a', margin: 0 }}>{dersler.length} dosya</p>
      </div>

      {Object.entries(gruplar).map(([ders, liste]) => (
        <div key={ders} style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#6a7a9a',
            textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px',
          }}>
            {ders}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liste.map((d) => {
              const stil = TIP_STIL[d.tip] ?? TIP_STIL.pdf;
              return (
                <Link key={d.id} href={`/kayseritip/slaytlar/${d.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', border: '0.5px solid #d0d8f0', borderRadius: '12px',
                    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px',
                  }}>
                    <div style={{ fontSize: '28px', flexShrink: 0 }}>
                      {d.tip === 'pdf' ? '📄' : '📊'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a2a4a', marginBottom: '3px' }}>
                        {d.baslik}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a9aaa' }}>
                        {d.ogretim_uyesi}{d.tarih ? ` · ${d.tarih}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                        background: stil.bg, color: stil.color,
                      }}>
                        {stil.etiket}
                      </span>
                      <span style={{ color: '#b0b8d0', fontSize: '16px' }}>→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {dersler.length === 0 && (
        <p style={{ color: '#8a9aaa', fontSize: '14px', textAlign: 'center', marginTop: '3rem' }}>
          Henüz slayt eklenmemiş.
        </p>
      )}
    </div>
  );
}
