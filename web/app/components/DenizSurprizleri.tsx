"use client";

/**
 * Deniz sürprizleri — uzun çalışanı nadiren ve sessizce ödüllendiren küçük
 * görünümler (19 Eylül 2026). İlkeler ve veri: `app/lib/seyir.ts`.
 *
 * Kök sağlayıcıya bir kez kurulur; istemci gezinmesinde SÖKÜLMEZ, yani
 * "kesintisiz okuma" süresi sayfadan sayfaya taşınır.
 *
 * Kimler görür: oturum açmış kullanıcı. Tercihi kapatan ve işletim
 * sisteminde hareketi azaltmayı seçen hiç görmez.
 *
 * Nerede ASLA: araçlar, soru/vaka/simülatör, hızlı tekrar, giriş sayfaları.
 * Çözüm sırasında göz ucundaki her hareket dikkat bedelidir.
 *
 * Süre yalnızca SEKME GÖRÜNÜRKEN ve kullanıcı son 2 dakikada bir şey
 * yaptıysa (kaydırma, fare, tuş) sayılır; 5 dakika hiçbir şey yapılmazsa
 * kesintisiz okuma sıfırlanır. Sekme gizlenince canlının animasyonu da
 * DURUR — kimse görmeden geçip gitmesin.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { dayKey, readLog, streakOf } from "@/app/lib/review-deck";
import {
  bugunSayisi,
  defteriIsle,
  kutlandiIsaretle,
  kutlandiMi,
  sonGorulme,
  surprizAcikMi,
  type Tur,
} from "@/app/lib/seyir";

const TIK_MS = 5000;
const ETKIN_ESIGI_MS = 2 * 60_000;
const KOPMA_MS = 5 * 60_000;

const YELKENLI_SN = 25 * 60;
const FENER_SN = 10 * 60;
const SAYFA_ASGARI_SN = 3 * 60;
const MARTI_OLASILIK = 1 / 25;
const MARTI_ARA_MS = 3 * 86_400_000;
const OKALIPTUS_GUNLUK = 3;
const SERI_ESIKLERI = [3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
const KART_ESIKLERI = [100, 250, 500, 1000, 2000, 5000, 10000];

/** Sürprizin hiç çıkmayacağı yollar. */
const YASAK = /^\/(tools|admin|giris|kayit|sifre|kayseritip)|\/(quiz-coz|soru-cozum|vaka-coz|hizli-tekrar)(\/|$)/;

type Aktif = { tur: Tur; yazi: string; anahtar: number };

