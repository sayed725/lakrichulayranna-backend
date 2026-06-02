export type TCreateBanner = {
  title?: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  order?: number;
  banner?: boolean;
  isActive?: boolean;
  categoryId?: string;
  buttonText?: string;
};

export type TUpdateBanner = Partial<TCreateBanner>;
