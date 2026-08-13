var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express12 from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// src/config/env.ts
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
var envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().startsWith("postgresql://", "Must be a valid PostgreSQL connection string"),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().url().default("http://localhost:3000")
});
var _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error("\u274C Invalid environment variables:", _env.error.format());
  process.exit(1);
}
var env = _env.data;

// src/middlewares/rateLimiter.ts
import rateLimit from "express-rate-limit";
var globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again later." }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts, please try again later." }
});
var orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many order creation attempts, please try again later." }
});
var contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many contact form submissions, please try again later." }
});
var adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many admin requests, please try again later." }
});

// src/middlewares/globalErrorHandler.ts
import { ZodError } from "zod";

// src/errors/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/errors/handleZodError.ts
var handleZodError = (err) => {
  const statusCode = 400;
  const message = err.issues.map((issue) => `${String(issue.path[issue.path.length - 1])} is ${issue.message}`).join(". ");
  return { statusCode, message };
};
var handleZodError_default = handleZodError;

// src/errors/handlePrismaError.ts
var handlePrismaError = (err) => {
  let message = "Database Error";
  let statusCode = 400;
  if (err.code === "P2002") {
    message = `Duplicate field value: ${err.meta?.target}`;
    statusCode = 409;
  } else if (err.code === "P2025") {
    message = "Record not found";
    statusCode = 404;
  }
  return { statusCode, message };
};
var handlePrismaError_default = handlePrismaError;

// src/constants/messages.ts
var Messages = {
  SERVER_ERROR: "Internal Server Error",
  NOT_FOUND: "Resource Not Found",
  UNAUTHORIZED: "Unauthorized Access",
  FORBIDDEN: "Forbidden",
  VALIDATION_ERROR: "Validation Failed",
  SUCCESS: "Operation Successful"
};

