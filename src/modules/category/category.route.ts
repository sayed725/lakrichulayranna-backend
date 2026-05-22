import express from 'express';
import { CategoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.get('/', CategoryController.getCategories);
router.get('/:slug', CategoryController.getCategoryBySlug);
router.post('/', auth, admin, validateRequest(CategoryValidation.createCategorySchema), CategoryController.createCategory);
router.patch('/:id', auth, admin, validateRequest(CategoryValidation.updateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', auth, admin, CategoryController.deleteCategory);

export const CategoryRoutes = router;
