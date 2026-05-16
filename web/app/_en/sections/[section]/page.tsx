// FILE: web/app/en/sections/[section]/page.tsx
export const revalidate = 3600;

import SectionPageView from "@/app/sections/_SectionPage";

export default function EnSectionDetail({ params }: { params: { section: string } }) {
  const section = decodeURIComponent(params.section || "").trim();
  return <SectionPageView section={section} lang="en" />;
}
