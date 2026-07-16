import fs from 'fs';
import path from 'path';

const TUR_STIL: Record<string, { sol: string; bg: string; renk: string; etiket: string }> = {
  bilgi:   { sol: '#4a7acf', bg: '#eef4ff', renk: '#1a3a7a', etiket: 'Bilgi' },
  onemli:  { sol: '#cf7a1a', bg: '#fff8ee', renk: '#7a3800', etiket: 'Önemli' },
  acil:    { sol: '#cf1a1a', bg: '#fff2f2', renk: '#8b1a1a', etiket: 'Acil' },
};

function duyurulariOku() {
  try {
    const p = path.join(process.cwd(), 'content', 'kayseritip', 'duyurular.json');
    const { duyurular } = JSON.parse(fs.readFileSync(p, 'utf-8'));
    return (duyurular ?? []).filter((d: any) => d.yayinda !== false);
  } catch { return []; }
}

export default function DuyurularPage() {
  const duyurular: any[] = duyurulariOku();
  const sabitler  = duyurular.filter(d => d.sabitli);
  const digerler  = duyurular.filter(d => !d.sabitli);
  const sirali    = [...sabitler, ...digerler];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a2a4a', margin: '0 0 4px' }}>
          📢 Duyurular
        </h1>
        <div style={{ fontSize: '12px', color: '#8a9aaa' }}>
          KayseriTıp — Erciyes Üniversitesi Tıp Fakültesi
        </div>
      </div>

      {sirali.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#8a9aaa', fontSize: '14px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
          Şu an aktif duyuru bulunmuyor.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sirali.map(d => {
            const stil = TUR_STIL[d.tur] ?? TUR_STIL.bilgi;
            return (
              <div key={d.id} style={{
                background: stil.bg,
                borderLeft: `4px solid ${stil.sol}`,
                borderRadius: '0 12px 12px 0',
                padding: '14px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {d.sabitli && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#1a1a6b' }}>📌</span>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                    background: 'rgba(255,255,255,0.6)', color: stil.renk }}>
                    {stil.etiket}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: stil.renk, flex: 1 }}>
                    {d.baslik}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#2a3a5a', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                  {d.icerik}
                </div>
                <div style={{ fontSize: '11px', color: '#8a9aaa' }}>
                  {new Date(d.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
