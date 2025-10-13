export type Product = {
  id: string;
  slug: string;
  nameTa: string;
  nameEn: string;
  descriptionTa?: string;
  descriptionEn?: string;
  imageUrl?: string;
  pricePaisa: number;
  unit: string;
  inStock: boolean;
  variants?: { unit: string; pricePaisa: number }[];
};

export const sampleProducts: Product[] = [
  {
    id: "1",
    slug: "nallaennai-1l",
    nameTa: "நல்லெண்ணெய்",
    nameEn: "Groundnut Oil",
    descriptionTa: "மரபுத் தயாரிப்பு, சுவை நிறைந்தது.",
    descriptionEn: "Traditional, flavorful cold-pressed groundnut oil.",
    imageUrl: "/images/groundnut.svg",
    pricePaisa: 45000,
    unit: "1L",
    variants: [
      { unit: "500ml", pricePaisa: 24000 },
      { unit: "1L", pricePaisa: 45000 },
      { unit: "2L", pricePaisa: 88000 },
    ],
    inStock: true,
  },
  {
    id: "2",
    slug: "yellennai-1l",
    nameTa: "எள்ளெண்ணெய்",
    nameEn: "Sesame Oil",
    descriptionTa: "மென்மையான மணம், ஆரோக்கியத்திற்கு நல்லது.",
    descriptionEn: "Aromatic and healthy cold-pressed sesame oil.",
    imageUrl: "/images/sesame.svg",
    pricePaisa: 52000,
    unit: "1L",
    variants: [
      { unit: "500ml", pricePaisa: 28000 },
      { unit: "1L", pricePaisa: 52000 },
      { unit: "2L", pricePaisa: 102000 },
    ],
    inStock: true,
  },
  {
    id: "3",
    slug: "kadugu-500ml",
    nameTa: "கடுகு எண்ணெய்",
    nameEn: "Mustard Oil",
    descriptionTa: "சிறந்த சுவை மற்றும் குணம்.",
    descriptionEn: "Great flavor and properties.",
    imageUrl: "/images/mustard.svg",
    pricePaisa: 28000,
    unit: "500ml",
    variants: [
      { unit: "500ml", pricePaisa: 28000 },
      { unit: "1L", pricePaisa: 52000 },
    ],
    inStock: true,
  },
  {
    id: "4",
    slug: "thengai-1l",
    nameTa: "தேங்காய் எண்ணெய்",
    nameEn: "Coconut Oil",
    descriptionTa: "பசுமை மற்றும் சுவை.",
    descriptionEn: "Fresh and tasty cold-pressed coconut oil.",
    imageUrl: "/images/groundnut.svg",
    pricePaisa: 42000,
    unit: "1L",
    variants: [
      { unit: "500ml", pricePaisa: 23000 },
      { unit: "1L", pricePaisa: 42000 },
      { unit: "2L", pricePaisa: 83000 },
    ],
    inStock: true,
  },
];

export function formatPricePaisa(paisa: number, locale: "ta" | "en" = "ta") {
  const rupees = paisa / 100;
  return new Intl.NumberFormat(locale === "ta" ? "ta-IN" : "en-IN", { style: "currency", currency: "INR" }).format(rupees);
}
