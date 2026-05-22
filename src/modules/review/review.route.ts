import express from 'express';
import { ReviewController } from './review.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.get('/item/:itemId', ReviewController.getItemReviews);
router.post('/', auth, validateRequest(ReviewValidation.createReviewSchema), ReviewController.createReview);

router.get('/', auth, admin, ReviewController.getAllReviews);
router.patch('/:id/approve', auth, admin, ReviewController.approveReview);
router.delete('/:id', auth, admin, ReviewController.deleteReview);

export const ReviewRoutes = router;
