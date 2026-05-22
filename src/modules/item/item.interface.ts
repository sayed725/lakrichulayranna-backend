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
  tags?: string[];
};

export type TUpdateItem = Partial<TCreateItem>;