export default function DenizSurprizleri() {
  const { status } = useSession();
  const [aktif, setAktif] = useState<Aktif | null>(null);
  const [gizli, setGizli] = useState(false);

  const aktifRef = useRef<Aktif | null>(null);
  const okumaSn = useRef(0);
  const sayfaSn = useRef(0);
  const sonEtkinlik = useRef(Date.now());
  const yol = useRef("");
  const martiZari = useRef(false);

  const goster = useCallback((tur: Tur, yazi: string, neden: string, anahtar?: string, kaydet = true) => {
    if (aktifRef.current) return;
    const a = { tur, yazi, anahtar: Date.now() };
    aktifRef.current = a;
    setAktif(a);
    if (kaydet) {
      defteriIsle(
        { tur, yol: location.pathname, baslik: document.title.split(" · ")[0], neden },
        anahtar,
      );
    }
  }, []);

  const bitir = useCallback(() => {
    aktifRef.current = null;
    setAktif(null);
  }, []);

  // Etkinlik ve görünürlük
  useEffect(() => {
    const etkin = () => { sonEtkinlik.current = Date.now(); };
    const olaylar = ["scroll", "wheel", "keydown", "pointermove", "touchstart"] as const;
    olaylar.forEach((o) => window.addEventListener(o, etkin, { passive: true }));
    const gor = () => setGizli(document.visibilityState !== "visible");
    gor();
    document.addEventListener("visibilitychange", gor);
    return () => {
      olaylar.forEach((o) => window.removeEventListener(o, etkin));
      document.removeEventListener("visibilitychange", gor);
    };
  }, []);

  // Geliştirmede elle tetik: window.__denizSurpriz("yelkenli") — deftere YAZMAZ.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as Record<string, unknown>).__denizSurpriz = (tur: Tur) =>
      goster(tur, YAZILAR[tur](7), "deneme", undefined, false);
  }, [goster]);

  // Saat
  useEffect(() => {
    if (status !== "authenticated") return;

    const tik = () => {
      if (document.visibilityState !== "visible") return;
      if (!surprizAcikMi()) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const simdi = Date.now();
      const p = location.pathname;
      if (p !== yol.current) {
        yol.current = p;
        sayfaSn.current = 0;
        martiZari.current = false;
      }

      const bosta = simdi - sonEtkinlik.current;
      if (bosta > KOPMA_MS) okumaSn.current = 0;
      if (YASAK.test(p)) return;

      const okumalar = document.querySelectorAll("[data-readable]");
      const okuyor = okumalar.length > 0 && bosta < ETKIN_ESIGI_MS;
      if (okuyor) {
        okumaSn.current += TIK_MS / 1000;
        sayfaSn.current += TIK_MS / 1000;
      }

      if (aktifRef.current || bosta > ETKIN_ESIGI_MS) return;

      const bugun = dayKey();
      const log = readLog();

      // 1) Yunus — toplam tekrar kartı bir eşiği geçti
      const toplam = Object.values(log).reduce((n, g) => n + (g?.kart ?? 0), 0);
      for (const e of KART_ESIKLERI) {
        if (toplam >= e && !kutlandiMi(`yunus:kart-${e}`)) {
          // Yalnızca EN BÜYÜK geçilen eşik kutlanır; eskiler sessizce işaretlenir
          // ki ilk kurulumda art arda beş yunus atlamasın.
          const buyuk = [...KART_ESIKLERI].reverse().find((x) => toplam >= x)!;
          if (e !== buyuk) { kutlandiIsaretle(`yunus:kart-${e}`); continue; }
          goster("yunus", YAZILAR.yunus(e), `${e}. tekrar kartı`, `yunus:kart-${e}`);
          return;
        }
      }

      // 2) Papağan — seri bugün bir eşiğe ulaştı
      if (log[bugun]?.kart) {
        const seri = streakOf(log);
        const anahtar = `papagan:seri-${seri}:${bugun}`;
        if (SERI_ESIKLERI.includes(seri) && !kutlandiMi(anahtar)) {
          goster("papagan", YAZILAR.papagan(seri), `${seri} günlük seri`, anahtar);
          return;
        }
      }

      if (!okuyor) return;

      // 3) Fener — gece yarısından sonra 10 dakika okuma
      const saat = new Date().getHours();
      if (saat < 5 && okumaSn.current >= FENER_SN && !kutlandiMi(`fener:${bugun}`)) {
        goster("fener", YAZILAR.fener(0), "gece okuması", `fener:${bugun}`);
        return;
      }

      // 4) Yelkenli — 25 dakika kesintisiz okuma
      if (okumaSn.current >= YELKENLI_SN && !kutlandiMi(`yelkenli:${bugun}`)) {
        goster("yelkenli", YAZILAR.yelkenli(25), "25 dakika kesintisiz okuma", `yelkenli:${bugun}`);
        return;
      }

      if (sayfaSn.current < SAYFA_ASGARI_SN) return;

      // 5) Okaliptüs — konunun sonuna varıldı
      const son = okumalar[okumalar.length - 1].getBoundingClientRect();
      if (
        son.height > 0 &&
        son.bottom <= innerHeight + 40 &&
        !kutlandiMi(`okaliptus:${bugun}:${p}`) &&
        bugunSayisi("okaliptus", bugun, dayKey) < OKALIPTUS_GUNLUK
      ) {
        goster("okaliptus", YAZILAR.okaliptus(0), "konunun sonu", `okaliptus:${bugun}:${p}`);
        return;
      }

      // 6) Martı — sayfa başına tek zar, üç günde en fazla bir
      if (!martiZari.current) {
        martiZari.current = true;
        if (Math.random() < MARTI_OLASILIK && simdi - sonGorulme("marti") > MARTI_ARA_MS) {
          goster("marti", YAZILAR.marti(0), "rastgele");
        }
      }
    };

    const id = window.setInterval(tik, TIK_MS);
    return () => window.clearInterval(id);
  }, [status, goster]);

  if (!aktif) return null;

  const bittiMi = (e: React.AnimationEvent) => {
    if (e.target === e.currentTarget) bitir();
  };

  return (
    <div
      aria-hidden="true"
      data-gizli={gizli ? "1" : undefined}
      className="deniz-surpriz pointer-events-none fixed inset-x-0 bottom-0 z-[35] h-36 overflow-hidden"
    >
      <Canli tur={aktif.tur} onBitti={bittiMi} key={aktif.anahtar} />
      <div
        key={`y${aktif.anahtar}`}
        className="deniz-yazi absolute bottom-3 left-1/2 w-max max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-2xl border border-sky-100 bg-white/95 px-4 py-2 text-center shadow-lg"
      >
        <div className="text-[12px] font-semibold leading-snug text-slate-700">{aktif.yazi}</div>
        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-sky-700">
          Seyir defterine işlendi
        </div>
      </div>
    </div>
  );
}

const YAZILAR: Record<Tur, (n: number) => string> = {
  yelkenli: (n) => `${n} dakikadır kesintisiz okuyorsun — ufukta bir yelkenli geçiyor.`,
  papagan: (n) => `${n} gündür aralıksız çalışıyorsun. Bir papağan tebrike geldi.`,
  fener: () => "Gece vardiyası. Fener senin için yanıyor.",
  okaliptus: () => "Konunun sonuna vardın. Okaliptüs rüzgârda sallanıyor.",
  yunus: (n) => `${n}. tekrar kartı! Bir yunus selam verdi.`,
  marti: () => "Bir martı süzülüp geçti. Nadir görülür — şanslı gün.",
};

