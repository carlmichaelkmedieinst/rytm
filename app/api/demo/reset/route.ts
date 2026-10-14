import { withPresenter } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return withPresenter(request, "demo_reset_generation");
}