// src/generated/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.8.0",
  "engineVersion": "3c6e192761c0362d496ed980de936e2f3cebcd3a",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../src/generated"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nenum Role {\n  ADMIN\n  CUSTOMER\n}\n\nenum DiscountType {\n  PERCENTAGE\n  FIXED\n}\n\nenum OrderStatus {\n  PENDING\n  CONFIRMED\n  PREPARING\n  READY\n  DELIVERED\n  CANCELLED\n}\n\nenum PaymentMethod {\n  COD\n  ONLINE\n}\n\nenum PaymentStatus {\n  PENDING\n  PAID\n  FAILED\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  BANNED\n}\n\nmodel User {\n  id        String     @id @default(uuid())\n  name      String\n  email     String     @unique\n  password  String\n  role      Role       @default(CUSTOMER)\n  status    UserStatus @default(ACTIVE)\n  phone     String?\n  address   String?\n  isDeleted Boolean    @default(false)\n  deletedAt DateTime?\n  createdAt DateTime   @default(now())\n  updatedAt DateTime   @updatedAt\n  orders    Order[]\n  reviews   Review[]\n}\n\nmodel Category {\n  id          String   @id @default(uuid())\n  name        String\n  slug        String   @unique\n  imageUrl    String?\n  description String?\n  isActive    Boolean  @default(true)\n  isFeatured  Boolean  @default(false)\n  createdAt   DateTime @default(now())\n  items       Item[]\n  banners     Banner[]\n}\n\nmodel Item {\n  id                 String      @id @default(uuid())\n  name               String\n  slug               String      @unique\n  description        String\n  price              Float\n  discountPrice      Float?\n  imageUrl           String\n  images             String[]\n  categoryId         String\n  isSpicy            Boolean?\n  weight             String?\n  isDeleted          Boolean     @default(false)\n  deletedAt          DateTime?\n  isAvailable        Boolean     @default(true)\n  isFeatured         Boolean     @default(false)\n  isBestSelling      Boolean     @default(false)\n  isCategoryFeatured Boolean     @default(false)\n  isNew              Boolean     @default(false)\n  tags               String[]\n  createdAt          DateTime    @default(now())\n  category           Category    @relation(fields: [categoryId], references: [id])\n  orderItems         OrderItem[]\n  reviews            Review[]\n\n  @@index([categoryId])\n}\n\nmodel Coupon {\n  id                String       @id @default(uuid())\n  code              String       @unique\n  title             String\n  discountType      DiscountType @default(FIXED)\n  discountValue     Float\n  minOrderAmount    Float?       @default(0)\n  maxDiscountAmount Float?\n  expiryDate        DateTime\n  usageLimit        Int?\n  usedCount         Int          @default(0)\n  isActive          Boolean      @default(true)\n  description       String?\n  isDeleted         Boolean      @default(false)\n  deletedAt         DateTime?\n  createdAt         DateTime     @default(now())\n  updatedAt         DateTime     @updatedAt\n  orders            Order[]\n\n  @@map("coupons")\n}\n\nmodel Order {\n  id              String        @id @default(uuid())\n  orderNumber     String        @unique\n  userId          String?\n  customerName    String?\n  customerPhone   String?\n  customerEmail   String?\n  subtotal        Float\n  discountAmount  Float         @default(0)\n  deliveryCharge  Float         @default(0)\n  total           Float\n  couponId        String?\n  couponCode      String?\n  status          OrderStatus   @default(PENDING)\n  paymentMethod   PaymentMethod\n  paymentStatus   PaymentStatus @default(PENDING)\n  deliveryAddress Json\n  isInsideDhaka   Boolean       @default(true)\n  invoicePdf      String?\n  notes           String?\n  isDeleted       Boolean       @default(false)\n  deletedAt       DateTime?\n  createdAt       DateTime      @default(now())\n  updatedAt       DateTime      @updatedAt\n  coupon          Coupon?       @relation(fields: [couponId], references: [id])\n  user            User?         @relation(fields: [userId], references: [id])\n  items           OrderItem[]\n\n  @@index([userId])\n}\n\nmodel OrderItem {\n  id        String @id @default(uuid())\n  orderId   String\n  itemId    String\n  itemName  String\n  itemPrice Float\n  quantity  Int\n  total     Float\n  item      Item   @relation(fields: [itemId], references: [id])\n  order     Order  @relation(fields: [orderId], references: [id])\n\n  @@index([orderId])\n  @@index([itemId])\n}\n\nmodel Review {\n  id         String    @id @default(uuid())\n  userId     String\n  itemId     String\n  rating     Int\n  comment    String?\n  isFeatured Boolean   @default(false)\n  isApproved Boolean   @default(false)\n  isDeleted  Boolean   @default(false)\n  deletedAt  DateTime?\n  createdAt  DateTime  @default(now())\n  item       Item      @relation(fields: [itemId], references: [id])\n  user       User      @relation(fields: [userId], references: [id])\n\n  @@index([userId])\n  @@index([itemId])\n}\n\nmodel Banner {\n  id         String    @id @default(uuid())\n  title      String?\n  subtitle   String?\n  badge      String?\n  image      String?\n  order      Int?\n  banner     Boolean   @default(true)\n  isActive   Boolean   @default(true)\n  categoryId String?\n  buttonText String?\n  isDeleted  Boolean   @default(false)\n  deletedAt  DateTime?\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n  category   Category? @relation(fields: [categoryId], references: [id])\n\n  @@map("banners")\n}\n\nmodel Setting {\n  id           Int      @id @default(1)\n  siteName     String\n  tagline      String?\n  logoUrl      String?\n  phone        String\n  email        String\n  address      String\n  openTime     String\n  closeTime    String\n  facebookUrl  String?\n  instagramUrl String?\n  updatedAt    DateTime @updatedAt\n}\n\nmodel Contact {\n  id        String    @id @default(uuid())\n  name      String\n  email     String\n  subject   String\n  message   String\n  phone     String?\n  isDeleted Boolean   @default(false)\n  deletedAt DateTime?\n  isRead    Boolean   @default(false)\n  createdAt DateTime  @default(now())\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orders","kind":"object","type":"Order","relationName":"OrderToUser"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"items","kind":"object","type":"Item","relationName":"CategoryToItem"},{"name":"banners","kind":"object","type":"Banner","relationName":"BannerToCategory"}],"dbName":null},"Item":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"discountPrice","kind":"scalar","type":"Float"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"images","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"isSpicy","kind":"scalar","type":"Boolean"},{"name":"weight","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"isBestSelling","kind":"scalar","type":"Boolean"},{"name":"isCategoryFeatured","kind":"scalar","type":"Boolean"},{"name":"isNew","kind":"scalar","type":"Boolean"},{"name":"tags","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToItem"},{"name":"orderItems","kind":"object","type":"OrderItem","relationName":"ItemToOrderItem"},{"name":"reviews","kind":"object","type":"Review","relationName":"ItemToReview"}],"dbName":null},"Coupon":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"discountType","kind":"enum","type":"DiscountType"},{"name":"discountValue","kind":"scalar","type":"Float"},{"name":"minOrderAmount","kind":"scalar","type":"Float"},{"name":"maxDiscountAmount","kind":"scalar","type":"Float"},{"name":"expiryDate","kind":"scalar","type":"DateTime"},{"name":"usageLimit","kind":"scalar","type":"Int"},{"name":"usedCount","kind":"scalar","type":"Int"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"description","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"orders","kind":"object","type":"Order","relationName":"CouponToOrder"}],"dbName":"coupons"},"Order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderNumber","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"customerName","kind":"scalar","type":"String"},{"name":"customerPhone","kind":"scalar","type":"String"},{"name":"customerEmail","kind":"scalar","type":"String"},{"name":"subtotal","kind":"scalar","type":"Float"},{"name":"discountAmount","kind":"scalar","type":"Float"},{"name":"deliveryCharge","kind":"scalar","type":"Float"},{"name":"total","kind":"scalar","type":"Float"},{"name":"couponId","kind":"scalar","type":"String"},{"name":"couponCode","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"paymentMethod","kind":"enum","type":"PaymentMethod"},{"name":"paymentStatus","kind":"enum","type":"PaymentStatus"},{"name":"deliveryAddress","kind":"scalar","type":"Json"},{"name":"isInsideDhaka","kind":"scalar","type":"Boolean"},{"name":"invoicePdf","kind":"scalar","type":"String"},{"name":"notes","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"coupon","kind":"object","type":"Coupon","relationName":"CouponToOrder"},{"name":"user","kind":"object","type":"User","relationName":"OrderToUser"},{"name":"items","kind":"object","type":"OrderItem","relationName":"OrderToOrderItem"}],"dbName":null},"OrderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"itemId","kind":"scalar","type":"String"},{"name":"itemName","kind":"scalar","type":"String"},{"name":"itemPrice","kind":"scalar","type":"Float"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"total","kind":"scalar","type":"Float"},{"name":"item","kind":"object","type":"Item","relationName":"ItemToOrderItem"},{"name":"order","kind":"object","type":"Order","relationName":"OrderToOrderItem"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"itemId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isFeatured","kind":"scalar","type":"Boolean"},{"name":"isApproved","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"item","kind":"object","type":"Item","relationName":"ItemToReview"},{"name":"user","kind":"object","type":"User","relationName":"ReviewToUser"}],"dbName":null},"Banner":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"subtitle","kind":"scalar","type":"String"},{"name":"badge","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"order","kind":"scalar","type":"Int"},{"name":"banner","kind":"scalar","type":"Boolean"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"buttonText","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"category","kind":"object","type":"Category","relationName":"BannerToCategory"}],"dbName":"banners"},"Setting":{"fields":[{"name":"id","kind":"scalar","type":"Int"},{"name":"siteName","kind":"scalar","type":"String"},{"name":"tagline","kind":"scalar","type":"String"},{"name":"logoUrl","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"openTime","kind":"scalar","type":"String"},{"name":"closeTime","kind":"scalar","type":"String"},{"name":"facebookUrl","kind":"scalar","type":"String"},{"name":"instagramUrl","kind":"scalar","type":"String"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Contact":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","orders","_count","coupon","user","items","category","banners","orderItems","item","reviews","order","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Category.findUnique","Category.findUniqueOrThrow","Category.findFirst","Category.findFirstOrThrow","Category.findMany","Category.createOne","Category.createMany","Category.createManyAndReturn","Category.updateOne","Category.updateMany","Category.updateManyAndReturn","Category.upsertOne","Category.deleteOne","Category.deleteMany","Category.groupBy","Category.aggregate","Item.findUnique","Item.findUniqueOrThrow","Item.findFirst","Item.findFirstOrThrow","Item.findMany","Item.createOne","Item.createMany","Item.createManyAndReturn","Item.updateOne","Item.updateMany","Item.updateManyAndReturn","Item.upsertOne","Item.deleteOne","Item.deleteMany","_avg","_sum","Item.groupBy","Item.aggregate","Coupon.findUnique","Coupon.findUniqueOrThrow","Coupon.findFirst","Coupon.findFirstOrThrow","Coupon.findMany","Coupon.createOne","Coupon.createMany","Coupon.createManyAndReturn","Coupon.updateOne","Coupon.updateMany","Coupon.updateManyAndReturn","Coupon.upsertOne","Coupon.deleteOne","Coupon.deleteMany","Coupon.groupBy","Coupon.aggregate","Order.findUnique","Order.findUniqueOrThrow","Order.findFirst","Order.findFirstOrThrow","Order.findMany","Order.createOne","Order.createMany","Order.createManyAndReturn","Order.updateOne","Order.updateMany","Order.updateManyAndReturn","Order.upsertOne","Order.deleteOne","Order.deleteMany","Order.groupBy","Order.aggregate","OrderItem.findUnique","OrderItem.findUniqueOrThrow","OrderItem.findFirst","OrderItem.findFirstOrThrow","OrderItem.findMany","OrderItem.createOne","OrderItem.createMany","OrderItem.createManyAndReturn","OrderItem.updateOne","OrderItem.updateMany","OrderItem.updateManyAndReturn","OrderItem.upsertOne","OrderItem.deleteOne","OrderItem.deleteMany","OrderItem.groupBy","OrderItem.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","Review.groupBy","Review.aggregate","Banner.findUnique","Banner.findUniqueOrThrow","Banner.findFirst","Banner.findFirstOrThrow","Banner.findMany","Banner.createOne","Banner.createMany","Banner.createManyAndReturn","Banner.updateOne","Banner.updateMany","Banner.updateManyAndReturn","Banner.upsertOne","Banner.deleteOne","Banner.deleteMany","Banner.groupBy","Banner.aggregate","Setting.findUnique","Setting.findUniqueOrThrow","Setting.findFirst","Setting.findFirstOrThrow","Setting.findMany","Setting.createOne","Setting.createMany","Setting.createManyAndReturn","Setting.updateOne","Setting.updateMany","Setting.updateManyAndReturn","Setting.upsertOne","Setting.deleteOne","Setting.deleteMany","Setting.groupBy","Setting.aggregate","Contact.findUnique","Contact.findUniqueOrThrow","Contact.findFirst","Contact.findFirstOrThrow","Contact.findMany","Contact.createOne","Contact.createMany","Contact.createManyAndReturn","Contact.updateOne","Contact.updateMany","Contact.updateManyAndReturn","Contact.upsertOne","Contact.deleteOne","Contact.deleteMany","Contact.groupBy","Contact.aggregate","AND","OR","NOT","id","name","email","subject","message","phone","isDeleted","deletedAt","isRead","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","siteName","tagline","logoUrl","address","openTime","closeTime","facebookUrl","instagramUrl","updatedAt","title","subtitle","badge","image","banner","isActive","categoryId","buttonText","userId","itemId","rating","comment","isFeatured","isApproved","orderId","itemName","itemPrice","quantity","total","orderNumber","customerName","customerPhone","customerEmail","subtotal","discountAmount","deliveryCharge","couponId","couponCode","OrderStatus","status","PaymentMethod","paymentMethod","PaymentStatus","paymentStatus","deliveryAddress","isInsideDhaka","invoicePdf","notes","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","code","DiscountType","discountType","discountValue","minOrderAmount","maxDiscountAmount","expiryDate","usageLimit","usedCount","description","every","some","none","slug","price","discountPrice","imageUrl","images","isSpicy","weight","isAvailable","isBestSelling","isCategoryFeatured","isNew","tags","has","hasEvery","hasSome","password","Role","role","UserStatus","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "6QRkoAERAwAA0QIAIAwAAOsCACC2AQAA7gIAMLcBAAALABC4AQAA7gIAMLkBAQAAAAG6AQEApwIAIbsBAQAAAAG-AQEAqAIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAIdEBAQCoAgAh1gFAAKsCACH0AQAA8AKjAiKfAgEApwIAIaECAADvAqECIgEAAAABACAdBQAA9gIAIAYAAPcCACAHAADqAgAgtgEAAPECADC3AQAAAwAQuAEAAPECADC5AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAIdYBQACrAgAh3wEBAKgCACHpAQgAzgIAIeoBAQCnAgAh6wEBAKgCACHsAQEAqAIAIe0BAQCoAgAh7gEIAM4CACHvAQgAzgIAIfABCADOAgAh8QEBAKgCACHyAQEAqAIAIfQBAADyAvQBIvYBAADzAvYBIvgBAAD0AvgBIvkBAAD1AgAg-gEgAKkCACH7AQEAqAIAIfwBAQCoAgAhDAUAALkEACAGAAC1BAAgBwAAtwQAIMABAAD4AgAg3wEAAPgCACDrAQAA-AIAIOwBAAD4AgAg7QEAAPgCACDxAQAA-AIAIPIBAAD4AgAg-wEAAPgCACD8AQAA-AIAIB0FAAD2AgAgBgAA9wIAIAcAAOoCACC2AQAA8QIAMLcBAAADABC4AQAA8QIAMLkBAQAAAAG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAId8BAQCoAgAh6QEIAM4CACHqAQEAAAAB6wEBAKgCACHsAQEAqAIAIe0BAQCoAgAh7gEIAM4CACHvAQgAzgIAIfABCADOAgAh8QEBAKgCACHyAQEAqAIAIfQBAADyAvQBIvYBAADzAvYBIvgBAAD0AvgBIvkBAAD1AgAg-gEgAKkCACH7AQEAqAIAIfwBAQCoAgAhAwAAAAMAIAEAAAQAMAIAAAUAIBQDAADRAgAgtgEAAMwCADC3AQAABwAQuAEAAMwCADC5AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAIdYBQACrAgAh1wEBAKcCACHcASAAqQIAIYMCAQCnAgAhhQIAAM0ChQIihgIIAM4CACGHAggAzwIAIYgCCADPAgAhiQJAAKsCACGKAgIA0AIAIYsCAgCxAgAhjAIBAKgCACEBAAAABwAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAADACARAwAA0QIAIAwAAOsCACC2AQAA7gIAMLcBAAALABC4AQAA7gIAMLkBAQCnAgAhugEBAKcCACG7AQEApwIAIb4BAQCoAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh0QEBAKgCACHWAUAAqwIAIfQBAADwAqMCIp8CAQCnAgAhoQIAAO8CoQIiAQAAAAsAIAwLAADjAgAgDQAA7QIAILYBAADsAgAwtwEAAA0AELgBAADsAgAwuQEBAKcCACHgAQEApwIAIeUBAQCnAgAh5gEBAKcCACHnAQgAzgIAIegBAgCxAgAh6QEIAM4CACECCwAAtAQAIA0AALgEACAMCwAA4wIAIA0AAO0CACC2AQAA7AIAMLcBAAANABC4AQAA7AIAMLkBAQAAAAHgAQEApwIAIeUBAQCnAgAh5gEBAKcCACHnAQgAzgIAIegBAgCxAgAh6QEIAM4CACEDAAAADQAgAQAADgAwAgAADwAgGggAAOkCACAKAADqAgAgDAAA6wIAILYBAADnAgAwtwEAABEAELgBAADnAgAwuQEBAKcCACG6AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAId0BAQCnAgAh4wEgAKkCACGMAgEApwIAIZACAQCnAgAhkQIIAM4CACGSAggAzwIAIZMCAQCnAgAhlAIAANMCACCVAiAA6AIAIZYCAQCoAgAhlwIgAKkCACGYAiAAqQIAIZkCIACpAgAhmgIgAKkCACGbAgAA0wIAIAcIAAC2BAAgCgAAtwQAIAwAALMEACDAAQAA-AIAIJICAAD4AgAglQIAAPgCACCWAgAA-AIAIBoIAADpAgAgCgAA6gIAIAwAAOsCACC2AQAA5wIAMLcBAAARABC4AQAA5wIAMLkBAQAAAAG6AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAId0BAQCnAgAh4wEgAKkCACGMAgEApwIAIZACAQAAAAGRAggAzgIAIZICCADPAgAhkwIBAKcCACGUAgAA0wIAIJUCIADoAgAhlgIBAKgCACGXAiAAqQIAIZgCIACpAgAhmQIgAKkCACGaAiAAqQIAIZsCAADTAgAgAwAAABEAIAEAABIAMAIAABMAIBIIAADmAgAgDQIA0AIAIbYBAADlAgAwtwEAABUAELgBAADlAgAwuQEBAKcCACG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAIdcBAQCoAgAh2AEBAKgCACHZAQEAqAIAIdoBAQCoAgAh2wEgAKkCACHcASAAqQIAId0BAQCoAgAh3gEBAKgCACEJCAAAtgQAIA0AAPgCACDAAQAA-AIAINcBAAD4AgAg2AEAAPgCACDZAQAA-AIAINoBAAD4AgAg3QEAAPgCACDeAQAA-AIAIBIIAADmAgAgDQIA0AIAIbYBAADlAgAwtwEAABUAELgBAADlAgAwuQEBAAAAAb8BIACpAgAhwAFAAKoCACHCAUAAqwIAIdYBQACrAgAh1wEBAKgCACHYAQEAqAIAIdkBAQCoAgAh2gEBAKgCACHbASAAqQIAIdwBIACpAgAh3QEBAKgCACHeAQEAqAIAIQMAAAAVACABAAAWADACAAAXACANBwAA2QIAIAkAANoCACC2AQAA2AIAMLcBAAAZABC4AQAA2AIAMLkBAQCnAgAhugEBAKcCACHCAUAAqwIAIdwBIACpAgAh4wEgAKkCACGMAgEAqAIAIZACAQCnAgAhkwIBAKgCACEBAAAAGQAgAQAAABEAIAEAAAAVACADAAAADQAgAQAADgAwAgAADwAgDwYAAOQCACALAADjAgAgtgEAAOICADC3AQAAHgAQuAEAAOICADC5AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAId8BAQCnAgAh4AEBAKcCACHhAQIAsQIAIeIBAQCoAgAh4wEgAKkCACHkASAAqQIAIQQGAAC1BAAgCwAAtAQAIMABAAD4AgAg4gEAAPgCACAPBgAA5AIAIAsAAOMCACC2AQAA4gIAMLcBAAAeABC4AQAA4gIAMLkBAQAAAAG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHfAQEApwIAIeABAQCnAgAh4QECALECACHiAQEAqAIAIeMBIACpAgAh5AEgAKkCACEDAAAAHgAgAQAAHwAwAgAAIAAgAQAAAA0AIAEAAAAeACABAAAADQAgAwAAAB4AIAEAAB8AMAIAACAAIAEAAAADACABAAAAHgAgAQAAAAEAIAUDAADRAwAgDAAAswQAIL4BAAD4AgAgwAEAAPgCACDRAQAA-AIAIAMAAAALACABAAApADACAAABACADAAAACwAgAQAAKQAwAgAAAQAgAwAAAAsAIAEAACkAMAIAAAEAIA4DAACxBAAgDAAAsgQAILkBAQAAAAG6AQEAAAABuwEBAAAAAb4BAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHRAQEAAAAB1gFAAAAAAfQBAAAAowICnwIBAAAAAaECAAAAoQICARMAAC0AIAy5AQEAAAABugEBAAAAAbsBAQAAAAG-AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB0QEBAAAAAdYBQAAAAAH0AQAAAKMCAp8CAQAAAAGhAgAAAKECAgETAAAvADABEwAALwAwDgMAAJ0EACAMAACeBAAguQEBAPwCACG6AQEA_AIAIbsBAQD8AgAhvgEBAP0CACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHRAQEA_QIAIdYBQACAAwAh9AEAAJwEowIinwIBAPwCACGhAgAAmwShAiICAAAAAQAgEwAAMgAgDLkBAQD8AgAhugEBAPwCACG7AQEA_AIAIb4BAQD9AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh0QEBAP0CACHWAUAAgAMAIfQBAACcBKMCIp8CAQD8AgAhoQIAAJsEoQIiAgAAAAsAIBMAADQAIAIAAAALACATAAA0ACADAAAAAQAgGgAALQAgGwAAMgAgAQAAAAEAIAEAAAALACAGBAAAmAQAICAAAJoEACAhAACZBAAgvgEAAPgCACDAAQAA-AIAINEBAAD4AgAgD7YBAADbAgAwtwEAADsAELgBAADbAgAwuQEBAJUCACG6AQEAlQIAIbsBAQCVAgAhvgEBAJYCACG_ASAAlwIAIcABQACYAgAhwgFAAJkCACHRAQEAlgIAIdYBQACZAgAh9AEAAN0CowIinwIBAJUCACGhAgAA3AKhAiIDAAAACwAgAQAAOgAwHwAAOwAgAwAAAAsAIAEAACkAMAIAAAEAIA0HAADZAgAgCQAA2gIAILYBAADYAgAwtwEAABkAELgBAADYAgAwuQEBAAAAAboBAQCnAgAhwgFAAKsCACHcASAAqQIAIeMBIACpAgAhjAIBAKgCACGQAgEAAAABkwIBAKgCACEBAAAAPgAgAQAAAD4AIAQHAACWBAAgCQAAlwQAIIwCAAD4AgAgkwIAAPgCACADAAAAGQAgAQAAQQAwAgAAPgAgAwAAABkAIAEAAEEAMAIAAD4AIAMAAAAZACABAABBADACAAA-ACAKBwAAlAQAIAkAAJUEACC5AQEAAAABugEBAAAAAcIBQAAAAAHcASAAAAAB4wEgAAAAAYwCAQAAAAGQAgEAAAABkwIBAAAAAQETAABFACAIuQEBAAAAAboBAQAAAAHCAUAAAAAB3AEgAAAAAeMBIAAAAAGMAgEAAAABkAIBAAAAAZMCAQAAAAEBEwAARwAwARMAAEcAMAoHAAD6AwAgCQAA-wMAILkBAQD8AgAhugEBAPwCACHCAUAAgAMAIdwBIAD-AgAh4wEgAP4CACGMAgEA_QIAIZACAQD8AgAhkwIBAP0CACECAAAAPgAgEwAASgAgCLkBAQD8AgAhugEBAPwCACHCAUAAgAMAIdwBIAD-AgAh4wEgAP4CACGMAgEA_QIAIZACAQD8AgAhkwIBAP0CACECAAAAGQAgEwAATAAgAgAAABkAIBMAAEwAIAMAAAA-ACAaAABFACAbAABKACABAAAAPgAgAQAAABkAIAUEAAD3AwAgIAAA-QMAICEAAPgDACCMAgAA-AIAIJMCAAD4AgAgC7YBAADXAgAwtwEAAFMAELgBAADXAgAwuQEBAJUCACG6AQEAlQIAIcIBQACZAgAh3AEgAJcCACHjASAAlwIAIYwCAQCWAgAhkAIBAJUCACGTAgEAlgIAIQMAAAAZACABAABSADAfAABTACADAAAAGQAgAQAAQQAwAgAAPgAgAQAAABMAIAEAAAATACADAAAAEQAgAQAAEgAwAgAAEwAgAwAAABEAIAEAABIAMAIAABMAIAMAAAARACABAAASADACAAATACAXCAAA9AMAIAoAAPUDACAMAAD2AwAguQEBAAAAAboBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHdAQEAAAAB4wEgAAAAAYwCAQAAAAGQAgEAAAABkQIIAAAAAZICCAAAAAGTAgEAAAABlAIAAPIDACCVAiAAAAABlgIBAAAAAZcCIAAAAAGYAiAAAAABmQIgAAAAAZoCIAAAAAGbAgAA8wMAIAETAABbACAUuQEBAAAAAboBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHdAQEAAAAB4wEgAAAAAYwCAQAAAAGQAgEAAAABkQIIAAAAAZICCAAAAAGTAgEAAAABlAIAAPIDACCVAiAAAAABlgIBAAAAAZcCIAAAAAGYAiAAAAABmQIgAAAAAZoCIAAAAAGbAgAA8wMAIAETAABdADABEwAAXQAwFwgAANoDACAKAADbAwAgDAAA3AMAILkBAQD8AgAhugEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHdAQEA_AIAIeMBIAD-AgAhjAIBAPwCACGQAgEA_AIAIZECCACdAwAhkgIIAMIDACGTAgEA_AIAIZQCAADXAwAglQIgANgDACGWAgEA_QIAIZcCIAD-AgAhmAIgAP4CACGZAiAA_gIAIZoCIAD-AgAhmwIAANkDACACAAAAEwAgEwAAYAAgFLkBAQD8AgAhugEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHdAQEA_AIAIeMBIAD-AgAhjAIBAPwCACGQAgEA_AIAIZECCACdAwAhkgIIAMIDACGTAgEA_AIAIZQCAADXAwAglQIgANgDACGWAgEA_QIAIZcCIAD-AgAhmAIgAP4CACGZAiAA_gIAIZoCIAD-AgAhmwIAANkDACACAAAAEQAgEwAAYgAgAgAAABEAIBMAAGIAIAMAAAATACAaAABbACAbAABgACABAAAAEwAgAQAAABEAIAkEAADSAwAgIAAA1QMAICEAANQDACBCAADTAwAgQwAA1gMAIMABAAD4AgAgkgIAAPgCACCVAgAA-AIAIJYCAAD4AgAgF7YBAADSAgAwtwEAAGkAELgBAADSAgAwuQEBAJUCACG6AQEAlQIAIb8BIACXAgAhwAFAAJgCACHCAUAAmQIAId0BAQCVAgAh4wEgAJcCACGMAgEAlQIAIZACAQCVAgAhkQIIALgCACGSAggAyAIAIZMCAQCVAgAhlAIAANMCACCVAiAA1AIAIZYCAQCWAgAhlwIgAJcCACGYAiAAlwIAIZkCIACXAgAhmgIgAJcCACGbAgAA0wIAIAMAAAARACABAABoADAfAABpACADAAAAEQAgAQAAEgAwAgAAEwAgFAMAANECACC2AQAAzAIAMLcBAAAHABC4AQAAzAIAMLkBAQAAAAG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAIdcBAQCnAgAh3AEgAKkCACGDAgEAAAABhQIAAM0ChQIihgIIAM4CACGHAggAzwIAIYgCCADPAgAhiQJAAKsCACGKAgIA0AIAIYsCAgCxAgAhjAIBAKgCACEBAAAAbAAgAQAAAGwAIAYDAADRAwAgwAEAAPgCACCHAgAA-AIAIIgCAAD4AgAgigIAAPgCACCMAgAA-AIAIAMAAAAHACABAABvADACAABsACADAAAABwAgAQAAbwAwAgAAbAAgAwAAAAcAIAEAAG8AMAIAAGwAIBEDAADQAwAguQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAdYBQAAAAAHXAQEAAAAB3AEgAAAAAYMCAQAAAAGFAgAAAIUCAoYCCAAAAAGHAggAAAABiAIIAAAAAYkCQAAAAAGKAgIAAAABiwICAAAAAYwCAQAAAAEBEwAAcwAgELkBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHWAUAAAAAB1wEBAAAAAdwBIAAAAAGDAgEAAAABhQIAAACFAgKGAggAAAABhwIIAAAAAYgCCAAAAAGJAkAAAAABigICAAAAAYsCAgAAAAGMAgEAAAABARMAAHUAMAETAAB1ADARAwAAwwMAILkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh1gFAAIADACHXAQEA_AIAIdwBIAD-AgAhgwIBAPwCACGFAgAAwQOFAiKGAggAnQMAIYcCCADCAwAhiAIIAMIDACGJAkAAgAMAIYoCAgCMAwAhiwICAIYDACGMAgEA_QIAIQIAAABsACATAAB4ACAQuQEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHWAUAAgAMAIdcBAQD8AgAh3AEgAP4CACGDAgEA_AIAIYUCAADBA4UCIoYCCACdAwAhhwIIAMIDACGIAggAwgMAIYkCQACAAwAhigICAIwDACGLAgIAhgMAIYwCAQD9AgAhAgAAAAcAIBMAAHoAIAIAAAAHACATAAB6ACADAAAAbAAgGgAAcwAgGwAAeAAgAQAAAGwAIAEAAAAHACAKBAAAvAMAICAAAL8DACAhAAC-AwAgQgAAvQMAIEMAAMADACDAAQAA-AIAIIcCAAD4AgAgiAIAAPgCACCKAgAA-AIAIIwCAAD4AgAgE7YBAADGAgAwtwEAAIEBABC4AQAAxgIAMLkBAQCVAgAhvwEgAJcCACHAAUAAmAIAIcIBQACZAgAh1gFAAJkCACHXAQEAlQIAIdwBIACXAgAhgwIBAJUCACGFAgAAxwKFAiKGAggAuAIAIYcCCADIAgAhiAIIAMgCACGJAkAAmQIAIYoCAgCzAgAhiwICAK0CACGMAgEAlgIAIQMAAAAHACABAACAAQAwHwAAgQEAIAMAAAAHACABAABvADACAABsACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIBoFAAC5AwAgBgAAugMAIAcAALsDACC5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB1gFAAAAAAd8BAQAAAAHpAQgAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BCAAAAAHvAQgAAAAB8AEIAAAAAfEBAQAAAAHyAQEAAAAB9AEAAAD0AQL2AQAAAPYBAvgBAAAA-AEC-QGAAAAAAfoBIAAAAAH7AQEAAAAB_AEBAAAAAQETAACJAQAgF7kBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHWAUAAAAAB3wEBAAAAAekBCAAAAAHqAQEAAAAB6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEIAAAAAe8BCAAAAAHwAQgAAAAB8QEBAAAAAfIBAQAAAAH0AQAAAPQBAvYBAAAA9gEC-AEAAAD4AQL5AYAAAAAB-gEgAAAAAfsBAQAAAAH8AQEAAAABARMAAIsBADABEwAAiwEAMAEAAAAHACABAAAACwAgGgUAAKoDACAGAACrAwAgBwAArAMAILkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh1gFAAIADACHfAQEA_QIAIekBCACdAwAh6gEBAPwCACHrAQEA_QIAIewBAQD9AgAh7QEBAP0CACHuAQgAnQMAIe8BCACdAwAh8AEIAJ0DACHxAQEA_QIAIfIBAQD9AgAh9AEAAKcD9AEi9gEAAKgD9gEi-AEAAKkD-AEi-QGAAAAAAfoBIAD-AgAh-wEBAP0CACH8AQEA_QIAIQIAAAAFACATAACQAQAgF7kBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh1gFAAIADACHfAQEA_QIAIekBCACdAwAh6gEBAPwCACHrAQEA_QIAIewBAQD9AgAh7QEBAP0CACHuAQgAnQMAIe8BCACdAwAh8AEIAJ0DACHxAQEA_QIAIfIBAQD9AgAh9AEAAKcD9AEi9gEAAKgD9gEi-AEAAKkD-AEi-QGAAAAAAfoBIAD-AgAh-wEBAP0CACH8AQEA_QIAIQIAAAADACATAACSAQAgAgAAAAMAIBMAAJIBACABAAAABwAgAQAAAAsAIAMAAAAFACAaAACJAQAgGwAAkAEAIAEAAAAFACABAAAAAwAgDgQAAKIDACAgAAClAwAgIQAApAMAIEIAAKMDACBDAACmAwAgwAEAAPgCACDfAQAA-AIAIOsBAAD4AgAg7AEAAPgCACDtAQAA-AIAIPEBAAD4AgAg8gEAAPgCACD7AQAA-AIAIPwBAAD4AgAgGrYBAAC6AgAwtwEAAJsBABC4AQAAugIAMLkBAQCVAgAhvwEgAJcCACHAAUAAmAIAIcIBQACZAgAh1gFAAJkCACHfAQEAlgIAIekBCAC4AgAh6gEBAJUCACHrAQEAlgIAIewBAQCWAgAh7QEBAJYCACHuAQgAuAIAIe8BCAC4AgAh8AEIALgCACHxAQEAlgIAIfIBAQCWAgAh9AEAALsC9AEi9gEAALwC9gEi-AEAAL0C-AEi-QEAAL4CACD6ASAAlwIAIfsBAQCWAgAh_AEBAJYCACEDAAAAAwAgAQAAmgEAMB8AAJsBACADAAAAAwAgAQAABAAwAgAABQAgAQAAAA8AIAEAAAAPACADAAAADQAgAQAADgAwAgAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACAJCwAAoAMAIA0AAKEDACC5AQEAAAAB4AEBAAAAAeUBAQAAAAHmAQEAAAAB5wEIAAAAAegBAgAAAAHpAQgAAAABARMAAKMBACAHuQEBAAAAAeABAQAAAAHlAQEAAAAB5gEBAAAAAecBCAAAAAHoAQIAAAAB6QEIAAAAAQETAAClAQAwARMAAKUBADAJCwAAngMAIA0AAJ8DACC5AQEA_AIAIeABAQD8AgAh5QEBAPwCACHmAQEA_AIAIecBCACdAwAh6AECAIYDACHpAQgAnQMAIQIAAAAPACATAACoAQAgB7kBAQD8AgAh4AEBAPwCACHlAQEA_AIAIeYBAQD8AgAh5wEIAJ0DACHoAQIAhgMAIekBCACdAwAhAgAAAA0AIBMAAKoBACACAAAADQAgEwAAqgEAIAMAAAAPACAaAACjAQAgGwAAqAEAIAEAAAAPACABAAAADQAgBQQAAJgDACAgAACbAwAgIQAAmgMAIEIAAJkDACBDAACcAwAgCrYBAAC3AgAwtwEAALEBABC4AQAAtwIAMLkBAQCVAgAh4AEBAJUCACHlAQEAlQIAIeYBAQCVAgAh5wEIALgCACHoAQIArQIAIekBCAC4AgAhAwAAAA0AIAEAALABADAfAACxAQAgAwAAAA0AIAEAAA4AMAIAAA8AIAEAAAAgACABAAAAIAAgAwAAAB4AIAEAAB8AMAIAACAAIAMAAAAeACABAAAfADACAAAgACADAAAAHgAgAQAAHwAwAgAAIAAgDAYAAJcDACALAACWAwAguQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAd8BAQAAAAHgAQEAAAAB4QECAAAAAeIBAQAAAAHjASAAAAAB5AEgAAAAAQETAAC5AQAgCrkBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHfAQEAAAAB4AEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBIAAAAAEBEwAAuwEAMAETAAC7AQAwDAYAAJUDACALAACUAwAguQEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHfAQEA_AIAIeABAQD8AgAh4QECAIYDACHiAQEA_QIAIeMBIAD-AgAh5AEgAP4CACECAAAAIAAgEwAAvgEAIAq5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAId8BAQD8AgAh4AEBAPwCACHhAQIAhgMAIeIBAQD9AgAh4wEgAP4CACHkASAA_gIAIQIAAAAeACATAADAAQAgAgAAAB4AIBMAAMABACADAAAAIAAgGgAAuQEAIBsAAL4BACABAAAAIAAgAQAAAB4AIAcEAACPAwAgIAAAkgMAICEAAJEDACBCAACQAwAgQwAAkwMAIMABAAD4AgAg4gEAAPgCACANtgEAALYCADC3AQAAxwEAELgBAAC2AgAwuQEBAJUCACG_ASAAlwIAIcABQACYAgAhwgFAAJkCACHfAQEAlQIAIeABAQCVAgAh4QECAK0CACHiAQEAlgIAIeMBIACXAgAh5AEgAJcCACEDAAAAHgAgAQAAxgEAMB8AAMcBACADAAAAHgAgAQAAHwAwAgAAIAAgAQAAABcAIAEAAAAXACADAAAAFQAgAQAAFgAwAgAAFwAgAwAAABUAIAEAABYAMAIAABcAIAMAAAAVACABAAAWADACAAAXACAPCAAAjgMAIA0CAAAAAbkBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHWAUAAAAAB1wEBAAAAAdgBAQAAAAHZAQEAAAAB2gEBAAAAAdsBIAAAAAHcASAAAAAB3QEBAAAAAd4BAQAAAAEBEwAAzwEAIA4NAgAAAAG5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB1gFAAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbASAAAAAB3AEgAAAAAd0BAQAAAAHeAQEAAAABARMAANEBADABEwAA0QEAMAEAAAAZACAPCAAAjQMAIA0CAIwDACG5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdYBQACAAwAh1wEBAP0CACHYAQEA_QIAIdkBAQD9AgAh2gEBAP0CACHbASAA_gIAIdwBIAD-AgAh3QEBAP0CACHeAQEA_QIAIQIAAAAXACATAADVAQAgDg0CAIwDACG5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdYBQACAAwAh1wEBAP0CACHYAQEA_QIAIdkBAQD9AgAh2gEBAP0CACHbASAA_gIAIdwBIAD-AgAh3QEBAP0CACHeAQEA_QIAIQIAAAAVACATAADXAQAgAgAAABUAIBMAANcBACABAAAAGQAgAwAAABcAIBoAAM8BACAbAADVAQAgAQAAABcAIAEAAAAVACANBAAAhwMAIA0AAPgCACAgAACKAwAgIQAAiQMAIEIAAIgDACBDAACLAwAgwAEAAPgCACDXAQAA-AIAINgBAAD4AgAg2QEAAPgCACDaAQAA-AIAIN0BAAD4AgAg3gEAAPgCACARDQIAswIAIbYBAACyAgAwtwEAAN8BABC4AQAAsgIAMLkBAQCVAgAhvwEgAJcCACHAAUAAmAIAIcIBQACZAgAh1gFAAJkCACHXAQEAlgIAIdgBAQCWAgAh2QEBAJYCACHaAQEAlgIAIdsBIACXAgAh3AEgAJcCACHdAQEAlgIAId4BAQCWAgAhAwAAABUAIAEAAN4BADAfAADfAQAgAwAAABUAIAEAABYAMAIAABcAIA-2AQAAsAIAMLcBAADlAQAQuAEAALACADC5AQIAAAABuwEBAKcCACG-AQEApwIAIc4BAQCnAgAhzwEBAKgCACHQAQEAqAIAIdEBAQCnAgAh0gEBAKcCACHTAQEApwIAIdQBAQCoAgAh1QEBAKgCACHWAUAAqwIAIQEAAADiAQAgAQAAAOIBACAPtgEAALACADC3AQAA5QEAELgBAACwAgAwuQECALECACG7AQEApwIAIb4BAQCnAgAhzgEBAKcCACHPAQEAqAIAIdABAQCoAgAh0QEBAKcCACHSAQEApwIAIdMBAQCnAgAh1AEBAKgCACHVAQEAqAIAIdYBQACrAgAhBM8BAAD4AgAg0AEAAPgCACDUAQAA-AIAINUBAAD4AgAgAwAAAOUBACABAADmAQAwAgAA4gEAIAMAAADlAQAgAQAA5gEAMAIAAOIBACADAAAA5QEAIAEAAOYBADACAADiAQAgDLkBAgAAAAG7AQEAAAABvgEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB0wEBAAAAAdQBAQAAAAHVAQEAAAAB1gFAAAAAAQETAADqAQAgDLkBAgAAAAG7AQEAAAABvgEBAAAAAc4BAQAAAAHPAQEAAAAB0AEBAAAAAdEBAQAAAAHSAQEAAAAB0wEBAAAAAdQBAQAAAAHVAQEAAAAB1gFAAAAAAQETAADsAQAwARMAAOwBADAMuQECAIYDACG7AQEA_AIAIb4BAQD8AgAhzgEBAPwCACHPAQEA_QIAIdABAQD9AgAh0QEBAPwCACHSAQEA_AIAIdMBAQD8AgAh1AEBAP0CACHVAQEA_QIAIdYBQACAAwAhAgAAAOIBACATAADvAQAgDLkBAgCGAwAhuwEBAPwCACG-AQEA_AIAIc4BAQD8AgAhzwEBAP0CACHQAQEA_QIAIdEBAQD8AgAh0gEBAPwCACHTAQEA_AIAIdQBAQD9AgAh1QEBAP0CACHWAUAAgAMAIQIAAADlAQAgEwAA8QEAIAIAAADlAQAgEwAA8QEAIAMAAADiAQAgGgAA6gEAIBsAAO8BACABAAAA4gEAIAEAAADlAQAgCQQAAIEDACAgAACEAwAgIQAAgwMAIEIAAIIDACBDAACFAwAgzwEAAPgCACDQAQAA-AIAINQBAAD4AgAg1QEAAPgCACAPtgEAAKwCADC3AQAA-AEAELgBAACsAgAwuQECAK0CACG7AQEAlQIAIb4BAQCVAgAhzgEBAJUCACHPAQEAlgIAIdABAQCWAgAh0QEBAJUCACHSAQEAlQIAIdMBAQCVAgAh1AEBAJYCACHVAQEAlgIAIdYBQACZAgAhAwAAAOUBACABAAD3AQAwHwAA-AEAIAMAAADlAQAgAQAA5gEAMAIAAOIBACANtgEAAKYCADC3AQAA_gEAELgBAACmAgAwuQEBAAAAAboBAQCnAgAhuwEBAKcCACG8AQEApwIAIb0BAQCnAgAhvgEBAKgCACG_ASAAqQIAIcABQACqAgAhwQEgAKkCACHCAUAAqwIAIQEAAAD7AQAgAQAAAPsBACANtgEAAKYCADC3AQAA_gEAELgBAACmAgAwuQEBAKcCACG6AQEApwIAIbsBAQCnAgAhvAEBAKcCACG9AQEApwIAIb4BAQCoAgAhvwEgAKkCACHAAUAAqgIAIcEBIACpAgAhwgFAAKsCACECvgEAAPgCACDAAQAA-AIAIAMAAAD-AQAgAQAA_wEAMAIAAPsBACADAAAA_gEAIAEAAP8BADACAAD7AQAgAwAAAP4BACABAAD_AQAwAgAA-wEAIAq5AQEAAAABugEBAAAAAbsBAQAAAAG8AQEAAAABvQEBAAAAAb4BAQAAAAG_ASAAAAABwAFAAAAAAcEBIAAAAAHCAUAAAAABARMAAIMCACAKuQEBAAAAAboBAQAAAAG7AQEAAAABvAEBAAAAAb0BAQAAAAG-AQEAAAABvwEgAAAAAcABQAAAAAHBASAAAAABwgFAAAAAAQETAACFAgAwARMAAIUCADAKuQEBAPwCACG6AQEA_AIAIbsBAQD8AgAhvAEBAPwCACG9AQEA_AIAIb4BAQD9AgAhvwEgAP4CACHAAUAA_wIAIcEBIAD-AgAhwgFAAIADACECAAAA-wEAIBMAAIgCACAKuQEBAPwCACG6AQEA_AIAIbsBAQD8AgAhvAEBAPwCACG9AQEA_AIAIb4BAQD9AgAhvwEgAP4CACHAAUAA_wIAIcEBIAD-AgAhwgFAAIADACECAAAA_gEAIBMAAIoCACACAAAA_gEAIBMAAIoCACADAAAA-wEAIBoAAIMCACAbAACIAgAgAQAAAPsBACABAAAA_gEAIAUEAAD5AgAgIAAA-wIAICEAAPoCACC-AQAA-AIAIMABAAD4AgAgDbYBAACUAgAwtwEAAJECABC4AQAAlAIAMLkBAQCVAgAhugEBAJUCACG7AQEAlQIAIbwBAQCVAgAhvQEBAJUCACG-AQEAlgIAIb8BIACXAgAhwAFAAJgCACHBASAAlwIAIcIBQACZAgAhAwAAAP4BACABAACQAgAwHwAAkQIAIAMAAAD-AQAgAQAA_wEAMAIAAPsBACANtgEAAJQCADC3AQAAkQIAELgBAACUAgAwuQEBAJUCACG6AQEAlQIAIbsBAQCVAgAhvAEBAJUCACG9AQEAlQIAIb4BAQCWAgAhvwEgAJcCACHAAUAAmAIAIcEBIACXAgAhwgFAAJkCACEOBAAAmwIAICAAAKUCACAhAAClAgAgwwEBAAAAAcQBAQAAAATFAQEAAAAExgEBAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQCkAgAhywEBAAAAAcwBAQAAAAHNAQEAAAABDgQAAJ4CACAgAACjAgAgIQAAowIAIMMBAQAAAAHEAQEAAAAFxQEBAAAABcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAogIAIcsBAQAAAAHMAQEAAAABzQEBAAAAAQUEAACbAgAgIAAAoQIAICEAAKECACDDASAAAAABygEgAKACACELBAAAngIAICAAAJ8CACAhAACfAgAgwwFAAAAAAcQBQAAAAAXFAUAAAAAFxgFAAAAAAccBQAAAAAHIAUAAAAAByQFAAAAAAcoBQACdAgAhCwQAAJsCACAgAACcAgAgIQAAnAIAIMMBQAAAAAHEAUAAAAAExQFAAAAABMYBQAAAAAHHAUAAAAAByAFAAAAAAckBQAAAAAHKAUAAmgIAIQsEAACbAgAgIAAAnAIAICEAAJwCACDDAUAAAAABxAFAAAAABMUBQAAAAATGAUAAAAABxwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAJoCACEIwwECAAAAAcQBAgAAAATFAQIAAAAExgECAAAAAccBAgAAAAHIAQIAAAAByQECAAAAAcoBAgCbAgAhCMMBQAAAAAHEAUAAAAAExQFAAAAABMYBQAAAAAHHAUAAAAAByAFAAAAAAckBQAAAAAHKAUAAnAIAIQsEAACeAgAgIAAAnwIAICEAAJ8CACDDAUAAAAABxAFAAAAABcUBQAAAAAXGAUAAAAABxwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAJ0CACEIwwECAAAAAcQBAgAAAAXFAQIAAAAFxgECAAAAAccBAgAAAAHIAQIAAAAByQECAAAAAcoBAgCeAgAhCMMBQAAAAAHEAUAAAAAFxQFAAAAABcYBQAAAAAHHAUAAAAAByAFAAAAAAckBQAAAAAHKAUAAnwIAIQUEAACbAgAgIAAAoQIAICEAAKECACDDASAAAAABygEgAKACACECwwEgAAAAAcoBIAChAgAhDgQAAJ4CACAgAACjAgAgIQAAowIAIMMBAQAAAAHEAQEAAAAFxQEBAAAABcYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEAogIAIcsBAQAAAAHMAQEAAAABzQEBAAAAAQvDAQEAAAABxAEBAAAABcUBAQAAAAXGAQEAAAABxwEBAAAAAcgBAQAAAAHJAQEAAAABygEBAKMCACHLAQEAAAABzAEBAAAAAc0BAQAAAAEOBAAAmwIAICAAAKUCACAhAAClAgAgwwEBAAAAAcQBAQAAAATFAQEAAAAExgEBAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQCkAgAhywEBAAAAAcwBAQAAAAHNAQEAAAABC8MBAQAAAAHEAQEAAAAExQEBAAAABMYBAQAAAAHHAQEAAAAByAEBAAAAAckBAQAAAAHKAQEApQIAIcsBAQAAAAHMAQEAAAABzQEBAAAAAQ22AQAApgIAMLcBAAD-AQAQuAEAAKYCADC5AQEApwIAIboBAQCnAgAhuwEBAKcCACG8AQEApwIAIb0BAQCnAgAhvgEBAKgCACG_ASAAqQIAIcABQACqAgAhwQEgAKkCACHCAUAAqwIAIQvDAQEAAAABxAEBAAAABMUBAQAAAATGAQEAAAABxwEBAAAAAcgBAQAAAAHJAQEAAAABygEBAKUCACHLAQEAAAABzAEBAAAAAc0BAQAAAAELwwEBAAAAAcQBAQAAAAXFAQEAAAAFxgEBAAAAAccBAQAAAAHIAQEAAAAByQEBAAAAAcoBAQCjAgAhywEBAAAAAcwBAQAAAAHNAQEAAAABAsMBIAAAAAHKASAAoQIAIQjDAUAAAAABxAFAAAAABcUBQAAAAAXGAUAAAAABxwFAAAAAAcgBQAAAAAHJAUAAAAABygFAAJ8CACEIwwFAAAAAAcQBQAAAAATFAUAAAAAExgFAAAAAAccBQAAAAAHIAUAAAAAByQFAAAAAAcoBQACcAgAhD7YBAACsAgAwtwEAAPgBABC4AQAArAIAMLkBAgCtAgAhuwEBAJUCACG-AQEAlQIAIc4BAQCVAgAhzwEBAJYCACHQAQEAlgIAIdEBAQCVAgAh0gEBAJUCACHTAQEAlQIAIdQBAQCWAgAh1QEBAJYCACHWAUAAmQIAIQ0EAACbAgAgIAAAmwIAICEAAJsCACBCAACvAgAgQwAAmwIAIMMBAgAAAAHEAQIAAAAExQECAAAABMYBAgAAAAHHAQIAAAAByAECAAAAAckBAgAAAAHKAQIArgIAIQ0EAACbAgAgIAAAmwIAICEAAJsCACBCAACvAgAgQwAAmwIAIMMBAgAAAAHEAQIAAAAExQECAAAABMYBAgAAAAHHAQIAAAAByAECAAAAAckBAgAAAAHKAQIArgIAIQjDAQgAAAABxAEIAAAABMUBCAAAAATGAQgAAAABxwEIAAAAAcgBCAAAAAHJAQgAAAABygEIAK8CACEPtgEAALACADC3AQAA5QEAELgBAACwAgAwuQECALECACG7AQEApwIAIb4BAQCnAgAhzgEBAKcCACHPAQEAqAIAIdABAQCoAgAh0QEBAKcCACHSAQEApwIAIdMBAQCnAgAh1AEBAKgCACHVAQEAqAIAIdYBQACrAgAhCMMBAgAAAAHEAQIAAAAExQECAAAABMYBAgAAAAHHAQIAAAAByAECAAAAAckBAgAAAAHKAQIAmwIAIRENAgCzAgAhtgEAALICADC3AQAA3wEAELgBAACyAgAwuQEBAJUCACG_ASAAlwIAIcABQACYAgAhwgFAAJkCACHWAUAAmQIAIdcBAQCWAgAh2AEBAJYCACHZAQEAlgIAIdoBAQCWAgAh2wEgAJcCACHcASAAlwIAId0BAQCWAgAh3gEBAJYCACENBAAAngIAICAAAJ4CACAhAACeAgAgQgAAtQIAIEMAAJ4CACDDAQIAAAABxAECAAAABcUBAgAAAAXGAQIAAAABxwECAAAAAcgBAgAAAAHJAQIAAAABygECALQCACENBAAAngIAICAAAJ4CACAhAACeAgAgQgAAtQIAIEMAAJ4CACDDAQIAAAABxAECAAAABcUBAgAAAAXGAQIAAAABxwECAAAAAcgBAgAAAAHJAQIAAAABygECALQCACEIwwEIAAAAAcQBCAAAAAXFAQgAAAAFxgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAAAAAcoBCAC1AgAhDbYBAAC2AgAwtwEAAMcBABC4AQAAtgIAMLkBAQCVAgAhvwEgAJcCACHAAUAAmAIAIcIBQACZAgAh3wEBAJUCACHgAQEAlQIAIeEBAgCtAgAh4gEBAJYCACHjASAAlwIAIeQBIACXAgAhCrYBAAC3AgAwtwEAALEBABC4AQAAtwIAMLkBAQCVAgAh4AEBAJUCACHlAQEAlQIAIeYBAQCVAgAh5wEIALgCACHoAQIArQIAIekBCAC4AgAhDQQAAJsCACAgAACvAgAgIQAArwIAIEIAAK8CACBDAACvAgAgwwEIAAAAAcQBCAAAAATFAQgAAAAExgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAAAAAcoBCAC5AgAhDQQAAJsCACAgAACvAgAgIQAArwIAIEIAAK8CACBDAACvAgAgwwEIAAAAAcQBCAAAAATFAQgAAAAExgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAAAAAcoBCAC5AgAhGrYBAAC6AgAwtwEAAJsBABC4AQAAugIAMLkBAQCVAgAhvwEgAJcCACHAAUAAmAIAIcIBQACZAgAh1gFAAJkCACHfAQEAlgIAIekBCAC4AgAh6gEBAJUCACHrAQEAlgIAIewBAQCWAgAh7QEBAJYCACHuAQgAuAIAIe8BCAC4AgAh8AEIALgCACHxAQEAlgIAIfIBAQCWAgAh9AEAALsC9AEi9gEAALwC9gEi-AEAAL0C-AEi-QEAAL4CACD6ASAAlwIAIfsBAQCWAgAh_AEBAJYCACEHBAAAmwIAICAAAMUCACAhAADFAgAgwwEAAAD0AQLEAQAAAPQBCMUBAAAA9AEIygEAAMQC9AEiBwQAAJsCACAgAADDAgAgIQAAwwIAIMMBAAAA9gECxAEAAAD2AQjFAQAAAPYBCMoBAADCAvYBIgcEAACbAgAgIAAAwQIAICEAAMECACDDAQAAAPgBAsQBAAAA-AEIxQEAAAD4AQjKAQAAwAL4ASIPBAAAmwIAICAAAL8CACAhAAC_AgAgwwGAAAAAAcYBgAAAAAHHAYAAAAAByAGAAAAAAckBgAAAAAHKAYAAAAAB_QEBAAAAAf4BAQAAAAH_AQEAAAABgAKAAAAAAYECgAAAAAGCAoAAAAABDMMBgAAAAAHGAYAAAAABxwGAAAAAAcgBgAAAAAHJAYAAAAABygGAAAAAAf0BAQAAAAH-AQEAAAAB_wEBAAAAAYACgAAAAAGBAoAAAAABggKAAAAAAQcEAACbAgAgIAAAwQIAICEAAMECACDDAQAAAPgBAsQBAAAA-AEIxQEAAAD4AQjKAQAAwAL4ASIEwwEAAAD4AQLEAQAAAPgBCMUBAAAA-AEIygEAAMEC-AEiBwQAAJsCACAgAADDAgAgIQAAwwIAIMMBAAAA9gECxAEAAAD2AQjFAQAAAPYBCMoBAADCAvYBIgTDAQAAAPYBAsQBAAAA9gEIxQEAAAD2AQjKAQAAwwL2ASIHBAAAmwIAICAAAMUCACAhAADFAgAgwwEAAAD0AQLEAQAAAPQBCMUBAAAA9AEIygEAAMQC9AEiBMMBAAAA9AECxAEAAAD0AQjFAQAAAPQBCMoBAADFAvQBIhO2AQAAxgIAMLcBAACBAQAQuAEAAMYCADC5AQEAlQIAIb8BIACXAgAhwAFAAJgCACHCAUAAmQIAIdYBQACZAgAh1wEBAJUCACHcASAAlwIAIYMCAQCVAgAhhQIAAMcChQIihgIIALgCACGHAggAyAIAIYgCCADIAgAhiQJAAJkCACGKAgIAswIAIYsCAgCtAgAhjAIBAJYCACEHBAAAmwIAICAAAMsCACAhAADLAgAgwwEAAACFAgLEAQAAAIUCCMUBAAAAhQIIygEAAMoChQIiDQQAAJ4CACAgAAC1AgAgIQAAtQIAIEIAALUCACBDAAC1AgAgwwEIAAAAAcQBCAAAAAXFAQgAAAAFxgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAAAAAcoBCADJAgAhDQQAAJ4CACAgAAC1AgAgIQAAtQIAIEIAALUCACBDAAC1AgAgwwEIAAAAAcQBCAAAAAXFAQgAAAAFxgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAAAAAcoBCADJAgAhBwQAAJsCACAgAADLAgAgIQAAywIAIMMBAAAAhQICxAEAAACFAgjFAQAAAIUCCMoBAADKAoUCIgTDAQAAAIUCAsQBAAAAhQIIxQEAAACFAgjKAQAAywKFAiIUAwAA0QIAILYBAADMAgAwtwEAAAcAELgBAADMAgAwuQEBAKcCACG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAIdcBAQCnAgAh3AEgAKkCACGDAgEApwIAIYUCAADNAoUCIoYCCADOAgAhhwIIAM8CACGIAggAzwIAIYkCQACrAgAhigICANACACGLAgIAsQIAIYwCAQCoAgAhBMMBAAAAhQICxAEAAACFAgjFAQAAAIUCCMoBAADLAoUCIgjDAQgAAAABxAEIAAAABMUBCAAAAATGAQgAAAABxwEIAAAAAcgBCAAAAAHJAQgAAAABygEIAK8CACEIwwEIAAAAAcQBCAAAAAXFAQgAAAAFxgEIAAAAAccBCAAAAAHIAQgAAAAByQEIAAAAAcoBCAC1AgAhCMMBAgAAAAHEAQIAAAAFxQECAAAABcYBAgAAAAHHAQIAAAAByAECAAAAAckBAgAAAAHKAQIAngIAIQONAgAAAwAgjgIAAAMAII8CAAADACAXtgEAANICADC3AQAAaQAQuAEAANICADC5AQEAlQIAIboBAQCVAgAhvwEgAJcCACHAAUAAmAIAIcIBQACZAgAh3QEBAJUCACHjASAAlwIAIYwCAQCVAgAhkAIBAJUCACGRAggAuAIAIZICCADIAgAhkwIBAJUCACGUAgAA0wIAIJUCIADUAgAhlgIBAJYCACGXAiAAlwIAIZgCIACXAgAhmQIgAJcCACGaAiAAlwIAIZsCAADTAgAgBMMBAQAAAAWcAgEAAAABnQIBAAAABJ4CAQAAAAQFBAAAngIAICAAANYCACAhAADWAgAgwwEgAAAAAcoBIADVAgAhBQQAAJ4CACAgAADWAgAgIQAA1gIAIMMBIAAAAAHKASAA1QIAIQLDASAAAAABygEgANYCACELtgEAANcCADC3AQAAUwAQuAEAANcCADC5AQEAlQIAIboBAQCVAgAhwgFAAJkCACHcASAAlwIAIeMBIACXAgAhjAIBAJYCACGQAgEAlQIAIZMCAQCWAgAhDQcAANkCACAJAADaAgAgtgEAANgCADC3AQAAGQAQuAEAANgCADC5AQEApwIAIboBAQCnAgAhwgFAAKsCACHcASAAqQIAIeMBIACpAgAhjAIBAKgCACGQAgEApwIAIZMCAQCoAgAhA40CAAARACCOAgAAEQAgjwIAABEAIAONAgAAFQAgjgIAABUAII8CAAAVACAPtgEAANsCADC3AQAAOwAQuAEAANsCADC5AQEAlQIAIboBAQCVAgAhuwEBAJUCACG-AQEAlgIAIb8BIACXAgAhwAFAAJgCACHCAUAAmQIAIdEBAQCWAgAh1gFAAJkCACH0AQAA3QKjAiKfAgEAlQIAIaECAADcAqECIgcEAACbAgAgIAAA4QIAICEAAOECACDDAQAAAKECAsQBAAAAoQIIxQEAAAChAgjKAQAA4AKhAiIHBAAAmwIAICAAAN8CACAhAADfAgAgwwEAAACjAgLEAQAAAKMCCMUBAAAAowIIygEAAN4CowIiBwQAAJsCACAgAADfAgAgIQAA3wIAIMMBAAAAowICxAEAAACjAgjFAQAAAKMCCMoBAADeAqMCIgTDAQAAAKMCAsQBAAAAowIIxQEAAACjAgjKAQAA3wKjAiIHBAAAmwIAICAAAOECACAhAADhAgAgwwEAAAChAgLEAQAAAKECCMUBAAAAoQIIygEAAOACoQIiBMMBAAAAoQICxAEAAAChAgjFAQAAAKECCMoBAADhAqECIg8GAADkAgAgCwAA4wIAILYBAADiAgAwtwEAAB4AELgBAADiAgAwuQEBAKcCACG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHfAQEApwIAIeABAQCnAgAh4QECALECACHiAQEAqAIAIeMBIACpAgAh5AEgAKkCACEcCAAA6QIAIAoAAOoCACAMAADrAgAgtgEAAOcCADC3AQAAEQAQuAEAAOcCADC5AQEApwIAIboBAQCnAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh3QEBAKcCACHjASAAqQIAIYwCAQCnAgAhkAIBAKcCACGRAggAzgIAIZICCADPAgAhkwIBAKcCACGUAgAA0wIAIJUCIADoAgAhlgIBAKgCACGXAiAAqQIAIZgCIACpAgAhmQIgAKkCACGaAiAAqQIAIZsCAADTAgAgowIAABEAIKQCAAARACATAwAA0QIAIAwAAOsCACC2AQAA7gIAMLcBAAALABC4AQAA7gIAMLkBAQCnAgAhugEBAKcCACG7AQEApwIAIb4BAQCoAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh0QEBAKgCACHWAUAAqwIAIfQBAADwAqMCIp8CAQCnAgAhoQIAAO8CoQIiowIAAAsAIKQCAAALACASCAAA5gIAIA0CANACACG2AQAA5QIAMLcBAAAVABC4AQAA5QIAMLkBAQCnAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh1gFAAKsCACHXAQEAqAIAIdgBAQCoAgAh2QEBAKgCACHaAQEAqAIAIdsBIACpAgAh3AEgAKkCACHdAQEAqAIAId4BAQCoAgAhDwcAANkCACAJAADaAgAgtgEAANgCADC3AQAAGQAQuAEAANgCADC5AQEApwIAIboBAQCnAgAhwgFAAKsCACHcASAAqQIAIeMBIACpAgAhjAIBAKgCACGQAgEApwIAIZMCAQCoAgAhowIAABkAIKQCAAAZACAaCAAA6QIAIAoAAOoCACAMAADrAgAgtgEAAOcCADC3AQAAEQAQuAEAAOcCADC5AQEApwIAIboBAQCnAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh3QEBAKcCACHjASAAqQIAIYwCAQCnAgAhkAIBAKcCACGRAggAzgIAIZICCADPAgAhkwIBAKcCACGUAgAA0wIAIJUCIADoAgAhlgIBAKgCACGXAiAAqQIAIZgCIACpAgAhmQIgAKkCACGaAiAAqQIAIZsCAADTAgAgAsMBIAAAAAHKASAA1gIAIQ8HAADZAgAgCQAA2gIAILYBAADYAgAwtwEAABkAELgBAADYAgAwuQEBAKcCACG6AQEApwIAIcIBQACrAgAh3AEgAKkCACHjASAAqQIAIYwCAQCoAgAhkAIBAKcCACGTAgEAqAIAIaMCAAAZACCkAgAAGQAgA40CAAANACCOAgAADQAgjwIAAA0AIAONAgAAHgAgjgIAAB4AII8CAAAeACAMCwAA4wIAIA0AAO0CACC2AQAA7AIAMLcBAAANABC4AQAA7AIAMLkBAQCnAgAh4AEBAKcCACHlAQEApwIAIeYBAQCnAgAh5wEIAM4CACHoAQIAsQIAIekBCADOAgAhHwUAAPYCACAGAAD3AgAgBwAA6gIAILYBAADxAgAwtwEAAAMAELgBAADxAgAwuQEBAKcCACG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAId8BAQCoAgAh6QEIAM4CACHqAQEApwIAIesBAQCoAgAh7AEBAKgCACHtAQEAqAIAIe4BCADOAgAh7wEIAM4CACHwAQgAzgIAIfEBAQCoAgAh8gEBAKgCACH0AQAA8gL0ASL2AQAA8wL2ASL4AQAA9AL4ASL5AQAA9QIAIPoBIACpAgAh-wEBAKgCACH8AQEAqAIAIaMCAAADACCkAgAAAwAgEQMAANECACAMAADrAgAgtgEAAO4CADC3AQAACwAQuAEAAO4CADC5AQEApwIAIboBAQCnAgAhuwEBAKcCACG-AQEAqAIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAIdEBAQCoAgAh1gFAAKsCACH0AQAA8AKjAiKfAgEApwIAIaECAADvAqECIgTDAQAAAKECAsQBAAAAoQIIxQEAAAChAgjKAQAA4QKhAiIEwwEAAACjAgLEAQAAAKMCCMUBAAAAowIIygEAAN8CowIiHQUAAPYCACAGAAD3AgAgBwAA6gIAILYBAADxAgAwtwEAAAMAELgBAADxAgAwuQEBAKcCACG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAId8BAQCoAgAh6QEIAM4CACHqAQEApwIAIesBAQCoAgAh7AEBAKgCACHtAQEAqAIAIe4BCADOAgAh7wEIAM4CACHwAQgAzgIAIfEBAQCoAgAh8gEBAKgCACH0AQAA8gL0ASL2AQAA8wL2ASL4AQAA9AL4ASL5AQAA9QIAIPoBIACpAgAh-wEBAKgCACH8AQEAqAIAIQTDAQAAAPQBAsQBAAAA9AEIxQEAAAD0AQjKAQAAxQL0ASIEwwEAAAD2AQLEAQAAAPYBCMUBAAAA9gEIygEAAMMC9gEiBMMBAAAA-AECxAEAAAD4AQjFAQAAAPgBCMoBAADBAvgBIgzDAYAAAAABxgGAAAAAAccBgAAAAAHIAYAAAAAByQGAAAAAAcoBgAAAAAH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAoAAAAABgQKAAAAAAYICgAAAAAEWAwAA0QIAILYBAADMAgAwtwEAAAcAELgBAADMAgAwuQEBAKcCACG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAIdcBAQCnAgAh3AEgAKkCACGDAgEApwIAIYUCAADNAoUCIoYCCADOAgAhhwIIAM8CACGIAggAzwIAIYkCQACrAgAhigICANACACGLAgIAsQIAIYwCAQCoAgAhowIAAAcAIKQCAAAHACATAwAA0QIAIAwAAOsCACC2AQAA7gIAMLcBAAALABC4AQAA7gIAMLkBAQCnAgAhugEBAKcCACG7AQEApwIAIb4BAQCoAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh0QEBAKgCACHWAUAAqwIAIfQBAADwAqMCIp8CAQCnAgAhoQIAAO8CoQIiowIAAAsAIKQCAAALACAAAAAAAagCAQAAAAEBqAIBAAAAAQGoAiAAAAABAagCQAAAAAEBqAJAAAAAAQAAAAAABagCAgAAAAGvAgIAAAABsAICAAAAAbECAgAAAAGyAgIAAAABAAAAAAAFqAICAAAAAa8CAgAAAAGwAgIAAAABsQICAAAAAbICAgAAAAEHGgAA5QQAIBsAAOgEACClAgAA5gQAIKYCAADnBAAgqQIAABkAIKoCAAAZACCrAgAAPgAgAxoAAOUEACClAgAA5gQAIKsCAAA-ACAAAAAAAAUaAADdBAAgGwAA4wQAIKUCAADeBAAgpgIAAOIEACCrAgAAEwAgBRoAANsEACAbAADgBAAgpQIAANwEACCmAgAA3wQAIKsCAAABACADGgAA3QQAIKUCAADeBAAgqwIAABMAIAMaAADbBAAgpQIAANwEACCrAgAAAQAgAAAAAAAFqAIIAAAAAa8CCAAAAAGwAggAAAABsQIIAAAAAbICCAAAAAEFGgAA0wQAIBsAANkEACClAgAA1AQAIKYCAADYBAAgqwIAABMAIAUaAADRBAAgGwAA1gQAIKUCAADSBAAgpgIAANUEACCrAgAABQAgAxoAANMEACClAgAA1AQAIKsCAAATACADGgAA0QQAIKUCAADSBAAgqwIAAAUAIAAAAAAAAagCAAAA9AECAagCAAAA9gECAagCAAAA-AECBxoAAMgEACAbAADPBAAgpQIAAMkEACCmAgAAzgQAIKkCAAAHACCqAgAABwAgqwIAAGwAIAcaAADGBAAgGwAAzAQAIKUCAADHBAAgpgIAAMsEACCpAgAACwAgqgIAAAsAIKsCAAABACALGgAArQMAMBsAALIDADClAgAArgMAMKYCAACvAwAwpwIAALADACCoAgAAsQMAMKkCAACxAwAwqgIAALEDADCrAgAAsQMAMKwCAACzAwAwrQIAALQDADAHCwAAoAMAILkBAQAAAAHgAQEAAAAB5gEBAAAAAecBCAAAAAHoAQIAAAAB6QEIAAAAAQIAAAAPACAaAAC4AwAgAwAAAA8AIBoAALgDACAbAAC3AwAgARMAAMoEADAMCwAA4wIAIA0AAO0CACC2AQAA7AIAMLcBAAANABC4AQAA7AIAMLkBAQAAAAHgAQEApwIAIeUBAQCnAgAh5gEBAKcCACHnAQgAzgIAIegBAgCxAgAh6QEIAM4CACECAAAADwAgEwAAtwMAIAIAAAC1AwAgEwAAtgMAIAq2AQAAtAMAMLcBAAC1AwAQuAEAALQDADC5AQEApwIAIeABAQCnAgAh5QEBAKcCACHmAQEApwIAIecBCADOAgAh6AECALECACHpAQgAzgIAIQq2AQAAtAMAMLcBAAC1AwAQuAEAALQDADC5AQEApwIAIeABAQCnAgAh5QEBAKcCACHmAQEApwIAIecBCADOAgAh6AECALECACHpAQgAzgIAIQa5AQEA_AIAIeABAQD8AgAh5gEBAPwCACHnAQgAnQMAIegBAgCGAwAh6QEIAJ0DACEHCwAAngMAILkBAQD8AgAh4AEBAPwCACHmAQEA_AIAIecBCACdAwAh6AECAIYDACHpAQgAnQMAIQcLAACgAwAguQEBAAAAAeABAQAAAAHmAQEAAAAB5wEIAAAAAegBAgAAAAHpAQgAAAABAxoAAMgEACClAgAAyQQAIKsCAABsACADGgAAxgQAIKUCAADHBAAgqwIAAAEAIAQaAACtAwAwpQIAAK4DADCnAgAAsAMAIKsCAACxAwAwAAAAAAABqAIAAACFAgIFqAIIAAAAAa8CCAAAAAGwAggAAAABsQIIAAAAAbICCAAAAAELGgAAxAMAMBsAAMkDADClAgAAxQMAMKYCAADGAwAwpwIAAMcDACCoAgAAyAMAMKkCAADIAwAwqgIAAMgDADCrAgAAyAMAMKwCAADKAwAwrQIAAMsDADAYBgAAugMAIAcAALsDACC5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB1gFAAAAAAd8BAQAAAAHpAQgAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BCAAAAAHvAQgAAAAB8AEIAAAAAfIBAQAAAAH0AQAAAPQBAvYBAAAA9gEC-AEAAAD4AQL5AYAAAAAB-gEgAAAAAfsBAQAAAAH8AQEAAAABAgAAAAUAIBoAAM8DACADAAAABQAgGgAAzwMAIBsAAM4DACABEwAAxQQAMB0FAAD2AgAgBgAA9wIAIAcAAOoCACC2AQAA8QIAMLcBAAADABC4AQAA8QIAMLkBAQAAAAG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAId8BAQCoAgAh6QEIAM4CACHqAQEAAAAB6wEBAKgCACHsAQEAqAIAIe0BAQCoAgAh7gEIAM4CACHvAQgAzgIAIfABCADOAgAh8QEBAKgCACHyAQEAqAIAIfQBAADyAvQBIvYBAADzAvYBIvgBAAD0AvgBIvkBAAD1AgAg-gEgAKkCACH7AQEAqAIAIfwBAQCoAgAhAgAAAAUAIBMAAM4DACACAAAAzAMAIBMAAM0DACAatgEAAMsDADC3AQAAzAMAELgBAADLAwAwuQEBAKcCACG_ASAAqQIAIcABQACqAgAhwgFAAKsCACHWAUAAqwIAId8BAQCoAgAh6QEIAM4CACHqAQEApwIAIesBAQCoAgAh7AEBAKgCACHtAQEAqAIAIe4BCADOAgAh7wEIAM4CACHwAQgAzgIAIfEBAQCoAgAh8gEBAKgCACH0AQAA8gL0ASL2AQAA8wL2ASL4AQAA9AL4ASL5AQAA9QIAIPoBIACpAgAh-wEBAKgCACH8AQEAqAIAIRq2AQAAywMAMLcBAADMAwAQuAEAAMsDADC5AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAIdYBQACrAgAh3wEBAKgCACHpAQgAzgIAIeoBAQCnAgAh6wEBAKgCACHsAQEAqAIAIe0BAQCoAgAh7gEIAM4CACHvAQgAzgIAIfABCADOAgAh8QEBAKgCACHyAQEAqAIAIfQBAADyAvQBIvYBAADzAvYBIvgBAAD0AvgBIvkBAAD1AgAg-gEgAKkCACH7AQEAqAIAIfwBAQCoAgAhFrkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh1gFAAIADACHfAQEA_QIAIekBCACdAwAh6gEBAPwCACHrAQEA_QIAIewBAQD9AgAh7QEBAP0CACHuAQgAnQMAIe8BCACdAwAh8AEIAJ0DACHyAQEA_QIAIfQBAACnA_QBIvYBAACoA_YBIvgBAACpA_gBIvkBgAAAAAH6ASAA_gIAIfsBAQD9AgAh_AEBAP0CACEYBgAAqwMAIAcAAKwDACC5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdYBQACAAwAh3wEBAP0CACHpAQgAnQMAIeoBAQD8AgAh6wEBAP0CACHsAQEA_QIAIe0BAQD9AgAh7gEIAJ0DACHvAQgAnQMAIfABCACdAwAh8gEBAP0CACH0AQAApwP0ASL2AQAAqAP2ASL4AQAAqQP4ASL5AYAAAAAB-gEgAP4CACH7AQEA_QIAIfwBAQD9AgAhGAYAALoDACAHAAC7AwAguQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAdYBQAAAAAHfAQEAAAAB6QEIAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQgAAAAB7wEIAAAAAfABCAAAAAHyAQEAAAAB9AEAAAD0AQL2AQAAAPYBAvgBAAAA-AEC-QGAAAAAAfoBIAAAAAH7AQEAAAAB_AEBAAAAAQQaAADEAwAwpQIAAMUDADCnAgAAxwMAIKsCAADIAwAwAAAAAAAAAqgCAQAAAASuAgEAAAAFAagCIAAAAAECqAIBAAAABK4CAQAAAAUFGgAAvgQAIBsAAMMEACClAgAAvwQAIKYCAADCBAAgqwIAAD4AIAsaAADpAwAwGwAA7QMAMKUCAADqAwAwpgIAAOsDADCnAgAA7AMAIKgCAACxAwAwqQIAALEDADCqAgAAsQMAMKsCAACxAwAwrAIAAO4DADCtAgAAtAMAMAsaAADdAwAwGwAA4gMAMKUCAADeAwAwpgIAAN8DADCnAgAA4AMAIKgCAADhAwAwqQIAAOEDADCqAgAA4QMAMKsCAADhAwAwrAIAAOMDADCtAgAA5AMAMAoGAACXAwAguQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAd8BAQAAAAHhAQIAAAAB4gEBAAAAAeMBIAAAAAHkASAAAAABAgAAACAAIBoAAOgDACADAAAAIAAgGgAA6AMAIBsAAOcDACABEwAAwQQAMA8GAADkAgAgCwAA4wIAILYBAADiAgAwtwEAAB4AELgBAADiAgAwuQEBAAAAAb8BIACpAgAhwAFAAKoCACHCAUAAqwIAId8BAQCnAgAh4AEBAKcCACHhAQIAsQIAIeIBAQCoAgAh4wEgAKkCACHkASAAqQIAIQIAAAAgACATAADnAwAgAgAAAOUDACATAADmAwAgDbYBAADkAwAwtwEAAOUDABC4AQAA5AMAMLkBAQCnAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh3wEBAKcCACHgAQEApwIAIeEBAgCxAgAh4gEBAKgCACHjASAAqQIAIeQBIACpAgAhDbYBAADkAwAwtwEAAOUDABC4AQAA5AMAMLkBAQCnAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh3wEBAKcCACHgAQEApwIAIeEBAgCxAgAh4gEBAKgCACHjASAAqQIAIeQBIACpAgAhCbkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh3wEBAPwCACHhAQIAhgMAIeIBAQD9AgAh4wEgAP4CACHkASAA_gIAIQoGAACVAwAguQEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHfAQEA_AIAIeEBAgCGAwAh4gEBAP0CACHjASAA_gIAIeQBIAD-AgAhCgYAAJcDACC5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB3wEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBIAAAAAEHDQAAoQMAILkBAQAAAAHlAQEAAAAB5gEBAAAAAecBCAAAAAHoAQIAAAAB6QEIAAAAAQIAAAAPACAaAADxAwAgAwAAAA8AIBoAAPEDACAbAADwAwAgARMAAMAEADACAAAADwAgEwAA8AMAIAIAAAC1AwAgEwAA7wMAIAa5AQEA_AIAIeUBAQD8AgAh5gEBAPwCACHnAQgAnQMAIegBAgCGAwAh6QEIAJ0DACEHDQAAnwMAILkBAQD8AgAh5QEBAPwCACHmAQEA_AIAIecBCACdAwAh6AECAIYDACHpAQgAnQMAIQcNAAChAwAguQEBAAAAAeUBAQAAAAHmAQEAAAAB5wEIAAAAAegBAgAAAAHpAQgAAAABAagCAQAAAAQBqAIBAAAABAMaAAC-BAAgpQIAAL8EACCrAgAAPgAgBBoAAOkDADClAgAA6gMAMKcCAADsAwAgqwIAALEDADAEGgAA3QMAMKUCAADeAwAwpwIAAOADACCrAgAA4QMAMAAAAAsaAACIBAAwGwAAjQQAMKUCAACJBAAwpgIAAIoEADCnAgAAiwQAIKgCAACMBAAwqQIAAIwEADCqAgAAjAQAMKsCAACMBAAwrAIAAI4EADCtAgAAjwQAMAsaAAD8AwAwGwAAgQQAMKUCAAD9AwAwpgIAAP4DADCnAgAA_wMAIKgCAACABAAwqQIAAIAEADCqAgAAgAQAMKsCAACABAAwrAIAAIIEADCtAgAAgwQAMA0NAgAAAAG5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB1gFAAAAAAdcBAQAAAAHYAQEAAAAB2QEBAAAAAdoBAQAAAAHbASAAAAAB3AEgAAAAAd4BAQAAAAECAAAAFwAgGgAAhwQAIAMAAAAXACAaAACHBAAgGwAAhgQAIAETAAC9BAAwEggAAOYCACANAgDQAgAhtgEAAOUCADC3AQAAFQAQuAEAAOUCADC5AQEAAAABvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh1gFAAKsCACHXAQEAqAIAIdgBAQCoAgAh2QEBAKgCACHaAQEAqAIAIdsBIACpAgAh3AEgAKkCACHdAQEAqAIAId4BAQCoAgAhAgAAABcAIBMAAIYEACACAAAAhAQAIBMAAIUEACARDQIA0AIAIbYBAACDBAAwtwEAAIQEABC4AQAAgwQAMLkBAQCnAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh1gFAAKsCACHXAQEAqAIAIdgBAQCoAgAh2QEBAKgCACHaAQEAqAIAIdsBIACpAgAh3AEgAKkCACHdAQEAqAIAId4BAQCoAgAhEQ0CANACACG2AQAAgwQAMLcBAACEBAAQuAEAAIMEADC5AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAIdYBQACrAgAh1wEBAKgCACHYAQEAqAIAIdkBAQCoAgAh2gEBAKgCACHbASAAqQIAIdwBIACpAgAh3QEBAKgCACHeAQEAqAIAIQ0NAgCMAwAhuQEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHWAUAAgAMAIdcBAQD9AgAh2AEBAP0CACHZAQEA_QIAIdoBAQD9AgAh2wEgAP4CACHcASAA_gIAId4BAQD9AgAhDQ0CAIwDACG5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdYBQACAAwAh1wEBAP0CACHYAQEA_QIAIdkBAQD9AgAh2gEBAP0CACHbASAA_gIAIdwBIAD-AgAh3gEBAP0CACENDQIAAAABuQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAdYBQAAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEgAAAAAdwBIAAAAAHeAQEAAAABFQoAAPUDACAMAAD2AwAguQEBAAAAAboBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHjASAAAAABjAIBAAAAAZACAQAAAAGRAggAAAABkgIIAAAAAZMCAQAAAAGUAgAA8gMAIJUCIAAAAAGWAgEAAAABlwIgAAAAAZgCIAAAAAGZAiAAAAABmgIgAAAAAZsCAADzAwAgAgAAABMAIBoAAJMEACADAAAAEwAgGgAAkwQAIBsAAJIEACABEwAAvAQAMBoIAADpAgAgCgAA6gIAIAwAAOsCACC2AQAA5wIAMLcBAAARABC4AQAA5wIAMLkBAQAAAAG6AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAId0BAQCnAgAh4wEgAKkCACGMAgEApwIAIZACAQAAAAGRAggAzgIAIZICCADPAgAhkwIBAKcCACGUAgAA0wIAIJUCIADoAgAhlgIBAKgCACGXAiAAqQIAIZgCIACpAgAhmQIgAKkCACGaAiAAqQIAIZsCAADTAgAgAgAAABMAIBMAAJIEACACAAAAkAQAIBMAAJEEACAXtgEAAI8EADC3AQAAkAQAELgBAACPBAAwuQEBAKcCACG6AQEApwIAIb8BIACpAgAhwAFAAKoCACHCAUAAqwIAId0BAQCnAgAh4wEgAKkCACGMAgEApwIAIZACAQCnAgAhkQIIAM4CACGSAggAzwIAIZMCAQCnAgAhlAIAANMCACCVAiAA6AIAIZYCAQCoAgAhlwIgAKkCACGYAiAAqQIAIZkCIACpAgAhmgIgAKkCACGbAgAA0wIAIBe2AQAAjwQAMLcBAACQBAAQuAEAAI8EADC5AQEApwIAIboBAQCnAgAhvwEgAKkCACHAAUAAqgIAIcIBQACrAgAh3QEBAKcCACHjASAAqQIAIYwCAQCnAgAhkAIBAKcCACGRAggAzgIAIZICCADPAgAhkwIBAKcCACGUAgAA0wIAIJUCIADoAgAhlgIBAKgCACGXAiAAqQIAIZgCIACpAgAhmQIgAKkCACGaAiAAqQIAIZsCAADTAgAgE7kBAQD8AgAhugEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHjASAA_gIAIYwCAQD8AgAhkAIBAPwCACGRAggAnQMAIZICCADCAwAhkwIBAPwCACGUAgAA1wMAIJUCIADYAwAhlgIBAP0CACGXAiAA_gIAIZgCIAD-AgAhmQIgAP4CACGaAiAA_gIAIZsCAADZAwAgFQoAANsDACAMAADcAwAguQEBAPwCACG6AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIeMBIAD-AgAhjAIBAPwCACGQAgEA_AIAIZECCACdAwAhkgIIAMIDACGTAgEA_AIAIZQCAADXAwAglQIgANgDACGWAgEA_QIAIZcCIAD-AgAhmAIgAP4CACGZAiAA_gIAIZoCIAD-AgAhmwIAANkDACAVCgAA9QMAIAwAAPYDACC5AQEAAAABugEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAeMBIAAAAAGMAgEAAAABkAIBAAAAAZECCAAAAAGSAggAAAABkwIBAAAAAZQCAADyAwAglQIgAAAAAZYCAQAAAAGXAiAAAAABmAIgAAAAAZkCIAAAAAGaAiAAAAABmwIAAPMDACAEGgAAiAQAMKUCAACJBAAwpwIAAIsEACCrAgAAjAQAMAQaAAD8AwAwpQIAAP0DADCnAgAA_wMAIKsCAACABAAwAAAAAAABqAIAAAChAgIBqAIAAACjAgILGgAAqAQAMBsAAKwEADClAgAAqQQAMKYCAACqBAAwpwIAAKsEACCoAgAAyAMAMKkCAADIAwAwqgIAAMgDADCrAgAAyAMAMKwCAACtBAAwrQIAAMsDADALGgAAnwQAMBsAAKMEADClAgAAoAQAMKYCAAChBAAwpwIAAKIEACCoAgAA4QMAMKkCAADhAwAwqgIAAOEDADCrAgAA4QMAMKwCAACkBAAwrQIAAOQDADAKCwAAlgMAILkBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHgAQEAAAAB4QECAAAAAeIBAQAAAAHjASAAAAAB5AEgAAAAAQIAAAAgACAaAACnBAAgAwAAACAAIBoAAKcEACAbAACmBAAgARMAALsEADACAAAAIAAgEwAApgQAIAIAAADlAwAgEwAApQQAIAm5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIeABAQD8AgAh4QECAIYDACHiAQEA_QIAIeMBIAD-AgAh5AEgAP4CACEKCwAAlAMAILkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh4AEBAPwCACHhAQIAhgMAIeIBAQD9AgAh4wEgAP4CACHkASAA_gIAIQoLAACWAwAguQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAeABAQAAAAHhAQIAAAAB4gEBAAAAAeMBIAAAAAHkASAAAAABGAUAALkDACAHAAC7AwAguQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAdYBQAAAAAHpAQgAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BCAAAAAHvAQgAAAAB8AEIAAAAAfEBAQAAAAHyAQEAAAAB9AEAAAD0AQL2AQAAAPYBAvgBAAAA-AEC-QGAAAAAAfoBIAAAAAH7AQEAAAAB_AEBAAAAAQIAAAAFACAaAACwBAAgAwAAAAUAIBoAALAEACAbAACvBAAgARMAALoEADACAAAABQAgEwAArwQAIAIAAADMAwAgEwAArgQAIBa5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdYBQACAAwAh6QEIAJ0DACHqAQEA_AIAIesBAQD9AgAh7AEBAP0CACHtAQEA_QIAIe4BCACdAwAh7wEIAJ0DACHwAQgAnQMAIfEBAQD9AgAh8gEBAP0CACH0AQAApwP0ASL2AQAAqAP2ASL4AQAAqQP4ASL5AYAAAAAB-gEgAP4CACH7AQEA_QIAIfwBAQD9AgAhGAUAAKoDACAHAACsAwAguQEBAPwCACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHWAUAAgAMAIekBCACdAwAh6gEBAPwCACHrAQEA_QIAIewBAQD9AgAh7QEBAP0CACHuAQgAnQMAIe8BCACdAwAh8AEIAJ0DACHxAQEA_QIAIfIBAQD9AgAh9AEAAKcD9AEi9gEAAKgD9gEi-AEAAKkD-AEi-QGAAAAAAfoBIAD-AgAh-wEBAP0CACH8AQEA_QIAIRgFAAC5AwAgBwAAuwMAILkBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHWAUAAAAAB6QEIAAAAAeoBAQAAAAHrAQEAAAAB7AEBAAAAAe0BAQAAAAHuAQgAAAAB7wEIAAAAAfABCAAAAAHxAQEAAAAB8gEBAAAAAfQBAAAA9AEC9gEAAAD2AQL4AQAAAPgBAvkBgAAAAAH6ASAAAAAB-wEBAAAAAfwBAQAAAAEEGgAAqAQAMKUCAACpBAAwpwIAAKsEACCrAgAAyAMAMAQaAACfBAAwpQIAAKAEADCnAgAAogQAIKsCAADhAwAwAAcIAAC2BAAgCgAAtwQAIAwAALMEACDAAQAA-AIAIJICAAD4AgAglQIAAPgCACCWAgAA-AIAIAUDAADRAwAgDAAAswQAIL4BAAD4AgAgwAEAAPgCACDRAQAA-AIAIAQHAACWBAAgCQAAlwQAIIwCAAD4AgAgkwIAAPgCACAADAUAALkEACAGAAC1BAAgBwAAtwQAIMABAAD4AgAg3wEAAPgCACDrAQAA-AIAIOwBAAD4AgAg7QEAAPgCACDxAQAA-AIAIPIBAAD4AgAg-wEAAPgCACD8AQAA-AIAIAYDAADRAwAgwAEAAPgCACCHAgAA-AIAIIgCAAD4AgAgigIAAPgCACCMAgAA-AIAIBa5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB1gFAAAAAAekBCAAAAAHqAQEAAAAB6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEIAAAAAe8BCAAAAAHwAQgAAAAB8QEBAAAAAfIBAQAAAAH0AQAAAPQBAvYBAAAA9gEC-AEAAAD4AQL5AYAAAAAB-gEgAAAAAfsBAQAAAAH8AQEAAAABCbkBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHgAQEAAAAB4QECAAAAAeIBAQAAAAHjASAAAAAB5AEgAAAAARO5AQEAAAABugEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAeMBIAAAAAGMAgEAAAABkAIBAAAAAZECCAAAAAGSAggAAAABkwIBAAAAAZQCAADyAwAglQIgAAAAAZYCAQAAAAGXAiAAAAABmAIgAAAAAZkCIAAAAAGaAiAAAAABmwIAAPMDACANDQIAAAABuQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAdYBQAAAAAHXAQEAAAAB2AEBAAAAAdkBAQAAAAHaAQEAAAAB2wEgAAAAAdwBIAAAAAHeAQEAAAABCQkAAJUEACC5AQEAAAABugEBAAAAAcIBQAAAAAHcASAAAAAB4wEgAAAAAYwCAQAAAAGQAgEAAAABkwIBAAAAAQIAAAA-ACAaAAC-BAAgBrkBAQAAAAHlAQEAAAAB5gEBAAAAAecBCAAAAAHoAQIAAAAB6QEIAAAAAQm5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB3wEBAAAAAeEBAgAAAAHiAQEAAAAB4wEgAAAAAeQBIAAAAAEDAAAAGQAgGgAAvgQAIBsAAMQEACALAAAAGQAgCQAA-wMAIBMAAMQEACC5AQEA_AIAIboBAQD8AgAhwgFAAIADACHcASAA_gIAIeMBIAD-AgAhjAIBAP0CACGQAgEA_AIAIZMCAQD9AgAhCQkAAPsDACC5AQEA_AIAIboBAQD8AgAhwgFAAIADACHcASAA_gIAIeMBIAD-AgAhjAIBAP0CACGQAgEA_AIAIZMCAQD9AgAhFrkBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHWAUAAAAAB3wEBAAAAAekBCAAAAAHqAQEAAAAB6wEBAAAAAewBAQAAAAHtAQEAAAAB7gEIAAAAAe8BCAAAAAHwAQgAAAAB8gEBAAAAAfQBAAAA9AEC9gEAAAD2AQL4AQAAAPgBAvkBgAAAAAH6ASAAAAAB-wEBAAAAAfwBAQAAAAENDAAAsgQAILkBAQAAAAG6AQEAAAABuwEBAAAAAb4BAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHRAQEAAAAB1gFAAAAAAfQBAAAAowICnwIBAAAAAaECAAAAoQICAgAAAAEAIBoAAMYEACAQuQEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAdYBQAAAAAHXAQEAAAAB3AEgAAAAAYMCAQAAAAGFAgAAAIUCAoYCCAAAAAGHAggAAAABiAIIAAAAAYkCQAAAAAGKAgIAAAABiwICAAAAAYwCAQAAAAECAAAAbAAgGgAAyAQAIAa5AQEAAAAB4AEBAAAAAeYBAQAAAAHnAQgAAAAB6AECAAAAAekBCAAAAAEDAAAACwAgGgAAxgQAIBsAAM0EACAPAAAACwAgDAAAngQAIBMAAM0EACC5AQEA_AIAIboBAQD8AgAhuwEBAPwCACG-AQEA_QIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdEBAQD9AgAh1gFAAIADACH0AQAAnASjAiKfAgEA_AIAIaECAACbBKECIg0MAACeBAAguQEBAPwCACG6AQEA_AIAIbsBAQD8AgAhvgEBAP0CACG_ASAA_gIAIcABQAD_AgAhwgFAAIADACHRAQEA_QIAIdYBQACAAwAh9AEAAJwEowIinwIBAPwCACGhAgAAmwShAiIDAAAABwAgGgAAyAQAIBsAANAEACASAAAABwAgEwAA0AQAILkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh1gFAAIADACHXAQEA_AIAIdwBIAD-AgAhgwIBAPwCACGFAgAAwQOFAiKGAggAnQMAIYcCCADCAwAhiAIIAMIDACGJAkAAgAMAIYoCAgCMAwAhiwICAIYDACGMAgEA_QIAIRC5AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdYBQACAAwAh1wEBAPwCACHcASAA_gIAIYMCAQD8AgAhhQIAAMEDhQIihgIIAJ0DACGHAggAwgMAIYgCCADCAwAhiQJAAIADACGKAgIAjAMAIYsCAgCGAwAhjAIBAP0CACEZBQAAuQMAIAYAALoDACC5AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB1gFAAAAAAd8BAQAAAAHpAQgAAAAB6gEBAAAAAesBAQAAAAHsAQEAAAAB7QEBAAAAAe4BCAAAAAHvAQgAAAAB8AEIAAAAAfEBAQAAAAHyAQEAAAAB9AEAAAD0AQL2AQAAAPYBAvgBAAAA-AEC-QGAAAAAAfoBIAAAAAH7AQEAAAAB_AEBAAAAAQIAAAAFACAaAADRBAAgFggAAPQDACAMAAD2AwAguQEBAAAAAboBAQAAAAG_ASAAAAABwAFAAAAAAcIBQAAAAAHdAQEAAAAB4wEgAAAAAYwCAQAAAAGQAgEAAAABkQIIAAAAAZICCAAAAAGTAgEAAAABlAIAAPIDACCVAiAAAAABlgIBAAAAAZcCIAAAAAGYAiAAAAABmQIgAAAAAZoCIAAAAAGbAgAA8wMAIAIAAAATACAaAADTBAAgAwAAAAMAIBoAANEEACAbAADXBAAgGwAAAAMAIAUAAKoDACAGAACrAwAgEwAA1wQAILkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh1gFAAIADACHfAQEA_QIAIekBCACdAwAh6gEBAPwCACHrAQEA_QIAIewBAQD9AgAh7QEBAP0CACHuAQgAnQMAIe8BCACdAwAh8AEIAJ0DACHxAQEA_QIAIfIBAQD9AgAh9AEAAKcD9AEi9gEAAKgD9gEi-AEAAKkD-AEi-QGAAAAAAfoBIAD-AgAh-wEBAP0CACH8AQEA_QIAIRkFAACqAwAgBgAAqwMAILkBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh1gFAAIADACHfAQEA_QIAIekBCACdAwAh6gEBAPwCACHrAQEA_QIAIewBAQD9AgAh7QEBAP0CACHuAQgAnQMAIe8BCACdAwAh8AEIAJ0DACHxAQEA_QIAIfIBAQD9AgAh9AEAAKcD9AEi9gEAAKgD9gEi-AEAAKkD-AEi-QGAAAAAAfoBIAD-AgAh-wEBAP0CACH8AQEA_QIAIQMAAAARACAaAADTBAAgGwAA2gQAIBgAAAARACAIAADaAwAgDAAA3AMAIBMAANoEACC5AQEA_AIAIboBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh3QEBAPwCACHjASAA_gIAIYwCAQD8AgAhkAIBAPwCACGRAggAnQMAIZICCADCAwAhkwIBAPwCACGUAgAA1wMAIJUCIADYAwAhlgIBAP0CACGXAiAA_gIAIZgCIAD-AgAhmQIgAP4CACGaAiAA_gIAIZsCAADZAwAgFggAANoDACAMAADcAwAguQEBAPwCACG6AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAId0BAQD8AgAh4wEgAP4CACGMAgEA_AIAIZACAQD8AgAhkQIIAJ0DACGSAggAwgMAIZMCAQD8AgAhlAIAANcDACCVAiAA2AMAIZYCAQD9AgAhlwIgAP4CACGYAiAA_gIAIZkCIAD-AgAhmgIgAP4CACGbAgAA2QMAIA0DAACxBAAguQEBAAAAAboBAQAAAAG7AQEAAAABvgEBAAAAAb8BIAAAAAHAAUAAAAABwgFAAAAAAdEBAQAAAAHWAUAAAAAB9AEAAACjAgKfAgEAAAABoQIAAAChAgICAAAAAQAgGgAA2wQAIBYIAAD0AwAgCgAA9QMAILkBAQAAAAG6AQEAAAABvwEgAAAAAcABQAAAAAHCAUAAAAAB3QEBAAAAAeMBIAAAAAGMAgEAAAABkAIBAAAAAZECCAAAAAGSAggAAAABkwIBAAAAAZQCAADyAwAglQIgAAAAAZYCAQAAAAGXAiAAAAABmAIgAAAAAZkCIAAAAAGaAiAAAAABmwIAAPMDACACAAAAEwAgGgAA3QQAIAMAAAALACAaAADbBAAgGwAA4QQAIA8AAAALACADAACdBAAgEwAA4QQAILkBAQD8AgAhugEBAPwCACG7AQEA_AIAIb4BAQD9AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh0QEBAP0CACHWAUAAgAMAIfQBAACcBKMCIp8CAQD8AgAhoQIAAJsEoQIiDQMAAJ0EACC5AQEA_AIAIboBAQD8AgAhuwEBAPwCACG-AQEA_QIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAIdEBAQD9AgAh1gFAAIADACH0AQAAnASjAiKfAgEA_AIAIaECAACbBKECIgMAAAARACAaAADdBAAgGwAA5AQAIBgAAAARACAIAADaAwAgCgAA2wMAIBMAAOQEACC5AQEA_AIAIboBAQD8AgAhvwEgAP4CACHAAUAA_wIAIcIBQACAAwAh3QEBAPwCACHjASAA_gIAIYwCAQD8AgAhkAIBAPwCACGRAggAnQMAIZICCADCAwAhkwIBAPwCACGUAgAA1wMAIJUCIADYAwAhlgIBAP0CACGXAiAA_gIAIZgCIAD-AgAhmQIgAP4CACGaAiAA_gIAIZsCAADZAwAgFggAANoDACAKAADbAwAguQEBAPwCACG6AQEA_AIAIb8BIAD-AgAhwAFAAP8CACHCAUAAgAMAId0BAQD8AgAh4wEgAP4CACGMAgEA_AIAIZACAQD8AgAhkQIIAJ0DACGSAggAwgMAIZMCAQD8AgAhlAIAANcDACCVAiAA2AMAIZYCAQD9AgAhlwIgAP4CACGYAiAA_gIAIZkCIAD-AgAhmgIgAP4CACGbAgAA2QMAIAkHAACUBAAguQEBAAAAAboBAQAAAAHCAUAAAAAB3AEgAAAAAeMBIAAAAAGMAgEAAAABkAIBAAAAAZMCAQAAAAECAAAAPgAgGgAA5QQAIAMAAAAZACAaAADlBAAgGwAA6QQAIAsAAAAZACAHAAD6AwAgEwAA6QQAILkBAQD8AgAhugEBAPwCACHCAUAAgAMAIdwBIAD-AgAh4wEgAP4CACGMAgEA_QIAIZACAQD8AgAhkwIBAP0CACEJBwAA-gMAILkBAQD8AgAhugEBAPwCACHCAUAAgAMAIdwBIAD-AgAh4wEgAP4CACGMAgEA_QIAIZACAQD8AgAhkwIBAP0CACEDAwYCBAANDCUKBAQADAUIAwYMAQcQBQIDCQIEAAQBAwoAAgsABg0AAgQEAAsIAAcKHQUMIQoDBAAJBxQGCRgIAQgaBwIHGwAJHAACBgABCwAGAgoiAAwjAAEHJAACAyYADCcAAAAAAwQAEiAAEyEAFAAAAAMEABIgABMhABQAAAMEABkgABohABsAAAADBAAZIAAaIQAbAQgABwEIAAcFBAAgIAAjIQAkQgAhQwAiAAAAAAAFBAAgIAAjIQAkQgAhQwAiAAAFBAApIAAsIQAtQgAqQwArAAAAAAAFBAApIAAsIQAtQgAqQwArAgWOAQMGjwEBAgWVAQMGlgEBBQQAMiAANSEANkIAM0MANAAAAAAABQQAMiAANSEANkIAM0MANAILAAYNAAICCwAGDQACBQQAOyAAPiEAP0IAPEMAPQAAAAAABQQAOyAAPiEAP0IAPEMAPQIGAAELAAYCBgABCwAGBQQARCAARyEASEIARUMARgAAAAAABQQARCAARyEASEIARUMARgEI1AEHAQjaAQcFBABNIABQIQBRQgBOQwBPAAAAAAAFBABNIABQIQBRQgBOQwBPAAAABQQAVyAAWiEAW0IAWEMAWQAAAAAABQQAVyAAWiEAW0IAWEMAWQAAAAMEAGEgAGIhAGMAAAADBABhIABiIQBjDgIBDygBECoBESsBEiwBFC4BFTAOFjEPFzMBGDUOGTYQHDcBHTgBHjkOIjwRIz0VJD8HJUAHJkIHJ0MHKEQHKUYHKkgOK0kWLEsHLU0OLk4XL08HMFAHMVEOMlQYM1UcNFYGNVcGNlgGN1kGOFoGOVwGOl4OO18dPGEGPWMOPmQeP2UGQGYGQWcORGofRWslRm0DR24DSHADSXEDSnIDS3QDTHYOTXcmTnkDT3sOUHwnUX0DUn4DU38OVIIBKFWDAS5WhAECV4UBAliGAQJZhwECWogBAluKAQJcjAEOXY0BL16RAQJfkwEOYJQBMGGXAQJimAECY5kBDmScATFlnQE3Zp4BBWefAQVooAEFaaEBBWqiAQVrpAEFbKYBDm2nAThuqQEFb6sBDnCsATlxrQEFcq4BBXOvAQ50sgE6dbMBQHa0AQp3tQEKeLYBCnm3AQp6uAEKe7oBCny8AQ59vQFBfr8BCn_BAQ6AAcIBQoEBwwEKggHEAQqDAcUBDoQByAFDhQHJAUmGAcoBCIcBywEIiAHMAQiJAc0BCIoBzgEIiwHQAQiMAdIBDo0B0wFKjgHWAQiPAdgBDpAB2QFLkQHbAQiSAdwBCJMB3QEOlAHgAUyVAeEBUpYB4wFTlwHkAVOYAecBU5kB6AFTmgHpAVObAesBU5wB7QEOnQHuAVSeAfABU58B8gEOoAHzAVWhAfQBU6IB9QFTowH2AQ6kAfkBVqUB-gFcpgH8AV2nAf0BXagBgAJdqQGBAl2qAYICXasBhAJdrAGGAg6tAYcCXq4BiQJdrwGLAg6wAYwCX7EBjQJdsgGOAl2zAY8CDrQBkgJgtQGTAmQ"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AnyNull: () => AnyNull2,
  BannerScalarFieldEnum: () => BannerScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  ContactScalarFieldEnum: () => ContactScalarFieldEnum,
  CouponScalarFieldEnum: () => CouponScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  ItemScalarFieldEnum: () => ItemScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  JsonNullValueInput: () => JsonNullValueInput,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  OrderItemScalarFieldEnum: () => OrderItemScalarFieldEnum,
  OrderScalarFieldEnum: () => OrderScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SettingScalarFieldEnum: () => SettingScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.8.0",
  engine: "3c6e192761c0362d496ed980de936e2f3cebcd3a"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Category: "Category",
  Item: "Item",
  Coupon: "Coupon",
  Order: "Order",
  OrderItem: "OrderItem",
  Review: "Review",
  Banner: "Banner",
  Setting: "Setting",
  Contact: "Contact"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  password: "password",
  role: "role",
  status: "status",
  phone: "phone",
  address: "address",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  imageUrl: "imageUrl",
  description: "description",
  isActive: "isActive",
  isFeatured: "isFeatured",
  createdAt: "createdAt"
};
var ItemScalarFieldEnum = {
  id: "id",
  name: "name",
  slug: "slug",
  description: "description",
  price: "price",
  discountPrice: "discountPrice",
  imageUrl: "imageUrl",
  images: "images",
  categoryId: "categoryId",
  isSpicy: "isSpicy",
  weight: "weight",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  isAvailable: "isAvailable",
  isFeatured: "isFeatured",
  isBestSelling: "isBestSelling",
  isCategoryFeatured: "isCategoryFeatured",
  isNew: "isNew",
  tags: "tags",
  createdAt: "createdAt"
};
var CouponScalarFieldEnum = {
  id: "id",
  code: "code",
  title: "title",
  discountType: "discountType",
  discountValue: "discountValue",
  minOrderAmount: "minOrderAmount",
  maxDiscountAmount: "maxDiscountAmount",
  expiryDate: "expiryDate",
  usageLimit: "usageLimit",
  usedCount: "usedCount",
  isActive: "isActive",
  description: "description",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderScalarFieldEnum = {
  id: "id",
  orderNumber: "orderNumber",
  userId: "userId",
  customerName: "customerName",
  customerPhone: "customerPhone",
  customerEmail: "customerEmail",
  subtotal: "subtotal",
  discountAmount: "discountAmount",
  deliveryCharge: "deliveryCharge",
  total: "total",
  couponId: "couponId",
  couponCode: "couponCode",
  status: "status",
  paymentMethod: "paymentMethod",
  paymentStatus: "paymentStatus",
  deliveryAddress: "deliveryAddress",
  isInsideDhaka: "isInsideDhaka",
  invoicePdf: "invoicePdf",
  notes: "notes",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var OrderItemScalarFieldEnum = {
  id: "id",
  orderId: "orderId",
  itemId: "itemId",
  itemName: "itemName",
  itemPrice: "itemPrice",
  quantity: "quantity",
  total: "total"
};
var ReviewScalarFieldEnum = {
  id: "id",
  userId: "userId",
  itemId: "itemId",
  rating: "rating",
  comment: "comment",
  isFeatured: "isFeatured",
  isApproved: "isApproved",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt"
};
var BannerScalarFieldEnum = {
  id: "id",
  title: "title",
  subtitle: "subtitle",
  badge: "badge",
  image: "image",
  order: "order",
  banner: "banner",
  isActive: "isActive",
  categoryId: "categoryId",
  buttonText: "buttonText",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SettingScalarFieldEnum = {
  id: "id",
  siteName: "siteName",
  tagline: "tagline",
  logoUrl: "logoUrl",
  phone: "phone",
  email: "email",
  address: "address",
  openTime: "openTime",
  closeTime: "closeTime",
  facebookUrl: "facebookUrl",
  instagramUrl: "instagramUrl",
  updatedAt: "updatedAt"
};
var ContactScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  subject: "subject",
  message: "message",
  phone: "phone",
  isDeleted: "isDeleted",
  deletedAt: "deletedAt",
  isRead: "isRead",
  createdAt: "createdAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var JsonNullValueInput = {
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/enums.ts
var DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED"
};
var OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED"
};
var PaymentMethod = {
  COD: "COD",
  ONLINE: "ONLINE"
};
var PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED"
};

// src/generated/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = Messages.SERVER_ERROR;
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError_default(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaError_default(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message,
    stack: env.NODE_ENV === "development" ? err.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/middlewares/notFound.ts
var notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `${Messages.NOT_FOUND} - ${req.originalUrl}`
  });
};
var notFound_default = notFound;

// src/routes/index.ts
import express11 from "express";

// src/modules/auth/auth.route.ts
import express from "express";

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
var connectionString = `${env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/server.ts
var startServer = async () => {
  try {
    await prisma.$connect();
    console.log("\u2705 Connected to database successfully");
    app_default.listen(env.PORT, () => {
      console.log(`\u{1F680} Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("\u274C Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};
startServer();
process.on("unhandledRejection", async (err) => {
  console.log("UNHANDLED REJECTION! \u{1F4A5} Shutting down...");
  console.log(err);
  await prisma.$disconnect();
  process.exit(1);
});
process.on("uncaughtException", async (err) => {
  console.log("UNCAUGHT EXCEPTION! \u{1F4A5} Shutting down...");
  console.log(err);
  await prisma.$disconnect();
  process.exit(1);
});

// src/utils/bcrypt.ts
import bcrypt from "bcrypt";
var hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};
var comparePassword = async (plainText, hash) => {
  return await bcrypt.compare(plainText, hash);
};

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};
var verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

