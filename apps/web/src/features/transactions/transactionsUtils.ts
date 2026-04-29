import type { Variants } from "framer-motion";
import {
  SPENDING_CATEGORIES,
  type SpendingCategory,
} from "@/lib/finance";

export type TransactionRow = {
  id: string;
  date: string;
  merchant: string;
  category: SpendingCategory;
  amount: number;
};

export const transactionCategories: Array<SpendingCategory | "All"> = [
  "All",
  ...SPENDING_CATEGORIES,
];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: index * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function getImportSourceLabel(source: "csv" | "forwarded_email" | "receipt_image") {
  if (source === "csv") return "CSV import";
  if (source === "receipt_image") return "Receipt photo";
  return "Forwarded receipt";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("We could not read that image."));
    };
    reader.onerror = () => reject(new Error("We could not read that image."));
    reader.readAsDataURL(file);
  });
}

export async function optimizeReceiptImage(file: File) {
  const dataUrl = await fileToDataUrl(file);

  if (typeof window === "undefined") {
    return dataUrl;
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new window.Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("We could not open that receipt photo."));
    nextImage.src = dataUrl;
  });

  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
