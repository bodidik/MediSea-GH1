import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateId() {
  return "mk_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const LANG_PREFIXES = ["/tr", "/en"] as const;

// Prefixsizken dil altına taşımak istediğimiz UI kökleri
const UI_BASE_PREFIXLESS = [
  "/sections",
  "/topics",
  "/tools",
  "/guidelines",
  "/premium",
  "/programs",
  "/about",
  "/privacy",
  "/contact",
] as const;

function hasLangPrefix(pathname: string) {
  return pathname === "/tr" || pathname.startsWith("/tr/") || pathname === "/en" || pathname.startsWith("/en/");
}

function shouldRedirectToLang(pathname: string) {
  // "/" zaten ayrıca ele alınıyor
  if (pathname === "/") return false;

  // admin’i asla dil altına itme
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;

  // belirlediğimiz prefixsiz UI kökleri
  return UI_BASE_PREFIXLESS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Güvenli: matcher zaten hariç tutuyor ama yine de kalsın
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const hasUid = req.cookies.get("mk_uid");
  const langCookie = req.cookies.get("mk_lang")?.value; // "tr" | "en" | undefined

  const country = req.geo?.country || req.headers.get("x-vercel-ip-country") || "";
  const decided =
    langCookie === "tr" || langCookie === "en"
      ? langCookie
      : country === "TR"
        ? "tr"
        : "en";

  // 1) /tr veya /en altındaysa: redirect yok, sadece uid gerekirse set
  if (hasLangPrefix(pathname)) {
    const res = NextResponse.next();
    if (!hasUid) {
      res.cookies.set({
        name: "mk_uid",
        value: generateId(),
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  }

  // 2) "/" ise: dile göre /tr veya /en
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/${decided}`;
    const redirectRes = NextResponse.redirect(url);

    if (!hasUid) {
      redirectRes.cookies.set({
        name: "mk_uid",
        value: generateId(),
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return redirectRes;
  }

  // 3) Prefixsiz kritik UI kökleri ise: /{lang}{pathname}
  if (shouldRedirectToLang(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${decided}${pathname}`;
    const redirectRes = NextResponse.redirect(url);

    if (!hasUid) {
      redirectRes.cookies.set({
        name: "mk_uid",
        value: generateId(),
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return redirectRes;
  }

  // 4) Diğer her şey: redirect yok; sadece uid set
  const res = NextResponse.next();
  if (!hasUid) {
    res.cookies.set({
      name: "mk_uid",
      value: generateId(),
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