// src/modules/auth/auth.utils.ts
var createToken = (jwtPayload, secret, expiresIn) => {
  return generateToken(jwtPayload, secret, expiresIn);
};
var verifyAuthToken = (token, secret) => {
  return verifyToken(token, secret);
};

// src/modules/auth/auth.service.ts
var registerUser = async (payload) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (existingUser) {
    throw new AppError_default(409, "User with this email already exists");
  }
  const hashedPassword = await hashPassword(payload.password);
  const { role, ...userData } = payload;
  const newUser = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      role: "CUSTOMER"
    }
  });
  const { password, ...userWithoutPassword } = newUser;
  const jwtPayload = {
    userId: newUser.id,
    role: newUser.role,
    email: newUser.email
  };
  const accessToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN
  );
  const refreshToken3 = createToken(
    jwtPayload,
    env.JWT_SECRET,
    "7d"
  );
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken: refreshToken3
  };
};
var loginUser = async (payload) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email }
  });
  if (!user) {
    throw new AppError_default(404, "User not found");
  }
  const isPasswordMatched = await comparePassword(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError_default(401, "Invalid credentials");
  }
  const jwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email
  };
  const accessToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN
  );
  const refreshToken3 = createToken(
    jwtPayload,
    env.JWT_SECRET,
    "7d"
  );
  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken: refreshToken3
  };
};
var refreshToken = async (token) => {
  let decoded;
  try {
    decoded = verifyAuthToken(token, env.JWT_SECRET);
  } catch (error) {
    throw new AppError_default(401, "Invalid refresh token");
  }
  const user = await prisma.user.findUnique({
    where: { email: decoded.email }
  });
  if (!user) {
    throw new AppError_default(404, "User not found");
  }
  const jwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email
  };
  const accessToken = createToken(
    jwtPayload,
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN
  );
  return {
    accessToken
  };
};
var getMe = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) {
    throw new AppError_default(404, "User not found");
  }
  return user;
};
var AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  getMe
};

