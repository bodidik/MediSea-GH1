import { cookies } from "next/headers";

export async function planSync() {
  const cookieStore = await cookies();
  const externalId = cookieStore.get("mk_uid")?.value || "guest";
  const cookiePlan = cookieStore.get("plan")?.value || "V";
  return { externalId, cookiePlan };
}
