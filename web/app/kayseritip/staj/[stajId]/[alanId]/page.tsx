import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AlanClient from './AlanClient';
import { ktKullaniciAl, yuklemeyeYetkili } from '@/lib/ktYetki';

function stajVeAlan(stajId: string, alanId: string) {
  try {
    const p = path.join(process.cwd(), 'content', 'kayseritip', 'stajlar.json');
    const stajlar = JSON.parse(fs.readFileSync(p, 'utf-8')).stajlar ?? [];
    const staj = stajlar.find((s: any) => s.id === stajId);
    if (!staj) return null;
    const alan = staj.alanlar.find((a: any) => a.id === alanId);
    if (!alan) return null;
    return { staj, alan };
  } catch { return null; }
}

function alanDosyalari(stajId: string, alanId: string) {
  try {
    const p = path.join(process.cwd(), 'content', 'kayseritip', 'slaytlar.json');
    const dosyalar: any[] = JSON.parse(fs.readFileSync(p, 'utf-8')).dosyalar ?? [];
    return dosyalar.filter(d => d.stajId === stajId && d.alanId === alanId);
  } catch { return []; }
}

export default async function AlanPage({
  params,
}: {
  params: Promise<{ stajId: string; alanId: string }>;
}) {
  const { stajId, alanId } = await params;
  const meta = stajVeAlan(stajId, alanId);
  if (!meta) notFound();

  const dosyalar = alanDosyalari(stajId, alanId);
  const kt = await ktKullaniciAl();
  const yukleyebilir = kt ? yuklemeyeYetkili(kt, stajId, alanId) : false;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8a9aaa', marginBottom: '1.25rem' }}>
        <Link href="/kayseritip" style={{ color: '#1a1a6b', textDecoration: 'none' }}>KayseriTıp</Link>
        <span>/</span>
        <Link href={`/kayseritip/staj/${stajId}`} style={{ color: '#1a1a6b', textDecoration: 'none' }}>
          {meta.staj.baslik}
        </Link>
        <span>/</span>
        <span style={{ color: '#1a2a4a', fontWeight: 600 }}>{meta.alan.baslik}</span>
      </div>

      {/* Başlık */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1a2a4a', margin: '0 0 4px' }}>
          {meta.alan.emoji} {meta.alan.baslik}
        </h1>
        <div style={{ fontSize: '12px', color: '#8a9aaa' }}>
          {meta.staj.donem} · {meta.staj.baslik}
        </div>
      </div>

      {/* Client component: dosya listesi + yükleme */}
      <AlanClient
        stajId={stajId}
        alanId={alanId}
        baslangicDosyalar={dosyalar}
        yukleyebilir={yukleyebilir}
      />
    </div>
  );
}