// src/modules/auth/auth.controller.ts
var registerUser2 = catchAsync_default(async (req, res) => {
  const result = await AuthService.registerUser(req.body);
  const { refreshToken: refreshToken3, accessToken, user } = result;
  res.cookie("refreshToken", refreshToken3, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
  sendResponse_default(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: {
      user,
      accessToken
    }
  });
});
var loginUser2 = catchAsync_default(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken: refreshToken3, accessToken, user } = result;
  res.cookie("refreshToken", refreshToken3, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: {
      user,
      accessToken
    }
  });
});
var refreshToken2 = catchAsync_default(async (req, res) => {
  const { refreshToken: refreshToken3 } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken3);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Access token retrieved successfully",
    data: result
  });
});
var logout = catchAsync_default(async (req, res) => {
  res.clearCookie("refreshToken");
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Logged out successfully",
    data: null
  });
});
var getMe2 = catchAsync_default(async (req, res) => {
  const { email } = req.user;
  const result = await AuthService.getMe(email);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result
  });
});
var AuthController = {
  registerUser: registerUser2,
  loginUser: loginUser2,
  refreshToken: refreshToken2,
  logout,
  getMe: getMe2
};

// src/middlewares/validateRequest.ts
var validateRequest = (schema) => {
  return catchAsync_default(async (req, res, next) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies
    });
    next();
  });
};
var validateRequest_default = validateRequest;

