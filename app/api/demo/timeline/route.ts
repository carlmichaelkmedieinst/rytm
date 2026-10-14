import { bearerToken, demoError, demoJson, isUuid } from "@/lib/demo/http";
import { DemoRpcError, callDemoRpc, userDemoClient } from "@/lib/demo/rpc";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = bearerToken(request);
  if (!token) return demoError("not_authenticated");
  const generationId = new URL(request.url).searchParams.get("generation_id");
  if (!isUuid(generationId)) return demoError("invalid_body");
  try {
    const data = await callDemoRpc(userDemoClient(token), "demo_my_timeline", {
      p_generation_id: generationId,
    });
    return demoJson(data);
  } catch (error) {
    if (error instanceof DemoRpcError) return demoError(error.code);
    console.error("demo_my_timeline", error);
    return demoError("failed");
  }
}
