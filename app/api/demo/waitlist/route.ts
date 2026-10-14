import { isUuid, readObject, withUser } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readObject(request);
  const generationId = body?.generation_id;
  const localPart = body?.local_part;
  return withUser(
    request,
    "demo_waitlist_signup",
    isUuid(generationId) && typeof localPart === "string" && typeof body?.launch_consent === "boolean" && typeof body.marketing_consent === "boolean"
      ? {
          p_generation_id: generationId,
          p_local_part: localPart,
          p_launch_consent: body.launch_consent,
          p_marketing_consent: body.marketing_consent,
        }
      : null,
  );
}
