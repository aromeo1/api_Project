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
    const userId = req.user.id;

    try {
        const reviews = await Review.findAll({
            where: { userId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'username']
                },
                {
                    model: Spot,
                    attributes: ['id', 'name'], // Only include necessary attributes
                    include: [
                        {
                            model: SpotImage,
                            attributes: ['url'], // Assuming the SpotImage model has a 'url' field
                            where: {
                                preview: true // Assuming you have a way to identify the preview image
                            },
                            required: false // This makes the join optional
                        }
                    ]
                },
                {
                    model: ReviewImage,
                    attributes: ['id', 'url']
                },
            ]
        });

        // If no reviews found, return an empty array
        if (reviews.length === 0) {
            return res.status(200).json({ reviews: [] });
        }

        // Format the reviews for the response
        const formattedReviews = reviews.map(review => ({
            id: review.id,
            reviewText: review.review,
            stars: review.stars,
            user: {
                id: review.User.id,
                username: review.User.username,
            },
            spot: {
                id: review.Spot.id,
                name: review.Spot.name,
                previewImage: review.Spot.SpotImages.length > 0 ? review.Spot.SpotImages[0].url : null, // Get the preview image URL
            },
            reviewImages: review.ReviewImages.map(image => ({
                id: image.id,
                url: image.url,
            })),
        }));

        // Return the formatted reviews
        return res.status(200).json({ reviews: formattedReviews });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { url } = req.body;

    // Check if review exists
    const review = await Review.findByPk(reviewId);
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review
    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Check if review already has 10 images
    const reviewImagesCount = await ReviewImage.count({ where: { reviewId } });
    if (reviewImagesCount >= 10) {
        return res.status(403).json({ message: "Maximum number of images reached" });
    }

    // Create new ReviewImage
    const newImage = await ReviewImage.create({ reviewId, url });

    return res.status(201).json({
        id: newImage.id,
        url: newImage.url,
    });
});

router.put('/:reviewId', requireAuth, validateReview, async (req, res) => {
    const { reviewId } = req.params;
    const { reviewText, stars } = req.body;

    // Find review by ID
    const review = await Review.findByPk(reviewId);
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review
    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Update the review
    review.review = review;
    review.stars = stars;
    await review.save();

    // Return updated review
    return res.json({
        id: review.id,
        reviewText: review.reviewText,
        stars: review.stars,
        userId: review.userId,
    });
});

router.delete('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;

    // Find review by ID
    const review = await Review.findByPk(reviewId);
    if (!review) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review
    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    // Delete the review
    await review.destroy();

    // Return success message
    return res.json({ message: "Review deleted successfully" });
});


module.exports = router;