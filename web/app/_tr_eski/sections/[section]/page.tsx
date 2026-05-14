// FILE: web/app/tr/sections/[section]/page.tsx
export const revalidate = 0;
export const dynamic = "force-dynamic";

import SectionDetail from "@/app/sections/[section]/page";

export default function TrSectionDetail(props: any) {
  return <SectionDetail {...props} />;
}