// src/modules/auth/auth.validation.ts
import { z as z2 } from "zod";
var registerValidationSchema = z2.object({
  body: z2.object({
    name: z2.string().min(1, "Name is required"),
    email: z2.string().email("Invalid email address"),
    password: z2.string().min(6, "Password must be at least 6 characters long"),
    phone: z2.string().optional(),
    address: z2.string().optional()
  })
});
var loginValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address"),
    password: z2.string().min(1, "Password is required")
  })
});
var refreshTokenValidationSchema = z2.object({
  cookies: z2.object({
    refreshToken: z2.string().min(1, "Refresh token is required")
  })
});
var AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  refreshTokenValidationSchema
};

// src/middlewares/auth.ts
import jwt2 from "jsonwebtoken";
var auth = catchAsync_default(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError_default(401, Messages.UNAUTHORIZED);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt2.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true, isDeleted: true }
    });
    if (!user || user.isDeleted) {
      throw new AppError_default(401, Messages.UNAUTHORIZED);
    }
    if (user.status === "BANNED") {
      throw new AppError_default(403, "You are banned. Please contact admin.");
    }
    req.user = { ...decoded, status: user.status };
    next();
  } catch (err) {
    if (err instanceof AppError_default) {
      throw err;
    }
    throw new AppError_default(401, "Invalid token or expired");
  }
});
var auth_default = auth;

