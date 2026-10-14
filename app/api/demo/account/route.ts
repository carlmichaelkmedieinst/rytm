import { isUuid, readObject, withUser } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readObject(request);
  const generationId = body?.generation_id;
  const token = body?.registration_token;
  return withUser(
    request,
    "demo_link_account",
    isUuid(generationId) && typeof token === "string"
      ? { p_generation_id: generationId, p_registration_token: token }
      : null,
  );
}
