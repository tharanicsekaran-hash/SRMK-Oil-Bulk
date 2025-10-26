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
    slug: "groundnut-oil",
    nameTa: "கடலையெண்ணெய்",
    nameEn: "Groundnut Oil",
    descriptionTa: "மரபுத் தயாரிப்பு, சுவை நிறைந்தது.",
    descriptionEn: "Traditional, flavorful cold-pressed groundnut oil.",
    imageUrl: "/images/groundnut.jpg",
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
    slug: "gingelly-oil-sugarcane",
    nameTa: "எள்ளெண்ணெய் (கரும்புச் சேர்க்கப்பட்டது)",
    nameEn: "Gingelly Oil (Sugarcane added)",
    descriptionTa: "மென்மையான மணம், ஆரோக்கியத்திற்கு நல்லது.",
    descriptionEn: "Aromatic and healthy cold-pressed sesame oil.",
    imageUrl: "/images/gingelly_sugarcane.jpg",
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
    slug: "gingelly-oil-jaggery",
    nameTa: "எள்ளெண்ணெய் (வெல்லம் சேர்க்கப்பட்டது)",
    nameEn: "Gingelly Oil (Jaggery added)",
    descriptionTa: "சிறந்த சுவை மற்றும் குணம்.",
    descriptionEn: "Great flavor and properties.",
    imageUrl: "/images/gingelly_jaggery.jpg",
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
    imageUrl: "/images/coconut.jpg",
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
