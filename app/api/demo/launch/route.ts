import { isUuid, readObject, withUser } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await readObject(request);
  const generationId = body?.generation_id;
  return withUser(
    request,
    "demo_simulate_launch",
    isUuid(generationId) ? { p_generation_id: generationId } : null,
  );
}
