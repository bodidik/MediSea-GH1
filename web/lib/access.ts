import { auth } from '@/auth';
import { dbConnect } from '@/lib/db';
import ContentAccess, { AccessLevel } from '@/lib/models/ContentAccess';

export type AccessResult = 'ok' | 'need-login' | 'need-member' | 'need-premium' | 'unavailable';

/** Bir topic için gereken erişim seviyesini DB'den okur, varsayılan P */
export async function getRequiredLevel(topicId: string): Promise<AccessLevel> {
  await dbConnect();
  const doc = await ContentAccess.findOne({ topicId }).lean();
  return (doc?.accessLevel as AccessLevel) ?? 'P';
}

/** Session + topic'in gereken seviyesini karşılaştırır */
export async function checkTopicAccess(topicId: string): Promise<AccessResult> {
  // Erişim doğrulanamıyorsa FIRLATMA, kapalı tarafa düş. Fırlatmak bütün
  // sayfayı "Application error" beyaz ekranına çeviriyordu: Vercel'de
  // MONGODB_URI tanımlı olmadığı için her premium konu sayfası 500 döndü,
  // ziyaretçi de neyin bozulduğunu anlamadı. Doğrulayamıyorsak içeriği
  // vermeyiz ama sebebi dürüstçe söyleriz; ayrıntı yalnızca sunucu günlüğüne.
  let session;
  try {
    session = await auth();
  } catch (err) {
    console.error('[erişim] oturum okunamadı:', err);
    return 'unavailable';
  }

  let required: AccessLevel;
  try {
    required = await getRequiredLevel(topicId);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') return 'ok';
    console.error(`[erişim] ${topicId} için seviye okunamadı:`, err);
    return 'unavailable';
  }

  if (required === 'V') return 'ok';

  if (!session?.user) return 'need-login';

  const plan        = (session.user as any).plan        ?? 'free';
  const institution = (session.user as any).institution ?? null;
  const paraAktif   = process.env.MONETIZATION_ENABLED === 'true';

  const uyeMi    = plan === 'member' || plan === 'premium' || institution === 'kayseritip';
  const premiumMi = plan === 'premium';

  if (required === 'M') {
    if (!paraAktif) return 'ok';       // ücretsiz dönem
    return uyeMi ? 'ok' : 'need-member';
  }

  if (required === 'P') {
    return premiumMi ? 'ok' : 'need-premium';
  }

  return 'ok';
}
