export type TCreateBanner = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  link?: string;
  isActive?: boolean;
  order?: number;
};

export type TUpdateBanner = Partial<TCreateBanner>;
