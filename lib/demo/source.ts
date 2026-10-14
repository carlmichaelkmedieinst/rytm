const QR_ID = /^[a-z0-9_]{1,64}$/;

const SOURCE_LABELS: Record<string, string> = {
  demo_presentation: "Presentationens QR-kod",
  rydeback_utegym: "Rydebäck utegym",
  unattributed: "Ingen angiven källa",
};

export function sourceFromParam(value: string) {
  const qrId = value.trim();
  if (!qrId) return { qrId: "unattributed", label: SOURCE_LABELS.unattributed };
  if (!QR_ID.test(qrId)) return null;
  return { qrId, label: SOURCE_LABELS[qrId] ?? qrId };
}

export function sourceLabel(qrId: string) {
  return SOURCE_LABELS[qrId] ?? qrId;
}
