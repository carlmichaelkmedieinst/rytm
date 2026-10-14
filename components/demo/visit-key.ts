type VisitSlot = { scope: string; key: string; holders: number };

let slot: VisitSlot | null = null;
let releaseTimer: ReturnType<typeof setTimeout> | null = null;

export function holdVisitKey(scope: string) {
  if (releaseTimer) {
    clearTimeout(releaseTimer);
    releaseTimer = null;
  }
  if (!slot || slot.scope !== scope) {
    slot = { scope, key: crypto.randomUUID(), holders: 0 };
  }
  slot.holders += 1;
  return slot.key;
}

export function releaseVisitKey(scope: string) {
  if (!slot || slot.scope !== scope) return;
  slot.holders = Math.max(0, slot.holders - 1);
  if (slot.holders > 0) return;
  releaseTimer = setTimeout(() => {
    if (slot?.holders === 0 && slot.scope === scope) slot = null;
  }, 50);
}
