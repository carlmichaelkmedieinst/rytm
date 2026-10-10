import type { Metadata } from "next";
import { DemoApp } from "@/components/demo/DemoApp";

export const metadata: Metadata = {
  title: "Rytm · Marketing Automation-demo",
};

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 64) : "";
}

export default async function DemoPage({ searchParams }: PageProps<"/demo">) {
  const query = await searchParams;
  const qrId = param(query.qr_id);
  const source = qrId ? { qr_id: qrId, utm_content: param(query.utm_content) } : null;

  return <DemoApp source={source} />;
}
