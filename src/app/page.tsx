import BundleBuilder from "@/components/builder/BundleBuilder";
import data from "@/data/products.json";
import { Product } from "@/types";

export default function Home() {
  return (
    <BundleBuilder
      products={data.products as Product[]}
      steps={data.steps as { id: number; title: string; nextLabel?: string; category: "cameras" | "sensors" | "accessories" | "plans" }[]}
    />
  );
}
