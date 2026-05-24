import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { BannerRoutes } from '../modules/banner/banner.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { ItemRoutes } from '../modules/item/item.route';
import { CouponRoutes } from '../modules/coupon/coupon.route';
import { OrderRoutes } from '../modules/order/order.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { SettingRoutes } from '../modules/setting/setting.route';
import { ContactRoutes } from '../modules/contact/contact.route';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/banners', route: BannerRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/items', route: ItemRoutes },
  { path: '/coupons', route: CouponRoutes },
  { path: '/orders', route: OrderRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/settings', route: SettingRoutes },
  { path: '/contacts', route: ContactRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
