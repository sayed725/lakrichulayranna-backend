import { PaymentMethod } from "../../generated/client";

export type TOrderItem = {
  itemId: string;
  quantity: number;
};

export type TCreateOrder = {
  items: TOrderItem[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
  deliveryAddress: any;
  notes?: string;
};