// src/modules/auth/auth.route.ts
var router = express.Router();
router.post(
  "/register",
  authLimiter,
  validateRequest_default(AuthValidation.registerValidationSchema),
  AuthController.registerUser
);
router.post(
  "/login",
  authLimiter,
  validateRequest_default(AuthValidation.loginValidationSchema),
  AuthController.loginUser
);
router.post(
  "/refresh-token",
  validateRequest_default(AuthValidation.refreshTokenValidationSchema),
  AuthController.refreshToken
);
router.post(
  "/logout",
  AuthController.logout
);
router.get(
  "/me",
  auth_default,
  AuthController.getMe
);
var AuthRoutes = router;

// src/modules/user/user.route.ts
import express2 from "express";

// src/utils/QueryBuilder.ts
var QueryBuilder = class {
  constructor(model, queryParams, config2 = {}) {
    this.model = model;
    this.queryParams = queryParams;
    this.config = config2;
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: this.skip,
      take: this.limit
    };
    this.countQuery = {
      where: {}
    };
  }
  model;
  queryParams;
  config;
  query;
  countQuery;
  page = 1;
  limit = 10;
  skip = 0;
  sortBy = "createdAt";
  sortOrder = "desc";
  selectFields;
  // Helper to determine if we should wrap in 'some'
  getRelationContext(relation) {
    const isMany = this.config.relationConfig?.[relation] === "many";
    return {
      isMany,
      operator: isMany ? "some" : null
    };
  }
  search() {
    const { searchTerm, search } = this.queryParams;
    const { searchableFields } = this.config;
    const actualSearchTerm = searchTerm || search;
    if (actualSearchTerm && searchableFields && searchableFields.length > 0) {
      const searchCondition = searchableFields.map(
        (field) => {
          const stringFilter = {
            contains: actualSearchTerm,
            mode: "insensitive"
          };
          if (field.includes(".")) {
            const parts = field.split(".");
            const relation = parts[0];
            const { operator } = this.getRelationContext(relation);
            if (parts.length === 2) {
              const relationField = parts[1];
              const content = { [relationField]: stringFilter };
              return {
                [relation]: operator ? { [operator]: content } : content
              };
            } else if (parts.length === 3) {
              const nestedRelation = parts[1];
              const relationField = parts[2];
              const nestedContent = {
                [nestedRelation]: { [relationField]: stringFilter }
              };
              return {
                [relation]: operator ? { [operator]: nestedContent } : nestedContent
              };
            }
          }
          return { [field]: stringFilter };
        }
      );
      const whereConditions = this.query.where;
      whereConditions.OR = searchCondition;
      const countWhereCondition = this.countQuery.where;
      countWhereCondition.OR = searchCondition;
    }
    return this;
  }
  filter() {
    const { filterableFields } = this.config;
    const excludeFields = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "include"
    ];
    const filterParams = {};
    Object.keys(this.queryParams).forEach((key) => {
      if (!excludeFields.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });
    const queryWhere = this.query.where;
    const countQueryWhere = this.countQuery.where;
    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value === void 0 || value === null || value === "") return;
      if (filterableFields && !filterableFields.includes(key)) return;
      if (key.includes(".")) {
        const parts = key.split(".");
        const relation = parts[0];
        const { operator } = this.getRelationContext(relation);
        if (!queryWhere[relation]) {
          queryWhere[relation] = operator ? { [operator]: {} } : {};
          countQueryWhere[relation] = operator ? { [operator]: {} } : {};
        }
        const targetQuery = operator ? queryWhere[relation][operator] : queryWhere[relation];
        const targetCount = operator ? countQueryWhere[relation][operator] : countQueryWhere[relation];
        if (parts.length === 2) {
          const field = parts[1];
          targetQuery[field] = this.parseFilterValue(value);
          targetCount[field] = this.parseFilterValue(value);
        } else if (parts.length === 3) {
          const nestedRelation = parts[1];
          const field = parts[2];
          if (!targetQuery[nestedRelation]) {
            targetQuery[nestedRelation] = {};
            targetCount[nestedRelation] = {};
          }
          targetQuery[nestedRelation][field] = this.parseFilterValue(value);
          targetCount[nestedRelation][field] = this.parseFilterValue(value);
        }
        return;
      }
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const parsedRange = this.parseRangeFilter(value);
        queryWhere[key] = parsedRange;
        countQueryWhere[key] = parsedRange;
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }
  // --- Methods below remain structurally consistent but utilize the dynamic logic above ---
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.skip = (page - 1) * limit;
    this.limit = limit;
    this.page = page;
    this.query.skip = this.skip;
    this.query.take = this.limit;
    return this;
  }
  sort() {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder || "desc";
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    if (sortBy.includes(".")) {
      const parts = sortBy.split(".");
      if (parts.length === 2) {
        const relation = parts[0];
        const field = parts[1];
        this.query.orderBy = { [relation]: { [field]: sortOrder } };
      } else if (parts.length === 3) {
        const rel = parts[0];
        const nested = parts[1];
        const field = parts[2];
        this.query.orderBy = { [rel]: { [nested]: { [field]: sortOrder } } };
      }
    } else {
      this.query.orderBy = { [sortBy]: sortOrder };
    }
    return this;
  }
  fields() {
    const fieldsParam = this.queryParams.fields || "";
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam.split(",").map((f) => f.trim());
      this.selectFields = {};
      fieldsArray.forEach((f) => {
        if (this.selectFields) this.selectFields[f] = true;
      });
      this.query.select = this.selectFields;
      delete this.query.include;
    }
    return this;
  }
  include(relation) {
    if (this.selectFields) return this;
    this.query.include = { ...this.query.include, ...relation };
    return this;
  }
  omit(fields) {
    this.query.omit = { ...this.query.omit, ...fields };
    return this;
  }
  where(conditions) {
    this.query.where = this.deepMerge(
      this.query.where,
      conditions
    );
    this.countQuery.where = this.deepMerge(
      this.countQuery.where,
      conditions
    );
    return this;
  }
  async execute() {
    const [total, data] = await Promise.all([
      this.model.count({ where: this.countQuery.where }),
      this.model.findMany(this.query)
    ]);
    return {
      data,
      meta: {
        limit: this.limit,
        page: this.page,
        total,
        totalPage: Math.ceil(total / this.limit),
        sortBy: this.sortBy,
        sortOrder: this.sortOrder
      }
    };
  }
  deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
  parseFilterValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (typeof value === "string" && value.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
          const result = {};
          for (const key in parsed) {
            result[key] = this.parseFilterValue(parsed[key]);
          }
          return result;
        }
        return parsed;
      } catch {
      }
    }
    if (typeof value === "string" && value.trim() !== "" && !isNaN(Number(value))) {
      return Number(value);
    }
    if (Array.isArray(value)) return value.map((v) => this.parseFilterValue(v));
    return value;
  }
  parseRangeFilter(value) {
    const rangeQuery = {};
    const operators = [
      "lt",
      "lte",
      "gt",
      "gte",
      "equals",
      "not",
      "contains",
      "startsWith",
      "endsWith",
      "in",
      "notIn"
    ];
    Object.keys(value).forEach((op) => {
      if (operators.includes(op)) {
        rangeQuery[op] = this.parseFilterValue(value[op]);
      }
    });
    return rangeQuery;
  }
};

// src/modules/user/user.constant.ts
var userSearchableFields = ["name", "email", "phone"];
var userFilterableFields = ["role", "status", "isDeleted"];

// src/modules/user/user.service.ts
var getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      createdAt: true
    }
  });
  if (!user) throw new AppError_default(404, "User not found");
  return user;
};
var updateProfile = async (userId, payload) => {
  const { role, ...updateData } = payload;
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      updatedAt: true
    }
  });
  return user;
};
var changePassword = async (userId, payload) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError_default(404, "User not found");
  const isMatched = await comparePassword(payload.oldPassword, user.password);
  if (!isMatched) throw new AppError_default(401, "Incorrect old password");
  const hashedNewPassword = await hashPassword(payload.newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });
  return null;
};
var getAllUsers = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.user, queries, {
    searchableFields: userSearchableFields,
    filterableFields: userFilterableFields
  }).search().filter().sort().paginate().omit({ password: true }).include({ _count: { select: { orders: true } } });
  const result = await queryBuilder.execute();
  return result;
};
var deleteUser = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
  return null;
};
var updateUserStatus = async (userId, status) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  if (!user) {
    throw new AppError_default(404, "User not found");
  }
  if (user.role === "ADMIN") {
    throw new AppError_default(403, "Cannot change status for admin users");
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true
    }
  });
  return updatedUser;
};
var UserService = {
  getMyProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
  updateUserStatus
};

// src/modules/user/user.controller.ts
var getMyProfile2 = catchAsync_default(async (req, res) => {
  const result = await UserService.getMyProfile(req.user.userId);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Profile retrieved", data: result });
});
var updateProfile2 = catchAsync_default(async (req, res) => {
  const result = await UserService.updateProfile(req.user.userId, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Profile updated", data: result });
});
var changePassword2 = catchAsync_default(async (req, res) => {
  await UserService.changePassword(req.user.userId, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Password changed successfully", data: null });
});
var getAllUsers2 = catchAsync_default(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Users retrieved", meta: result.meta, data: result.data });
});
var deleteUser2 = catchAsync_default(async (req, res) => {
  await UserService.deleteUser(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "User deleted", data: null });
});
var updateUserStatus2 = catchAsync_default(async (req, res) => {
  const result = await UserService.updateUserStatus(req.params.id, req.body.status);
  sendResponse_default(res, { statusCode: 200, success: true, message: "User status updated", data: result });
});
var UserController = {
  getMyProfile: getMyProfile2,
  updateProfile: updateProfile2,
  changePassword: changePassword2,
  getAllUsers: getAllUsers2,
  deleteUser: deleteUser2,
  updateUserStatus: updateUserStatus2
};

// src/modules/user/user.validation.ts
import { z as z3 } from "zod";
var updateProfileSchema = z3.object({
  body: z3.object({
    name: z3.string().optional(),
    phone: z3.string().optional(),
    address: z3.string().optional()
  })
});
var changePasswordSchema = z3.object({
  body: z3.object({
    oldPassword: z3.string().min(1, "Old password is required"),
    newPassword: z3.string().min(6, "New password must be at least 6 characters long")
  })
});
var updateUserStatusSchema = z3.object({
  body: z3.object({
    status: z3.enum(["ACTIVE", "INACTIVE", "BANNED"])
  })
});
var UserValidation = {
  updateProfileSchema,
  changePasswordSchema,
  updateUserStatusSchema
};

// src/constants/roles.ts
var Roles = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER"
};

// src/middlewares/admin.ts
var admin = catchAsync_default(async (req, res, next) => {
  if (req.user.role !== Roles.ADMIN) {
    throw new AppError_default(403, Messages.FORBIDDEN);
  }
  next();
});
var admin_default = admin;

// src/modules/user/user.route.ts
var router2 = express2.Router();
router2.get("/profile", auth_default, UserController.getMyProfile);
router2.patch("/profile", auth_default, validateRequest_default(UserValidation.updateProfileSchema), UserController.updateProfile);
router2.patch("/change-password", auth_default, validateRequest_default(UserValidation.changePasswordSchema), UserController.changePassword);
router2.get("/", auth_default, admin_default, adminLimiter, UserController.getAllUsers);
router2.patch("/:id/status", auth_default, admin_default, adminLimiter, validateRequest_default(UserValidation.updateUserStatusSchema), UserController.updateUserStatus);
router2.delete("/:id", auth_default, admin_default, adminLimiter, UserController.deleteUser);
var UserRoutes = router2;

// src/modules/banner/banner.route.ts
import express3 from "express";

// src/modules/banner/banner.constant.ts
var bannerSearchableFields = ["title", "subtitle", "badge"];
var bannerFilterableFields = ["isActive", "banner", "isDeleted", "categoryId"];
var bannerIncludeConfig = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  }
};

// src/modules/banner/banner.service.ts
var createBanner = async (payload) => {
  return await prisma.banner.create({ data: payload });
};
var getAllBanners = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.banner, queries, {
    searchableFields: bannerSearchableFields,
    filterableFields: bannerFilterableFields
  }).where({ isDeleted: false }).search().filter().sort().paginate().include(bannerIncludeConfig);
  const result = await queryBuilder.execute();
  return result;
};
var updateBanner = async (id, payload) => {
  return await prisma.banner.update({
    where: { id },
    data: payload
  });
};
var deleteBanner = async (id) => {
  return await prisma.banner.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
};
var BannerService = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner
};

