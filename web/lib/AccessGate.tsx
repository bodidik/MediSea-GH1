import Link from 'next/link';
import { checkTopicAccess, AccessResult } from '@/lib/access';

interface Props {
  topicId: string;
  lang: string;
  branch: string;
}

export async function AccessGate({ topicId, lang, branch }: Props) {
  const erisim: AccessResult = await checkTopicAccess(topicId);
  if (erisim === 'ok') return null;

  const mesaj =
    erisim === 'need-login'  ? 'Bu içeriği görüntülemek için giriş yapmalısın.' :
    erisim === 'need-member' ? 'Bu içerik üye seviyesinde kilitlidir.' :
                               'Bu içerik Premium üyelere özeldir.';
  const href =
    erisim === 'need-login'  ? '/giris' :
    erisim === 'need-member' ? '/uyelik' :
                               '/uyelik?plan=premium';
  const buton =
    erisim === 'need-login'  ? 'Giriş Yap' :
    erisim === 'need-member' ? 'Üye Ol' :
                               "Premium'a Geç";

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f5f9ff', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🔒</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a3a6b', marginBottom: '8px' }}>
          Erişim Kısıtlı
        </h2>
        <p style={{ fontSize: '14px', color: '#4a6a8a', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {mesaj}
        </p>
        <Link href={href} style={{
          display: 'inline-block', padding: '10px 24px', background: '#1a3a6b',
          color: '#fff', borderRadius: '8px', textDecoration: 'none',
          fontSize: '14px', fontWeight: 600,
        }}>
          {buton}
        </Link>
        <div style={{ marginTop: '12px' }}>
          <Link href={`/${lang}/premium/ydus/${branch}`} style={{ fontSize: '12px', color: '#6a8aaa', textDecoration: 'none' }}>
            ← Geri dön
          </Link>
        </div>
      </div>
    </div>
  );
}
