// FILE: web/app/sections/[section]/page.tsx
export const revalidate = 3600;

import SectionPageView from "../_SectionPage";

export default async function Page({ params }: { params: { section: string } }) {
  const section = decodeURIComponent(params.section || "").trim();
  return <SectionPageView section={section} lang="tr" />;
}
