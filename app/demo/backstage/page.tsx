import type { Metadata } from "next";
import { BackstageRoom } from "@/components/demo/BackstageRoom";

export const metadata: Metadata = {
  title: "Rytm · Backstage",
};

export default function BackstagePage() {
  return <BackstageRoom />;
}
