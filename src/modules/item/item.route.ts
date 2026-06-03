import express from 'express';
import { ItemController } from './item.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ItemValidation } from './item.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';
import { adminLimiter } from '../../middlewares/rateLimiter';

const router = express.Router();

router.get('/', ItemController.getAllItems);
router.get('/:id', ItemController.getItemById);
router.post('/', auth, admin, adminLimiter, validateRequest(ItemValidation.createItemSchema), ItemController.createItem);
router.patch('/:id', auth, admin, adminLimiter, validateRequest(ItemValidation.updateItemSchema), ItemController.updateItem);
router.delete('/:id', auth, admin, adminLimiter, ItemController.deleteItem);


export const ItemRoutes = router;
