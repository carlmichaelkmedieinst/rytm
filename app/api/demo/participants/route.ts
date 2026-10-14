import { isUuid, readObject, withUser } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readObject(request);
  const generationId = body?.generation_id;
  const qrId = body?.qr_id;
  return withUser(
    request,
    "demo_ensure_participant",
    isUuid(generationId) && typeof qrId === "string"
      ? { p_generation_id: generationId, p_qr_id: qrId }
      : null,
  );
}
