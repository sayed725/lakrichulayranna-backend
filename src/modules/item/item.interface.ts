export type TCreateItem = {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  images: string[];
  categoryId: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  isSpicy?: boolean;
  weight?: string;
  tags?: string[];
};

export type TUpdateItem = Partial<TCreateItem>;
