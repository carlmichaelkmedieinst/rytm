import { isUuid, readObject, withUser } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readObject(request);
  const generationId = body?.generation_id;
  const qrId = body?.qr_id;
  const visitKey = body?.client_visit_key;
  return withUser(
    request,
    "demo_register_visit",
    isUuid(generationId) && typeof qrId === "string" && isUuid(visitKey)
      ? { p_generation_id: generationId, p_qr_id: qrId, p_client_visit_key: visitKey }
      : null,
  );
}
