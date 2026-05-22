import express from 'express';
import { ItemController } from './item.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ItemValidation } from './item.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.get('/', ItemController.getAllItems);
router.get('/:slug', ItemController.getItemBySlug);
router.post('/', auth, admin, validateRequest(ItemValidation.createItemSchema), ItemController.createItem);
router.patch('/:id', auth, admin, validateRequest(ItemValidation.updateItemSchema), ItemController.updateItem);
router.delete('/:id', auth, admin, ItemController.deleteItem);
router.patch('/:id/toggle-availability', auth, admin, ItemController.toggleAvailability);

export const ItemRoutes = router;
