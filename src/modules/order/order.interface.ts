import { PaymentMethod } from "../../generated/client";

export type TOrderItem = {
  itemId: string;
  quantity: number;
};

export type TCreateOrder = {
  items: TOrderItem[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
  deliveryAddress: {
    area: string;
    city: string;
    street: string;
    country: string;
  };
  isInsideDhaka?: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryCharge?: number;
  notes?: string;
};
