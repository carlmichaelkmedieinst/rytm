import { isUuid, readObject, withUser } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readObject(request);
  const generationId = body?.generation_id;
  const step = body?.step;
  return withUser(
    request,
    "demo_register_workout",
    isUuid(generationId) && (step === "first" || step === "second")
      ? { p_generation_id: generationId, p_step: step }
      : null,
  );
}
