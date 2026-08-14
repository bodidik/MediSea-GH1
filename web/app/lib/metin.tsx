/**
 * İçerikten gelen metinlerdeki markdown KALIN işaretini (`**...**`) render eder.
 *
 * Neden var: premium motorlar (`YdusCockpit`, `VakaEngine`, `QuizEngine`) içerik
 * dosyalarındaki metni doğrudan JSX'e basıyordu; içerik yazarı `**en kritik**`
 * yazdığında kullanıcı ekranda yıldızları görüyordu. İçerik kullanıcının
 * sorumluluğunda ve dokunulmuyor — dönüştürme render tarafında yapılıyor.
 *
 * Kapsamı BİLEREK dar: yalnızca `**` çifti. Tam bir markdown ayrıştırıcısı
 * değil, çünkü içerikte `*`, `_`, `#` gibi işaretler klinik metnin kendisi
 * olabiliyor (`Na*`, `HbA1c_hedef`) ve onları biçim sanmak metni bozar.
 *
 * `dangerouslySetInnerHTML` KULLANILMIYOR. Girdi içerik dosyasından geliyor;
 * HTML'e çevirip basmak kaçırma (escape) sorumluluğunu her çağrı yerine
 * dağıtırdı. React düğümü döndürmek bu sorunu tümden ortadan kaldırıyor:
 * kalın olmayan parçalar metin düğümü olarak basılır, içindeki `<`, `&`
 * karakterleri React tarafından zaten kaçırılır.
 *
 * ⚠ ÇAĞIRIRKEN: doğrudan bir FLEX/GRID kapsayıcının çocuğu olarak basma.
 * Tek metin düğümü tek anonim öge olurken, bölünen metin BİRDEN ÇOK öge
 * olur; kapsayıcının `gap` değeri kelimelerin arasına girer ve dar ekranda
 * satır kelime yerine bloklar hâlinde sarar. Kokpitteki soru başlığında
 * ölçüldü (üç öge, aralarında 8'er px) ve bir `<span>` ile sarılarak
 * kapatıldı. Kapsayıcı flex ise sonucu bir `<span>` içine al.
 */

import { Fragment, type ReactNode } from 'react';

/**
 * Tek satır içinde kapanan `**...**` çiftini yakalar.
 *
 * `.` satır sonunu eşlemediği için işaret satır atlayamaz — bu bilerek:
 * kapanmayan tek bir `**`, paragraflar boyunca metni yutup kalınlaştırmasın.
 * Eşleşmeyen tek yıldızlar olduğu gibi kalır (içerikte gerçek yıldız olabilir).
 */
const KALIN = /\*\*(.+?)\*\*/;

/** Genel arama-değiştir için aynı kalıbın global sürümü. */
const KALIN_TUMU = /\*\*(.+?)\*\*/g;

/**
 * `**kalın**` işaretlerini `<strong>`'a çevirir, gerisini olduğu gibi bırakır.
 * İşaret yoksa dizgenin kendisini döndürür — gereksiz düğüm üretmez.
 */
export function kalinIsle(metin: string): ReactNode {
  if (!metin || !metin.includes('**')) return metin;

  // Yakalama grubu olan bir regex ile split: tek indisler kalın parçalar.
  const parcalar = metin.split(KALIN);
  if (parcalar.length === 1) return metin;

  return parcalar.map((parca, i) =>
    i % 2 === 1
      ? <strong key={i}>{parca}</strong>
      // Fragment, sarmalayıcı bir <span> eklemeden anahtar taşımayı sağlar:
      // satır içi düzen ve `data-readable` karakter ofsetleri bozulmasın.
      : <Fragment key={i}>{parca}</Fragment>
  );
}

/**
 * ZATEN ham HTML olarak basılan dizgeler için kalın dönüşümü.
 *
 * Yalnızca `dangerouslySetInnerHTML` kullanan çağrı yerleri içindir —
 * inciler sayfası böyle. Yeni bir risk AÇMIYOR: o dizge çağıran tarafından
 * halihazırda ham HTML olarak basılıyor, buradaki tek değişiklik bir çift
 * yıldızın `<strong>`'a dönmesi.
 *
 * Yeni yüzey yazarken bunu DEĞİL `kalinIsle`'yi kullan. Bu sürüm mevcut
 * sözleşmeyi bozmamak için var: içerik ileride gerçek HTML taşırsa
 * (bugün taşımıyor, ölçüldü: 13 incinin hiçbirinde etiket yok) o etiketler
 * çalışmaya devam etsin.
 *
 * Yakalanan metinde `<` ve `>` KABUL EDİLMİYOR: işaret bir etiketin
 * ortasına denk gelirse etiketi ikiye bölmesin.
 */
export function kalinHtml(metin: string): string {
  if (!metin || !metin.includes('**')) return metin;
  return metin.replace(/\*\*([^*<>]+)\*\*/g, '<strong>$1</strong>');
}

/**
 * İşaretleri söker, metni düz dizge olarak döndürür.
 * React düğümünün işe yaramadığı yerler için: kırpılan önizleme, `title`,
 * `aria-label` gibi dizge bekleyen alanlar.
 */
export function duzMetin(metin: string): string {
  if (!metin || !metin.includes('**')) return metin;
  return metin.replace(KALIN_TUMU, '$1');
}
