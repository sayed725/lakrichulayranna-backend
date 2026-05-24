import express from 'express';
import { ReviewController } from './review.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
import auth from '../../middlewares/auth';
import admin from '../../middlewares/admin';

const router = express.Router();

router.get('/item/:itemId', ReviewController.getItemReviews);
router.get('/my-reviews', auth, ReviewController.getMyReviews);
router.post('/', auth, validateRequest(ReviewValidation.createReviewSchema), ReviewController.createReview);

router.get('/', ReviewController.getAllReviews);
router.patch('/:id/approve', auth, admin, ReviewController.approveReview);
router.patch('/:id/feature', auth, admin, ReviewController.featureReview);
router.patch('/:id/unfeature', auth, admin, ReviewController.unfeatureReview);
router.patch('/:id', auth, validateRequest(ReviewValidation.updateReviewSchema), ReviewController.updateMyReview);
router.delete('/my-reviews/:id', auth, ReviewController.deleteMyReview);
router.delete('/:id', auth, admin, ReviewController.deleteReview);

export const ReviewRoutes = router;
