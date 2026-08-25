export type TCreateReview = {
  itemId: string;
  rating: number;
  comment?: string;
  reviewerName?: string;
  reviewerEmail?: string;
};

export type TUpdateReview = {
  rating?: number;
  comment?: string;
};

export type TAdminUpdateReview = {
  isApproved?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
};
