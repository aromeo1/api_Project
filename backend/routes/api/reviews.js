const express = require('express');
const {Spot, SpotImage, User, Review, ReviewImage} = require('../../db/models');
const {check} = require('express-validator');
const {handleValidationErrors} = require('../../utils/validation');
const {requireAuth} = require('../../utils/auth');
const { Op } = require('sequelize');

const router = express.Router();

const validateReview = [
    check('review')
        .exists({checkFalsy: true}),
    check('stars')
        .exists({checkFalsy: true})
        .isInt({min: 1, max: 5}),
    handleValidationErrors
]

router.post('/', requireAuth, validateReview, async (req, res) => {
    console.log('Incoming request body:', req.body); // Log the incoming request body
    const { review, stars, spotId } = req.body;

    // Create new Review
    const newReview = await Review.create({
        review,
        stars,
        userId: req.user.id,
        spotId
    });

    return res.status(201).json({
        id: newReview.id,
        review: newReview.review,
        stars: newReview.stars,
        userId: newReview.userId,
        spotId: newReview.spotId,
    });
});

router.get('/current', requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const reviews = await Review.findAll({
        where: { userId },
        include: [
          {
            model: User,
            attributes: ['id', 'username'],
          },
          {
            model: Spot,
            attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
            include: [
              {
                model: SpotImage,
                attributes: ['url'],
                where: { preview: true },
                required: false,
              },
            ],
          },
          {
            model: ReviewImage,
            attributes: ['id', 'url'],
          },
        ],
      });

      // Format response to include previewImage field in Spot
      const formattedReviews = reviews.map(review => {
        const reviewData = review.toJSON();
        reviewData.Spot.previewImage = reviewData.Spot.SpotImages?.length > 0 ? reviewData.Spot.SpotImages[0].url : null;
        delete reviewData.Spot.SpotImages; // Remove unnecessary SpotImages array
        return reviewData;
      });
  
      res.json({ Reviews: formattedReviews });
    } catch (error) {
      console.error('Error fetching current user reviews:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  // **POST /api/reviews/:reviewId/images - Add an image to a review**
  router.post('/:reviewId/images', requireAuth, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { url } = req.body;
      const userId = req.user.id;
  
      const review = await Review.findByPk(reviewId, {
        include: [ReviewImage],
      });
  
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      // Check if the user owns the review
      if (review.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden: You do not own this review' });
      }
  
      // Limit check: Only allow up to 10 images per review
      if (review.ReviewImages.length  >= 10) {
        return res.status(403).json({ message: 'Maximum number of images for this review reached (10)' });
      }
  
      // Create and return the new ReviewImage
      const newImage = await ReviewImage.create({ reviewId, url });
  
      res.status(201).json({
        id: newImage.id,
        url: newImage.url,
      });
    } catch (error) {
      console.error('Error adding review image:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // PUT /api/reviews/:reviewId - Edit a Review
  router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
      try {
        const { reviewId } = req.params;
        const { review, stars } = req.body;
        const userId = req.user.id;
    
        // Find the review by ID
        const existingReview = await Review.findByPk(reviewId);
    
        // Check if the review exists
        if (!existingReview) {
          return res.status(404).json({ message: 'Review not found' });
        }
    
        // Check if the logged-in user is the owner of the review
        if (existingReview.userId !== userId) {
          return res.status(403).json({ message: 'Forbidden: You do not own this review' });
        }
    
        // Update review fields
        existingReview.review = review;
        existingReview.stars = stars;
        await existingReview.save(); // Save changes to database
    
        // Return updated review
        res.json(existingReview);
      } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  
  // DELETE /api/reviews/:reviewId - Delete a Review
  router.delete('/:reviewId', requireAuth, async (req, res) => {
      try {
        const { reviewId } = req.params;
        const userId = req.user.id;
    
        // Find the review by ID
        const review = await Review.findByPk(reviewId);
    
        // Check if the review exists
        if (!review) {
          return res.status(404).json({ message: 'Review not found' });
        }
    
        // Check if the logged-in user is the owner of the review
        if (review.userId !== userId) {
          return res.status(403).json({ message: 'Forbidden: You do not own this review' });
        }
    
        // Delete the review
        await review.destroy();
    
        // Return success message
        res.json({ message: 'Successfully deleted review' });
      } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    
  
  
  module.exports = router;