import { withPresenter } from "@/lib/demo/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return withPresenter(request, "demo_backstage");
}