/* ── Canlılar ──────────────────────────────────────────────────────────── */

type CanliProps = { tur: Tur; onBitti: (e: React.AnimationEvent) => void };

function Canli({ tur, onBitti }: CanliProps) {
  if (tur === "yelkenli") {
    return (
      <div className="deniz-yelkenli-yol absolute bottom-2 left-0" onAnimationEnd={onBitti}>
        <YelkenliSvg className="deniz-salinim h-9 w-9 opacity-80" />
      </div>
    );
  }
  if (tur === "papagan") {
    return (
      <div className="deniz-papagan-yol absolute bottom-3 left-4" onAnimationEnd={onBitti}>
        <span className="deniz-salinim block text-[30px] leading-none">🦜</span>
      </div>
    );
  }
  if (tur === "marti") {
    return (
      <div className="deniz-marti-yol absolute bottom-16 left-0" onAnimationEnd={onBitti}>
        <MartiSvg className="deniz-suzulus h-5 w-12 text-slate-500" />
      </div>
    );
  }
  if (tur === "fener") {
    return (
      <div className="deniz-fener-omur absolute bottom-0 right-3" onAnimationEnd={onBitti}>
        <FenerSvg className="h-24 w-16" />
      </div>
    );
  }
  if (tur === "okaliptus") {
    return (
      <div className="deniz-okaliptus-omur absolute bottom-0 left-0" onAnimationEnd={onBitti}>
        <OkaliptusSvg className="deniz-sallanti h-28 w-24" />
      </div>
    );
  }
  return (
    <div className="deniz-yunus-yol absolute bottom-0 left-0" onAnimationEnd={onBitti}>
      <span className="deniz-yunus-sicrama block text-[30px] leading-none">🐬</span>
    </div>
  );
}

export function YelkenliSvg({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40">
      <path d="M20 4 L20 28 L7 28 Z" fill="#ffffff" stroke="#1a3a6b" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M22 9 L22 28 L32 28 Z" fill="#bfe8e6" stroke="#1a3a6b" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5 30 H35 L31 36 H9 Z" fill="#1a3a6b" />
      <path d="M20 4 L26 6 L20 8" fill="#f5b82e" />
    </svg>
  );
}

export function MartiSvg({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 20">
      <path
        d="M2 12 q10 -10 22 0 q12 -10 22 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FenerSvg({ className = "", isik = true }: { className?: string; isik?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 64 96" overflow="visible">
      {/* ışık hüzmesi — fenerin lambasından döner */}
      {isik && <g className="deniz-fener-isik" style={{ transformOrigin: "32px 22px" }}>
        <path d="M32 22 L-40 8 L-40 36 Z" fill="#fde68a" opacity="0.35" />
        <path d="M32 22 L104 8 L104 36 Z" fill="#fde68a" opacity="0.35" />
      </g>}
      <path d="M22 92 L26 30 H38 L42 92 Z" fill="#ffffff" stroke="#1a3a6b" strokeWidth="1.5" />
      <path d="M24.6 52 H39.4 L40.2 64 H23.8 Z" fill="#dc2626" opacity="0.85" />
      <path d="M23.2 76 H40.8 L41.5 88 H22.5 Z" fill="#dc2626" opacity="0.85" />
      <rect x="25" y="16" width="14" height="14" rx="1" fill="#fde68a" stroke="#1a3a6b" strokeWidth="1.5" />
      <path d="M22 16 H42 L32 6 Z" fill="#1a3a6b" />
      <rect x="20" y="29" width="24" height="3" rx="1" fill="#1a3a6b" />
    </svg>
  );
}

export function OkaliptusSvg({ className = "" }: { className?: string }) {
  // Okaliptüs yaprağı yuvarlak ve gümüşi yeşil; dal köşeden yukarı uzanır.
  const yapraklar: [number, number, number][] = [
    [18, 88, -30], [30, 76, 20], [22, 64, -35], [40, 58, 25], [30, 46, -25], [48, 40, 30], [40, 28, -20], [58, 22, 20],
  ];
  return (
    <svg className={className} viewBox="0 0 90 110" style={{ transformOrigin: "0% 100%" }}>
      <path d="M0 110 C 20 90, 30 70, 38 50 S 56 20, 66 12" fill="none" stroke="#8b6b4a" strokeWidth="2.5" strokeLinecap="round" />
      {yapraklar.map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="9" ry="6" transform={`rotate(${r} ${x} ${y})`} fill={i % 2 ? "#7fa89a" : "#9dbfb2"} stroke="#5f8a7c" strokeWidth="0.8" />
      ))}
    </svg>
  );
}
