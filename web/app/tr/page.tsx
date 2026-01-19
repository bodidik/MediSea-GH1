// FILE: web/app/tr/page.tsx
export const revalidate = 0;
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function TrHome() {
  redirect("/tr/sections");
}
