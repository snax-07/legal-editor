"use client"
import dynamic from "next/dynamic";

const FinalLegalEditor = dynamic(
  () => import("../app/demo/pagenation"),
  { ssr: false } // 🔑 client-only
);

export default function Page() {
  return <FinalLegalEditor />;
}