// src/modules/banner/banner.controller.ts
var createBanner2 = catchAsync_default(async (req, res) => {
  const result = await BannerService.createBanner(req.body);
  sendResponse_default(res, { statusCode: 201, success: true, message: "Banner created", data: result });
});
var getAllBanners2 = catchAsync_default(async (req, res) => {
  const result = await BannerService.getAllBanners(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Banners retrieved", meta: result.meta, data: result.data });
});
var updateBanner2 = catchAsync_default(async (req, res) => {
  const result = await BannerService.updateBanner(req.params.id, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Banner updated", data: result });
});
var deleteBanner2 = catchAsync_default(async (req, res) => {
  await BannerService.deleteBanner(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Banner deleted", data: null });
});
var BannerController = {
  createBanner: createBanner2,
  getAllBanners: getAllBanners2,
  updateBanner: updateBanner2,
  deleteBanner: deleteBanner2
};

// src/modules/banner/banner.validation.ts
import { z as z4 } from "zod";
var createBannerSchema = z4.object({
  body: z4.object({
    title: z4.string().optional(),
    subtitle: z4.string().optional(),
    badge: z4.string().optional(),
    image: z4.string().url("Invalid image URL").optional(),
    order: z4.number().int().optional(),
    banner: z4.boolean().optional(),
    isActive: z4.boolean().optional(),
    categoryId: z4.string().optional(),
    buttonText: z4.string().optional()
  })
});
var updateBannerSchema = z4.object({
  body: z4.object({
    title: z4.string().optional(),
    subtitle: z4.string().optional(),
    badge: z4.string().optional(),
    image: z4.string().url().optional(),
    order: z4.number().int().optional(),
    banner: z4.boolean().optional(),
    isActive: z4.boolean().optional(),
    categoryId: z4.string().optional(),
    buttonText: z4.string().optional()
  })
});
var BannerValidation = {
  createBannerSchema,
  updateBannerSchema
};

// src/modules/banner/banner.route.ts
var router3 = express3.Router();
router3.get("/", BannerController.getAllBanners);
router3.post("/", auth_default, admin_default, adminLimiter, validateRequest_default(BannerValidation.createBannerSchema), BannerController.createBanner);
router3.patch("/:id", auth_default, admin_default, adminLimiter, validateRequest_default(BannerValidation.updateBannerSchema), BannerController.updateBanner);
router3.delete("/:id", auth_default, admin_default, adminLimiter, BannerController.deleteBanner);
var BannerRoutes = router3;

// src/modules/category/category.route.ts
import express4 from "express";

// src/utils/generateSlug.ts
var generateSlug = (text) => {
  return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
};

// src/modules/category/category.constant.ts
var categorySearchableFields = ["name", "description"];
var categoryFilterableFields = ["isActive", "isFeatured"];
var categoryIncludeConfig = {
  _count: {
    select: { items: true }
  }
};

// src/modules/category/category.service.ts
var createCategory = async (payload) => {
  let slug = generateSlug(payload.name);
  let isExist = await prisma.category.findUnique({ where: { slug } });
  let counter = 1;
  while (isExist) {
    slug = `${generateSlug(payload.name)}-${counter}`;
    isExist = await prisma.category.findUnique({ where: { slug } });
    counter++;
  }
  return await prisma.category.create({
    data: {
      ...payload,
      slug
    }
  });
};
var getCategories = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.category, queries, {
    searchableFields: categorySearchableFields,
    filterableFields: categoryFilterableFields
  }).search().filter().sort().paginate().include(categoryIncludeConfig);
  const result = await queryBuilder.execute();
  return result;
};
var getCategoryBySlug = async (slug) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      items: {
        where: { isAvailable: true }
      }
    }
  });
  if (!category) throw new AppError_default(404, "Category not found");
  return category;
};
var updateCategory = async (id, payload) => {
  return await prisma.category.update({
    where: { id },
    data: payload
  });
};
var deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { items: true }
  });
  if (!category) throw new AppError_default(404, "Category not found");
  if (category.items.length > 0) {
    throw new AppError_default(400, "Cannot delete category that has items");
  }
  return await prisma.category.delete({ where: { id } });
};
var getHomeCategories = async (queries) => {
  const includeItems = queries.includeItems === "true";
  const itemsLimit = Number(queries.itemsLimit) || 10;
  const includeConfig = includeItems ? {
    items: {
      where: { isAvailable: true, isCategoryFeatured: true },
      take: itemsLimit
    }
  } : categoryIncludeConfig;
  const queryBuilder = new QueryBuilder(prisma.category, queries, {
    searchableFields: categorySearchableFields,
    filterableFields: categoryFilterableFields
  }).where({ isFeatured: true }).search().filter().sort().paginate().include(includeConfig);
  const result = await queryBuilder.execute();
  return result;
};
var CategoryService = {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getHomeCategories
};

// src/modules/category/category.controller.ts
var createCategory2 = catchAsync_default(async (req, res) => {
  const result = await CategoryService.createCategory(req.body);
  sendResponse_default(res, { statusCode: 201, success: true, message: "Category created", data: result });
});
var getCategories2 = catchAsync_default(async (req, res) => {
  const result = await CategoryService.getCategories(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Categories retrieved successfully", meta: result.meta, data: result.data });
});
var getCategoryBySlug2 = catchAsync_default(async (req, res) => {
  const result = await CategoryService.getCategoryBySlug(req.params.slug);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Category retrieved successfully", data: result });
});
var updateCategory2 = catchAsync_default(async (req, res) => {
  const result = await CategoryService.updateCategory(req.params.id, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Category updated successfully", data: result });
});
var deleteCategory2 = catchAsync_default(async (req, res) => {
  await CategoryService.deleteCategory(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Category deleted", data: null });
});
var getHomeCategories2 = catchAsync_default(async (req, res) => {
  const result = await CategoryService.getHomeCategories(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Home categories retrieved successfully", meta: result.meta, data: result.data });
});
var CategoryController = {
  createCategory: createCategory2,
  getCategories: getCategories2,
  getCategoryBySlug: getCategoryBySlug2,
  updateCategory: updateCategory2,
  deleteCategory: deleteCategory2,
  getHomeCategories: getHomeCategories2
};

// src/modules/category/category.validation.ts
import { z as z5 } from "zod";
var createCategorySchema = z5.object({
  body: z5.object({
    name: z5.string().min(1, "Name is required"),
    imageUrl: z5.string().optional(),
    description: z5.string().optional(),
    isActive: z5.boolean().optional(),
    isFeatured: z5.boolean().optional()
  })
});
var updateCategorySchema = z5.object({
  body: z5.object({
    name: z5.string().optional(),
    imageUrl: z5.string().optional(),
    description: z5.string().optional(),
    isActive: z5.boolean().optional(),
    isFeatured: z5.boolean().optional()
  })
});
var CategoryValidation = {
  createCategorySchema,
  updateCategorySchema
};

// src/modules/category/category.route.ts
var router4 = express4.Router();
router4.get("/", CategoryController.getCategories);
router4.get("/home", CategoryController.getHomeCategories);
router4.get("/:slug", CategoryController.getCategoryBySlug);
router4.post("/", auth_default, admin_default, adminLimiter, validateRequest_default(CategoryValidation.createCategorySchema), CategoryController.createCategory);
router4.patch("/:id", auth_default, admin_default, adminLimiter, validateRequest_default(CategoryValidation.updateCategorySchema), CategoryController.updateCategory);
router4.delete("/:id", auth_default, admin_default, adminLimiter, CategoryController.deleteCategory);
var CategoryRoutes = router4;

// src/modules/item/item.route.ts
import express5 from "express";

// src/modules/item/item.constant.ts
var itemSearchableFields = ["name", "slug", "category.name", "category.slug"];
var itemFilterableFields = ["isDeleted", "isFeatured", "isBestSelling", "isSpicy", "weight", "isAvailable", "isCategoryFeatured", "isNew", "price", "category.id", "category.name", "category.slug"];
var itemIncludeConfig = {
  category: true
};

// src/modules/item/item.service.ts
var createItem = async (payload) => {
  let slug = generateSlug(payload.name);
  let isExist = await prisma.item.findUnique({ where: { slug } });
  let counter = 1;
  while (isExist) {
    slug = `${generateSlug(payload.name)}-${counter}`;
    isExist = await prisma.item.findUnique({ where: { slug } });
    counter++;
  }
  return await prisma.item.create({
    data: {
      ...payload,
      slug
    }
  });
};
var getAllItems = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.item, queries, {
    searchableFields: itemSearchableFields,
    filterableFields: itemFilterableFields,
    relationConfig: {
      category: "one"
    }
  }).search().filter().sort().paginate().include(itemIncludeConfig);
  const result = await queryBuilder.execute();
  return result;
};
var getItemById = async (id) => {
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true } } }
      }
    }
  });
  if (!item) throw new AppError_default(404, "Item not found");
  return item;
};
var updateItem = async (id, payload) => {
  return await prisma.item.update({
    where: { id },
    data: payload
  });
};
var deleteItem = async (id) => {
  return await prisma.item.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
};
var ItemService = {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem
};

// src/modules/item/item.controller.ts
var createItem2 = catchAsync_default(async (req, res) => {
  const result = await ItemService.createItem(req.body);
  sendResponse_default(res, { statusCode: 201, success: true, message: "Item created", data: result });
});
var getAllItems2 = catchAsync_default(async (req, res) => {
  const result = await ItemService.getAllItems(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Items retrieved", meta: result.meta, data: result.data });
});
var getItemById2 = catchAsync_default(async (req, res) => {
  const result = await ItemService.getItemById(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Item retrieved", data: result });
});
var updateItem2 = catchAsync_default(async (req, res) => {
  const result = await ItemService.updateItem(req.params.id, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Item updated", data: result });
});
var deleteItem2 = catchAsync_default(async (req, res) => {
  await ItemService.deleteItem(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Item deleted", data: null });
});
var ItemController = {
  createItem: createItem2,
  getAllItems: getAllItems2,
  getItemById: getItemById2,
  updateItem: updateItem2,
  deleteItem: deleteItem2
};

// src/modules/item/item.validation.ts
import { z as z6 } from "zod";
var createItemSchema = z6.object({
  body: z6.object({
    name: z6.string().min(1, "Name is required"),
    description: z6.string().min(1, "Description is required"),
    price: z6.number().positive(),
    discountPrice: z6.number().nonnegative().optional(),
    imageUrl: z6.string().url("Invalid image URL"),
    images: z6.array(z6.string().url()).min(1),
    categoryId: z6.string().uuid("Invalid category ID"),
    isAvailable: z6.boolean().optional(),
    isFeatured: z6.boolean().optional(),
    isBestSelling: z6.boolean().optional(),
    isCategoryFeatured: z6.boolean().optional(),
    isNew: z6.boolean().optional(),
    isSpicy: z6.boolean().optional(),
    weight: z6.string().optional(),
    tags: z6.array(z6.string()).optional()
  })
});
var updateItemSchema = z6.object({
  body: z6.object({
    name: z6.string().optional(),
    description: z6.string().optional(),
    price: z6.number().positive().optional(),
    discountPrice: z6.number().nonnegative().optional(),
    imageUrl: z6.string().url().optional(),
    images: z6.array(z6.string().url()).optional(),
    categoryId: z6.string().uuid().optional(),
    isAvailable: z6.boolean().optional(),
    isFeatured: z6.boolean().optional(),
    isBestSelling: z6.boolean().optional(),
    isCategoryFeatured: z6.boolean().optional(),
    isNew: z6.boolean().optional(),
    isSpicy: z6.boolean().optional(),
    weight: z6.string().optional(),
    tags: z6.array(z6.string()).optional()
  })
});
var ItemValidation = {
  createItemSchema,
  updateItemSchema
};

// src/modules/item/item.route.ts
var router5 = express5.Router();
router5.get("/", ItemController.getAllItems);
router5.get("/:id", ItemController.getItemById);
router5.post("/", auth_default, admin_default, adminLimiter, validateRequest_default(ItemValidation.createItemSchema), ItemController.createItem);
router5.patch("/:id", auth_default, admin_default, adminLimiter, validateRequest_default(ItemValidation.updateItemSchema), ItemController.updateItem);
router5.delete("/:id", auth_default, admin_default, adminLimiter, ItemController.deleteItem);
var ItemRoutes = router5;

// src/modules/coupon/coupon.route.ts
import express6 from "express";

// src/modules/coupon/coupon.constant.ts
var couponSearchableFields = ["code", "title"];
var couponFilterableFields = ["isActive", "discountType", "isDeleted"];
var couponIncludeConfig = {};

// src/modules/coupon/coupon.service.ts
var createCoupon = async (payload) => {
  const isExist = await prisma.coupon.findUnique({ where: { code: payload.code } });
  if (isExist) throw new AppError_default(409, "Coupon code already exists");
  return await prisma.coupon.create({
    data: {
      ...payload,
      discountType: payload.discountType || "FIXED"
    }
  });
};
var getAllCoupons = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.coupon, queries, {
    searchableFields: couponSearchableFields,
    filterableFields: couponFilterableFields
  }).search().filter().sort().paginate().include(couponIncludeConfig);
  const result = await queryBuilder.execute();
  return result;
};
var validateCoupon = async (code, subtotal) => {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) throw new AppError_default(404, "Invalid coupon code");
  if (!coupon.isActive) throw new AppError_default(400, "Coupon is inactive");
  if (coupon.isDeleted) throw new AppError_default(400, "Coupon is deleted");
  if (new Date(coupon.expiryDate) < /* @__PURE__ */ new Date()) throw new AppError_default(400, "Coupon is expired");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw new AppError_default(400, "Coupon usage limit reached");
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    throw new AppError_default(400, `Minimum order amount of ${coupon.minOrderAmount} required for this coupon`);
  }
  return coupon;
};
var updateCoupon = async (id, payload) => {
  return await prisma.coupon.update({
    where: { id },
    data: payload
  });
};
var deleteCoupon = async (id) => {
  return await prisma.coupon.delete({ where: { id } });
};
var CouponService = {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon
};

// src/utils/calculateDiscount.ts
var calculateDiscount = (subtotal, discountType, discountValue) => {
  if (discountType === "FIXED") {
    return Math.min(subtotal, discountValue);
  } else if (discountType === "PERCENTAGE") {
    return subtotal * discountValue / 100;
  }
  return 0;
};

// src/modules/coupon/coupon.controller.ts
var createCoupon2 = catchAsync_default(async (req, res) => {
  const result = await CouponService.createCoupon(req.body);
  sendResponse_default(res, { statusCode: 201, success: true, message: "Coupon created", data: result });
});
var getAllCoupons2 = catchAsync_default(async (req, res) => {
  const result = await CouponService.getAllCoupons(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Coupons retrieved", meta: result.meta, data: result.data });
});
var validateCoupon2 = catchAsync_default(async (req, res) => {
  const { code, subtotal } = req.body;
  const coupon = await CouponService.validateCoupon(code, subtotal);
  const discountAmount = calculateDiscount(subtotal, coupon.discountType, coupon.discountValue);
  sendResponse_default(res, {
    statusCode: 200,
    success: true,
    message: "Coupon is valid",
    data: { coupon, discountAmount }
  });
});
var updateCoupon2 = catchAsync_default(async (req, res) => {
  const id = req.params["id"];
  const result = await CouponService.updateCoupon(id, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Coupon updated", data: result });
});
var deleteCoupon2 = catchAsync_default(async (req, res) => {
  const id = req.params["id"];
  await CouponService.deleteCoupon(id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Coupon deleted", data: null });
});
var CouponController = {
  createCoupon: createCoupon2,
  getAllCoupons: getAllCoupons2,
  validateCoupon: validateCoupon2,
  updateCoupon: updateCoupon2,
  deleteCoupon: deleteCoupon2
};

// src/modules/coupon/coupon.validation.ts
import { z as z7 } from "zod";
var createCouponSchema = z7.object({
  body: z7.object({
    code: z7.string().min(1, "Code is required"),
    title: z7.string().min(1, "Title is required"),
    discountType: z7.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]).optional(),
    discountValue: z7.number().positive(),
    minOrderAmount: z7.number().nonnegative().optional(),
    maxDiscountAmount: z7.number().nonnegative().optional(),
    expiryDate: z7.string().datetime(),
    usageLimit: z7.number().int().positive().optional(),
    isActive: z7.boolean().optional(),
    description: z7.string().optional()
  })
});
var updateCouponSchema = z7.object({
  body: z7.object({
    code: z7.string().optional(),
    title: z7.string().optional(),
    discountType: z7.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]).optional(),
    discountValue: z7.number().positive().optional(),
    minOrderAmount: z7.number().nonnegative().optional(),
    maxDiscountAmount: z7.number().nonnegative().optional(),
    expiryDate: z7.string().datetime().optional(),
    usageLimit: z7.number().int().positive().optional(),
    isActive: z7.boolean().optional(),
    description: z7.string().optional()
  })
});
var CouponValidation = {
  createCouponSchema,
  updateCouponSchema
};

// src/modules/coupon/coupon.route.ts
import { z as z8 } from "zod";
var router6 = express6.Router();
router6.post(
  "/validate",
  auth_default,
  validateRequest_default(z8.object({ body: z8.object({ code: z8.string(), subtotal: z8.number().positive() }) })),
  CouponController.validateCoupon
);
router6.get("/", CouponController.getAllCoupons);
router6.post("/", auth_default, admin_default, adminLimiter, validateRequest_default(CouponValidation.createCouponSchema), CouponController.createCoupon);
router6.patch("/:id", auth_default, admin_default, adminLimiter, validateRequest_default(CouponValidation.updateCouponSchema), CouponController.updateCoupon);
router6.delete("/:id", auth_default, admin_default, adminLimiter, CouponController.deleteCoupon);
var CouponRoutes = router6;

// src/modules/order/order.route.ts
import express7 from "express";

// src/utils/generateOrderNumber.ts
function generateOrderNumber() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
  return `ORD-${year}${month}${day}-${random}`;
}

// src/modules/order/order.constant.ts
var orderSearchableFields = ["orderNumber", "couponCode", "user.name", "user.email", "user.phone", "customerPhone", "customerName", "customerEmail"];
var orderFilterableFields = ["status", "paymentMethod", "paymentStatus", "subtotal", "total", "discountAmount", "deliveryCharge", "isInsideDhaka", "isDeleted", "userId"];
var orderIncludeConfig = {
  items: true,
  user: {
    select: { name: true, phone: true, email: true }
  }
};

// src/modules/order/order.service.ts
var createOrder = async (userId, payload) => {
  const { items, couponCode, paymentMethod, deliveryAddress, isInsideDhaka, customerName, customerPhone, customerEmail, deliveryCharge, notes } = payload;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, isDeleted: true }
    });
    if (!user || user.isDeleted) {
      throw new AppError_default(404, "User not found");
    }
    if (user.status === "INACTIVE") {
      throw new AppError_default(403, "You are inactive. Please contact admin to activate your account.");
    }
    if (user.status === "BANNED") {
      throw new AppError_default(403, "You are banned. Please contact admin.");
    }
  }
  let subtotal = 0;
  let totalWeight = 0;
  const orderItemsData = [];
  for (const item of items) {
    const product = await prisma.item.findUnique({ where: { id: item.itemId } });
    if (!product || !product.isAvailable) {
      throw new AppError_default(400, `Item ${item.itemId} is unavailable or does not exist`);
    }
    const price = product.discountPrice ?? product.price;
    const total = price * item.quantity;
    subtotal += total;
    const weightValue = product.weight ? parseInt(product.weight.replace(/\D/g, "")) || 0 : 0;
    totalWeight += weightValue * item.quantity;
    orderItemsData.push({
      itemId: product.id,
      itemName: product.name,
      itemPrice: price,
      quantity: item.quantity,
      total
    });
  }
  if (totalWeight > 5e3) {
    throw new AppError_default(400, "Order weight cannot exceed 5000g");
  }
  const baseDeliveryCharge = isInsideDhaka !== void 0 ? isInsideDhaka ? 100 : 150 : 100;
  let extraCharge = 0;
  if (totalWeight > 1e3) {
    const extraWeight = totalWeight - 1e3;
    extraCharge = Math.ceil(extraWeight / 1e3) * 10;
  }
  const calculatedDeliveryCharge = baseDeliveryCharge + extraCharge;
  const finalDeliveryCharge = deliveryCharge ?? calculatedDeliveryCharge;
  let discountAmount = 0;
  let couponId = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.isActive && !coupon.isDeleted) {
      if (new Date(coupon.expiryDate) > /* @__PURE__ */ new Date()) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          couponId = coupon.id;
          let discount = coupon.discountType === "FIXED" ? coupon.discountValue : subtotal * coupon.discountValue / 100;
          if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
          }
          discountAmount = Math.min(subtotal, discount);
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
        }
      }
    }
  }
  const totalAmount = subtotal - discountAmount + finalDeliveryCharge;
  const orderNumber = generateOrderNumber();
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      customerName: customerName ?? null,
      customerPhone: customerPhone ?? null,
      customerEmail: customerEmail ?? null,
      subtotal,
      discountAmount,
      deliveryCharge: finalDeliveryCharge,
      total: totalAmount,
      couponId,
      couponCode: couponCode ?? null,
      paymentMethod,
      deliveryAddress,
      isInsideDhaka: isInsideDhaka ?? true,
      notes: notes ?? null,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: true,
      user: userId ? { select: { name: true, email: true, phone: true } } : false
    }
  });
  return order;
};
var getMyOrders = async (userId, queries) => {
  const queryBuilder = new QueryBuilder(prisma.order, queries, {
    searchableFields: orderSearchableFields,
    filterableFields: orderFilterableFields
  }).where({ userId }).search().filter().sort().paginate().include({ items: { include: { item: true } } });
  const result = await queryBuilder.execute();
  return result;
};
var getOrderById = async (id, userId, role) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { item: true } }, user: { select: { id: true, name: true, email: true, phone: true } } }
  });
  if (!order) throw new AppError_default(404, "Order not found");
  if (role !== "ADMIN" && order.userId !== userId) throw new AppError_default(403, "Forbidden");
  return order;
};
var getAllOrders = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.order, queries, {
    searchableFields: orderSearchableFields,
    filterableFields: orderFilterableFields,
    relationConfig: {
      user: "one",
      items: "many"
    }
  }).search().filter().sort().paginate().include(orderIncludeConfig).where({ isDeleted: false });
  const result = await queryBuilder.execute();
  return result;
};
var getOrderNumber = async (orderNumber) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { item: true } }, user: { select: { id: true, name: true, email: true, phone: true } } }
  });
  if (!order) throw new AppError_default(404, "Order not found");
  return order;
};
var deleteOrder = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id }
  });
  if (!order) {
    throw new AppError_default(404, "Order not found");
  }
  if (order.isDeleted) {
    throw new AppError_default(400, "Order is already deleted");
  }
  if (order.status === "DELIVERED") {
    throw new AppError_default(400, "Cannot delete delivered order");
  }
  return await prisma.order.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }
  });
};
var updateOrderItems = async (id, payload) => {
  const { items } = payload;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true }
  });
  if (!order) {
    throw new AppError_default(404, "Order not found");
  }
  if (order.isDeleted) {
    throw new AppError_default(400, "Cannot update deleted order");
  }
  if (order.status === "DELIVERED") {
    throw new AppError_default(400, "Cannot update delivered order");
  }
  await prisma.orderItem.deleteMany({
    where: { orderId: id }
  });
  let subtotal = 0;
  let totalWeight = 0;
  const orderItemsData = [];
  for (const item of items) {
    const product = await prisma.item.findUnique({ where: { id: item.itemId } });
    if (!product || !product.isAvailable) {
      throw new AppError_default(400, `Item ${item.itemId} is unavailable or does not exist`);
    }
    const price = product.discountPrice ?? product.price;
    const total = price * item.quantity;
    subtotal += total;
    const weightValue = product.weight ? parseInt(product.weight.replace(/\D/g, "")) || 0 : 0;
    totalWeight += weightValue * item.quantity;
    orderItemsData.push({
      itemId: product.id,
      itemName: product.name,
      itemPrice: price,
      quantity: item.quantity,
      total
    });
  }
  if (totalWeight > 5e3) {
    throw new AppError_default(400, "Order weight cannot exceed 5000g");
  }
  const baseDeliveryCharge = order.isInsideDhaka ? 100 : 150;
  let extraCharge = 0;
  if (totalWeight > 1e3) {
    const extraWeight = totalWeight - 1e3;
    extraCharge = Math.ceil(extraWeight / 1e3) * 10;
  }
  const finalDeliveryCharge = baseDeliveryCharge + extraCharge;
  let discountAmount = order.discountAmount;
  if (order.couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: order.couponId } });
    if (coupon && coupon.isActive && !coupon.isDeleted) {
      if (new Date(coupon.expiryDate) > /* @__PURE__ */ new Date()) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          let discount = coupon.discountType === "FIXED" ? coupon.discountValue : subtotal * coupon.discountValue / 100;
          if (coupon.maxDiscountAmount) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
          }
          discountAmount = Math.min(subtotal, discount);
        }
      }
    }
  }
  const totalAmount = subtotal - discountAmount + finalDeliveryCharge;
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      subtotal,
      discountAmount,
      deliveryCharge: finalDeliveryCharge,
      total: totalAmount,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true, phone: true } }
    }
  });
  return updatedOrder;
};
var updateOrder = async (id, payload) => {
  const order = await prisma.order.findUnique({
    where: { id }
  });
  if (!order) {
    throw new AppError_default(404, "Order not found");
  }
  if (order.isDeleted) {
    throw new AppError_default(400, "Cannot update deleted order");
  }
  if (order.status === "DELIVERED") {
    throw new AppError_default(400, "Cannot update delivered order");
  }
  const updateData = {};
  if (payload.customerName !== void 0) {
    updateData.customerName = payload.customerName;
  }
  if (payload.customerPhone !== void 0) {
    updateData.customerPhone = payload.customerPhone;
  }
  if (payload.customerEmail !== void 0) {
    updateData.customerEmail = payload.customerEmail;
  }
  if (payload.deliveryAddress !== void 0) {
    updateData.deliveryAddress = payload.deliveryAddress;
  }
  if (payload.isInsideDhaka !== void 0) {
    updateData.isInsideDhaka = payload.isInsideDhaka;
  }
  if (payload.deliveryCharge !== void 0) {
    updateData.deliveryCharge = payload.deliveryCharge;
  }
  if (payload.notes !== void 0) {
    updateData.notes = payload.notes;
  }
  if (payload.status !== void 0) {
    updateData.status = payload.status;
  }
  if (payload.paymentStatus !== void 0) {
    updateData.paymentStatus = payload.paymentStatus;
  }
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true, phone: true } }
    }
  });
  return updatedOrder;
};
var updateOrderStatus = async (id, status) => {
  const order = await prisma.order.findUnique({
    where: { id }
  });
  if (!order) {
    throw new AppError_default(404, "Order not found");
  }
  if (order.status === "DELIVERED") {
    throw new AppError_default(400, "Cannot update delivered order");
  }
  return await prisma.order.update({
    where: { id },
    data: { status }
  });
};
var OrderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderNumber,
  getAllOrders,
  deleteOrder,
  updateOrder,
  updateOrderItems,
  updateOrderStatus
};

