export type TCreateCategory = {
  name: string;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
};

export type TUpdateCategory = Partial<TCreateCategory>;
