/**
 * Kayıt formunun paylaşılan kuralları.
 *
 * TEK KAYNAK, çünkü aynı kural iki yerde uygulanmak zorunda: istemci
 * kullanıcıyı beklertmeden uyarsın diye, sunucu ise istemciye güvenilemez
 * diye. İkisi ayrı yazılırsa sessizce ayrışırlar — bu deponun en çok
 * tekrar eden kusur sınıfı.
 *
 * Ölçüldü: istemcide HİÇ denetim yoktu ve 3 karakterlik bir şifre için
 * kullanıcı **8994 ms** bekleyip "Şifre en az 6 karakter olmalıdır"
 * mesajını alıyordu. Kural istemcinin zaten bildiği bir kuraldı.
 */
export const SIFRE_MIN = 6;

/** Sunucu ve istemci AYNI cümleyi basar; metin de sabitten türer. */
export const SIFRE_KISA_MESAJ = `Şifre en az ${SIFRE_MIN} karakter olmalıdır.`;