// src/modules/order/order.controller.ts
var createOrder2 = catchAsync_default(async (req, res) => {
  const userId = req.user?.userId || null;
  const result = await OrderService.createOrder(userId, req.body);
  sendResponse_default(res, { statusCode: 201, success: true, message: "Order created", data: result });
});
var getMyOrders2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.getMyOrders(req.user.userId, req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "My orders retrieved", meta: result.meta, data: result.data });
});
var getOrderById2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.getOrderById(req.params.id, req.user.userId, req.user.role);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Order retrieved", data: result });
});
var getOrderNumber2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.getOrderNumber(req.params.orderNumber);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Order retrieved", data: result });
});
var getAllOrders2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.getAllOrders(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "All orders retrieved", meta: result.meta, data: result.data });
});
var updateOrderStatus2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.updateOrderStatus(req.params.id, req.body.status);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Order status updated", data: result });
});
var deleteOrder2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.deleteOrder(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Order deleted successfully", data: result });
});
var updateOrderItems2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.updateOrderItems(req.params.id, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Order items updated successfully", data: result });
});
var updateOrder2 = catchAsync_default(async (req, res) => {
  const result = await OrderService.updateOrder(req.params.id, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Order updated successfully", data: result });
});
var OrderController = {
  createOrder: createOrder2,
  getMyOrders: getMyOrders2,
  getOrderById: getOrderById2,
  getOrderNumber: getOrderNumber2,
  getAllOrders: getAllOrders2,
  deleteOrder: deleteOrder2,
  updateOrder: updateOrder2,
  updateOrderItems: updateOrderItems2,
  updateOrderStatus: updateOrderStatus2
};

// src/modules/order/order.validation.ts
import { z as z9 } from "zod";
var createOrderSchema = z9.object({
  body: z9.object({
    items: z9.array(z9.object({
      itemId: z9.string().uuid(),
      quantity: z9.number().int().positive()
    })).min(1, "Order must contain at least one item"),
    couponCode: z9.string().optional(),
    paymentMethod: z9.enum([PaymentMethod.COD, PaymentMethod.ONLINE]),
    deliveryAddress: z9.object({
      area: z9.string().min(1, "Area is required"),
      city: z9.string().min(1, "City is required"),
      street: z9.string().min(1, "Street is required"),
      country: z9.string().min(1, "Country is required")
    }),
    isInsideDhaka: z9.boolean().optional(),
    customerName: z9.string().optional(),
    customerPhone: z9.string().optional(),
    customerEmail: z9.string().email().optional(),
    deliveryCharge: z9.number().nonnegative().optional(),
    notes: z9.string().optional()
  })
});
var updateOrderStatusSchema = z9.object({
  body: z9.object({
    status: z9.enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED
    ])
  })
});
var updateOrderItemsSchema = z9.object({
  body: z9.object({
    items: z9.array(z9.object({
      itemId: z9.string().uuid(),
      quantity: z9.number().int().positive()
    })).min(1, "Order must contain at least one item")
  })
});
var updateOrderSchema = z9.object({
  body: z9.object({
    customerName: z9.string().optional(),
    customerPhone: z9.string().optional(),
    customerEmail: z9.string().email().optional(),
    deliveryAddress: z9.object({
      area: z9.string().min(1, "Area is required"),
      city: z9.string().min(1, "City is required"),
      street: z9.string().min(1, "Street is required"),
      country: z9.string().min(1, "Country is required")
    }).optional(),
    isInsideDhaka: z9.boolean().optional(),
    deliveryCharge: z9.number().nonnegative().optional(),
    notes: z9.string().optional(),
    status: z9.enum([
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED
    ]).optional(),
    paymentStatus: z9.enum([
      PaymentStatus.PENDING,
      PaymentStatus.PAID,
      PaymentStatus.FAILED
    ]).optional()
  })
});
var OrderValidation = {
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderItemsSchema,
  updateOrderSchema
};

// src/middlewares/optionalAuth.ts
import jwt3 from "jsonwebtoken";
var optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt3.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true, isDeleted: true }
    });
    if (!user || user.isDeleted) {
      return next();
    }
    if (user.status === "BANNED") {
      return next();
    }
    req.user = { ...decoded, status: user.status };
    next();
  } catch (err) {
    next();
  }
};
var optionalAuth_default = optionalAuth;

// src/modules/order/order.route.ts
var router7 = express7.Router();
router7.post("/", orderLimiter, optionalAuth_default, validateRequest_default(OrderValidation.createOrderSchema), OrderController.createOrder);
router7.get("/my-orders", auth_default, OrderController.getMyOrders);
router7.get("/number/:orderNumber", OrderController.getOrderNumber);
router7.get("/:id", auth_default, OrderController.getOrderById);
router7.get("/", auth_default, admin_default, adminLimiter, OrderController.getAllOrders);
router7.patch("/:id/status", auth_default, admin_default, adminLimiter, validateRequest_default(OrderValidation.updateOrderStatusSchema), OrderController.updateOrderStatus);
router7.patch("/:id", auth_default, admin_default, adminLimiter, validateRequest_default(OrderValidation.updateOrderSchema), OrderController.updateOrder);
router7.put("/:id/items", auth_default, admin_default, adminLimiter, validateRequest_default(OrderValidation.updateOrderItemsSchema), OrderController.updateOrderItems);
router7.delete("/:id", auth_default, admin_default, adminLimiter, OrderController.deleteOrder);
var OrderRoutes = router7;

// src/modules/review/review.route.ts
import express8 from "express";

// src/modules/review/review.constant.ts
var reviewSearchableFields = ["comment", "user.name"];
var reviewFilterableFields = ["rating", "isApproved", "isFeatured", "isDeleted", "itemId", "userId"];
var reviewIncludeConfig = {
  user: {
    select: { name: true }
  },
  item: {
    select: { name: true, slug: true }
  }
};

// src/modules/review/review.service.ts
var createReview = async (userId, payload) => {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      itemId: payload.itemId,
      order: {
        userId,
        status: "DELIVERED"
      }
    }
  });
  if (!orderItem) {
    throw new AppError_default(403, "You can only review items you have ordered and received");
  }
  const existingReview = await prisma.review.findFirst({
    where: { userId, itemId: payload.itemId }
  });
  if (existingReview) {
    throw new AppError_default(409, "You have already reviewed this item");
  }
  return await prisma.review.create({
    data: {
      userId,
      ...payload
    }
  });
};
var getItemReviews = async (itemId, queries) => {
  const queryBuilder = new QueryBuilder(prisma.review, queries, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields
  }).where({ itemId, isApproved: true, isDeleted: false }).search().filter().sort().paginate().include({ user: { select: { name: true } } });
  const result = await queryBuilder.execute();
  return result;
};
var getAllReviews = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.review, queries, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields
  }).where({ isDeleted: false }).search().filter().sort().paginate().include(reviewIncludeConfig);
  const result = await queryBuilder.execute();
  return result;
};
var updateReviewStatus = async (id, status) => {
  const updateData = {};
  switch (status) {
    case "approve":
      updateData.isApproved = true;
      break;
    case "unapprove":
      updateData.isApproved = false;
      break;
    case "feature":
      updateData.isFeatured = true;
      break;
    case "unfeature":
      updateData.isFeatured = false;
      break;
    default:
      throw new AppError_default(400, "Invalid status. Valid statuses: approve, unapprove, feature, unfeature");
  }
  return await prisma.review.update({
    where: { id },
    data: updateData
  });
};
var deleteReview = async (id) => {
  return await prisma.review.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
};
var getMyReviews = async (userId, queries) => {
  const queryBuilder = new QueryBuilder(prisma.review, queries, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields
  }).where({ userId, isDeleted: false }).sort().paginate().include(reviewIncludeConfig);
  const result = await queryBuilder.execute();
  return result;
};
var updateMyReview = async (userId, reviewId, payload) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId }
  });
  if (!review) {
    throw new AppError_default(404, "Review not found or you do not have permission to update it");
  }
  return await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...payload,
      isApproved: false
      // Re-require approval on update
    }
  });
};
var deleteMyReview = async (userId, reviewId) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId }
  });
  if (!review) {
    throw new AppError_default(404, "Review not found or you do not have permission to delete it");
  }
  return await prisma.review.update({
    where: { id: reviewId },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
};
var ReviewService = {
  createReview,
  getItemReviews,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getMyReviews,
  updateMyReview,
  deleteMyReview
};

// src/modules/review/review.controller.ts
var createReview2 = catchAsync_default(async (req, res) => {
  const result = await ReviewService.createReview(req.user.userId, req.body);
  sendResponse_default(res, { statusCode: 201, success: true, message: "Review created and pending approval", data: result });
});
var getItemReviews2 = catchAsync_default(async (req, res) => {
  const result = await ReviewService.getItemReviews(req.params.itemId, req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Reviews retrieved", meta: result.meta, data: result.data });
});
var getAllReviews2 = catchAsync_default(async (req, res) => {
  const result = await ReviewService.getAllReviews(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "All reviews retrieved", meta: result.meta, data: result.data });
});
var updateReviewStatus2 = catchAsync_default(async (req, res) => {
  const result = await ReviewService.updateReviewStatus(req.params.id, req.params.status);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Review status updated", data: result });
});
var deleteReview2 = catchAsync_default(async (req, res) => {
  await ReviewService.deleteReview(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Review deleted", data: null });
});
var getMyReviews2 = catchAsync_default(async (req, res) => {
  const result = await ReviewService.getMyReviews(req.user.userId, req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "My reviews retrieved", meta: result.meta, data: result.data });
});
var updateMyReview2 = catchAsync_default(async (req, res) => {
  const result = await ReviewService.updateMyReview(req.user.userId, req.params.id, req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Review updated successfully", data: result });
});
var deleteMyReview2 = catchAsync_default(async (req, res) => {
  await ReviewService.deleteMyReview(req.user.userId, req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Review deleted successfully", data: null });
});
var ReviewController = {
  createReview: createReview2,
  getItemReviews: getItemReviews2,
  getAllReviews: getAllReviews2,
  updateReviewStatus: updateReviewStatus2,
  deleteReview: deleteReview2,
  getMyReviews: getMyReviews2,
  updateMyReview: updateMyReview2,
  deleteMyReview: deleteMyReview2
};

// src/modules/review/review.validation.ts
import { z as z10 } from "zod";
var createReviewSchema = z10.object({
  body: z10.object({
    itemId: z10.string().uuid(),
    rating: z10.number().int().min(1).max(5),
    comment: z10.string().optional()
  })
});
var updateReviewSchema = z10.object({
  body: z10.object({
    rating: z10.number().int().min(1).max(5).optional(),
    comment: z10.string().optional()
  })
});
var adminUpdateReviewSchema = z10.object({
  body: z10.object({
    isApproved: z10.boolean().optional(),
    isFeatured: z10.boolean().optional(),
    isDeleted: z10.boolean().optional()
  })
});
var ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
  adminUpdateReviewSchema
};

// src/modules/review/review.route.ts
var router8 = express8.Router();
router8.get("/item/:itemId", ReviewController.getItemReviews);
router8.get("/my-reviews", auth_default, ReviewController.getMyReviews);
router8.post("/", auth_default, validateRequest_default(ReviewValidation.createReviewSchema), ReviewController.createReview);
router8.get("/", ReviewController.getAllReviews);
router8.patch("/:id/:status", auth_default, admin_default, ReviewController.updateReviewStatus);
router8.patch("/:id", auth_default, validateRequest_default(ReviewValidation.updateReviewSchema), ReviewController.updateMyReview);
router8.delete("/my-reviews/:id", auth_default, ReviewController.deleteMyReview);
router8.delete("/:id", auth_default, admin_default, ReviewController.deleteReview);
var ReviewRoutes = router8;

// src/modules/setting/setting.route.ts
import express9 from "express";

// src/modules/setting/setting.service.ts
var getSettings = async () => {
  const settings = await prisma.setting.findFirst();
  return settings;
};
var updateSettings = async (payload) => {
  const result = await prisma.setting.upsert({
    where: { id: 1 },
    update: payload,
    create: {
      ...payload,
      id: 1
    }
  });
  return result;
};
var SettingService = {
  getSettings,
  updateSettings
};

// src/modules/setting/setting.controller.ts
var getSettings2 = catchAsync_default(async (req, res) => {
  const result = await SettingService.getSettings();
  sendResponse_default(res, { statusCode: 200, success: true, message: "Settings retrieved", data: result });
});
var updateSettings2 = catchAsync_default(async (req, res) => {
  const result = await SettingService.updateSettings(req.body);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Settings updated", data: result });
});
var SettingController = {
  getSettings: getSettings2,
  updateSettings: updateSettings2
};

// src/modules/setting/setting.validation.ts
import { z as z11 } from "zod";
var updateSettingSchema = z11.object({
  body: z11.object({
    siteName: z11.string().optional(),
    tagline: z11.string().optional(),
    logoUrl: z11.string().optional(),
    phone: z11.string().optional(),
    email: z11.string().email().optional(),
    address: z11.string().optional(),
    openTime: z11.string().optional(),
    closeTime: z11.string().optional(),
    facebookUrl: z11.string().url().optional(),
    instagramUrl: z11.string().url().optional()
  })
});
var SettingValidation = {
  updateSettingSchema
};

// src/modules/setting/setting.route.ts
var router9 = express9.Router();
router9.get("/", SettingController.getSettings);
router9.patch("/", auth_default, admin_default, adminLimiter, validateRequest_default(SettingValidation.updateSettingSchema), SettingController.updateSettings);
var SettingRoutes = router9;

// src/modules/contact/contact.route.ts
import express10 from "express";

// src/modules/contact/contact.constant.ts
var contactSearchableFields = ["name", "email", "subject", "message"];
var contactFilterableFields = ["isRead", "isDeleted"];

// src/modules/contact/contact.service.ts
var createContact = async (payload) => {
  return await prisma.contact.create({
    data: payload
  });
};
var getAllContacts = async (queries) => {
  const queryBuilder = new QueryBuilder(prisma.contact, queries, {
    searchableFields: contactSearchableFields,
    filterableFields: contactFilterableFields
  }).where({ isDeleted: false }).search().filter().sort().paginate();
  const result = await queryBuilder.execute();
  return result;
};
var getContactById = async (id) => {
  return await prisma.contact.findUnique({
    where: { id, isDeleted: false }
  });
};
var markAsRead = async (id) => {
  return await prisma.contact.update({
    where: { id },
    data: { isRead: true }
  });
};
var deleteContact = async (id) => {
  return await prisma.contact.update({
    where: { id },
    data: { isDeleted: true, deletedAt: /* @__PURE__ */ new Date() }
  });
};
var ContactService = {
  createContact,
  getAllContacts,
  getContactById,
  markAsRead,
  deleteContact
};

// src/modules/contact/contact.controller.ts
var createContact2 = catchAsync_default(async (req, res) => {
  const result = await ContactService.createContact(req.body);
  sendResponse_default(res, { statusCode: 201, success: true, message: "Contact form submitted successfully", data: result });
});
var getAllContacts2 = catchAsync_default(async (req, res) => {
  const result = await ContactService.getAllContacts(req.query);
  sendResponse_default(res, { statusCode: 200, success: true, message: "All contacts retrieved", meta: result.meta, data: result.data });
});
var getContactById2 = catchAsync_default(async (req, res) => {
  const result = await ContactService.getContactById(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Contact retrieved", data: result });
});
var markAsRead2 = catchAsync_default(async (req, res) => {
  const result = await ContactService.markAsRead(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Contact marked as read", data: result });
});
var deleteContact2 = catchAsync_default(async (req, res) => {
  await ContactService.deleteContact(req.params.id);
  sendResponse_default(res, { statusCode: 200, success: true, message: "Contact deleted", data: null });
});
var ContactController = {
  createContact: createContact2,
  getAllContacts: getAllContacts2,
  getContactById: getContactById2,
  markAsRead: markAsRead2,
  deleteContact: deleteContact2
};

// src/modules/contact/contact.validation.ts
import { z as z12 } from "zod";
var createContactValidationSchema = z12.object({
  body: z12.object({
    name: z12.string().min(1, "Name is required"),
    email: z12.string().email("Invalid email address"),
    subject: z12.string().min(1, "Subject is required"),
    message: z12.string().min(1, "Message is required"),
    phone: z12.string().optional()
  })
});
var ContactValidation = {
  createContactValidationSchema
};

// src/modules/contact/contact.route.ts
var router10 = express10.Router();
router10.post("/", contactLimiter, validateRequest_default(ContactValidation.createContactValidationSchema), ContactController.createContact);
router10.get("/", auth_default, admin_default, adminLimiter, ContactController.getAllContacts);
router10.get("/:id", auth_default, admin_default, adminLimiter, ContactController.getContactById);
router10.patch("/:id/mark-read", auth_default, admin_default, adminLimiter, ContactController.markAsRead);
router10.delete("/:id", auth_default, admin_default, adminLimiter, ContactController.deleteContact);
var ContactRoutes = router10;

// src/routes/index.ts
var router11 = express11.Router();
var moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/users", route: UserRoutes },
  { path: "/banners", route: BannerRoutes },
  { path: "/categories", route: CategoryRoutes },
  { path: "/items", route: ItemRoutes },
  { path: "/coupons", route: CouponRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/reviews", route: ReviewRoutes },
  { path: "/settings", route: SettingRoutes },
  { path: "/contacts", route: ContactRoutes }
];
moduleRoutes.forEach((route) => router11.use(route.path, route.route));
var routes_default = router11;

// src/app.ts
var app = express12();
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use("/api", globalLimiter);
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express12.json());
app.use(express12.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => res.status(200).json({ status: "ok", message: "Lakri Chulay Ranna Server is running" }));
app.get("/health", (req, res) => res.status(200).json({ status: "ok", message: "Server is healthy" }));
app.use("/api/v1", routes_default);
app.use(notFound_default);
app.use(globalErrorHandler_default);
var app_default = app;
export {
  app_default as default
};
