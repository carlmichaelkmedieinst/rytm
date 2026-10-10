import { useEffect, useRef, useState } from "react";
import { bootUser } from "@/lib/data";
import { getSupabase } from "@/lib/supabase/client";
import type { Snapshot } from "@/lib/types";

async function anonymousUserId() {
  const supabase = getSupabase();
  const sessionResult = await supabase.auth.getSession();
  if (sessionResult.error) throw sessionResult.error;

  const existing = sessionResult.data.session?.user.id;
  if (existing) return existing;

  const signedIn = await supabase.auth.signInAnonymously();
  if (signedIn.error) throw signedIn.error;
  const userId = signedIn.data.user?.id;
  if (!userId) throw new Error("Anonym session saknas");
  return userId;
}

export function useSnapshot() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const pendingRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const next = await bootUser(await anonymousUserId());
        if (!cancelled) setSnapshot(next);
      } catch (caught) {
        if (!cancelled) {
          setAuthError(caught instanceof Error ? caught.message : "Sessionen kunde inte startas");
        }
      }
    }

    void start();
    return () => {
      cancelled = true;
    };
  }, []);

  function follow(action: Promise<Snapshot>) {
    pendingRef.current += 1;
    setBusy(true);
    setError(null);
    void action
      .then((next) => {
        setSnapshot(next);
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Något gick fel");
      })
      .finally(() => {
        pendingRef.current -= 1;
        if (pendingRef.current === 0) setBusy(false);
      });
  }

  async function run(action: () => Promise<Snapshot>) {
    if (busyRef.current) return null;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const next = await action();
      setSnapshot(next);
      return next;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Något gick fel");
      return null;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return { snapshot, busy, error, authError, follow, run };
}
