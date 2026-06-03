import express from 'express';
import { CategoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

router.get('/', CategoryController.getCategories);
router.get('/home', CategoryController.getHomeCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);
router.post('/', auth, admin, adminLimiter, validateRequest(CategoryValidation.createCategorySchema), CategoryController.createCategory);
router.patch('/:id', auth, admin, adminLimiter, validateRequest(CategoryValidation.updateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', auth, admin, adminLimiter, CategoryController.deleteCategory);

export const CategoryRoutes = router;
