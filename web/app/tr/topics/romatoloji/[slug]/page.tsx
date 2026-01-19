import { redirect } from "next/navigation";

export default function TRRheumTopicRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/topics/romatoloji/${params.slug}`);
}
