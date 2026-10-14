import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { matchDemoError, type DemoErrorCode } from "@/lib/demo/errors";
import { publicSupabaseEnv } from "@/lib/supabase/public-env";

export class DemoRpcError extends Error {
  code: DemoErrorCode;

  constructor(code: DemoErrorCode) {
    super(code);
    this.code = code;
  }
}

function client(headers?: Record<string, string>) {
  const { url, key } = publicSupabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: headers ? { headers } : undefined,
  });
}

export function anonDemoClient() {
  return client();
}

export function userDemoClient(accessToken: string) {
  return client({ Authorization: `Bearer ${accessToken}` });
}

export async function callDemoRpc(
  supabase: SupabaseClient,
  fn: string,
  args: Record<string, unknown>,
) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const code = matchDemoError(error.message) ?? (error.code === "42501" ? "forbidden" : "failed");
    if (code === "failed") console.error(fn, error.code, error.message);
    throw new DemoRpcError(code);
  }
  return data;
}
