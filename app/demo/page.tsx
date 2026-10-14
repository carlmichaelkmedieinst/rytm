import QRCode from "qrcode";
import type { Metadata } from "next";
import { PresenterScreen } from "@/components/demo/PresenterScreen";
import { presentationUrl, publicDemoBase } from "@/lib/demo/public-url";

export const metadata: Metadata = {
  title: "Rytm · Skaffa Rytm",
};

function svgMarkup(svg: string) {
  return svg.replace(/<\?xml[\s\S]*?\?>/, "").trim();
}

export default async function DemoPage() {
  const base = publicDemoBase(process.env.NEXT_PUBLIC_DEMO_BASE_URL);
  const url = base ? presentationUrl(base) : null;
  const svg = url
    ? svgMarkup(
        await QRCode.toString(url, {
          type: "svg",
          margin: 4,
          errorCorrectionLevel: "H",
          width: 720,
          color: { dark: "#3a2230", light: "#ffffff" },
        }),
      )
    : null;

  return <PresenterScreen url={url} svg={svg} />;
}
