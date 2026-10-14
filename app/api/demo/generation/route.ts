import { demoError, demoJson } from "@/lib/demo/http";
import { DemoRpcError, anonDemoClient, callDemoRpc } from "@/lib/demo/rpc";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const generationId = await callDemoRpc(anonDemoClient(), "demo_current_generation", {});
    return demoJson({ generation_id: generationId });
  } catch (error) {
    if (error instanceof DemoRpcError) return demoError(error.code);
    console.error("demo_current_generation", error);
    return demoError("failed");
  }
}
