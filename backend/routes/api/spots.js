const express = require('express');
const {Spot, SpotImage, User, Review, ReviewImage} = require('../../db/models');
const {check} = require('express-validator');
const {handleValidationErrors} = require('../../utils/validation');
const {requireAuth} = require('../../utils/auth');
const { Op } = require('sequelize');

const router = express.Router();

const validateSpot = [
    check('ownerId')
        .exists({checkFalsy: true})
        .isInt()
        .withMessage('Invalid OwnerId'),
    check('address')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('Please provide a valid address'),
    check('city')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('Please provide a valid city'),
    check('state')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('Please provide a valid state'),
    check('country')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('Please provide a valid country'),
    check('lat')
        .exists({checkFalsy: true})
        .isFloat({min: -90, max: 90})
        .withMessage('Please provide a valid latitude'),
    check('lng')
        .exists({checkFalsy: true})
        .isFloat({min: -180, max: 180})
        .withMessage('Please provide a valid longitude'),
    check('name')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('Please provide a valid name'),
    check('description')
        .exists({checkFalsy: true})
        .isString()
        .withMessage('Please provide a valid description'),
    check('price')
        .exists({checkFalsy: true})
        .isFloat({gt: 0})
        .withMessage('Please provide a valid price'),
    handleValidationErrors
];

const validateQueryFilters = [
    check('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    check('size')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Size must be between 1 and 20'),
    handleValidationErrors
];

const validateReview = [
    check('review')
        .exists({checkFalsy: true}),
    check('stars')
        .exists({checkFalsy: true})
        .isInt({min: 1, max: 5}),
    handleValidationErrors
]

router.get('/', validateQueryFilters, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 20;

    const offset = (page - 1) * size; // adjust the page index 

    const spots = await Spot.findAll ({
        limit: size,
        offset: offset,
        include: [
            {
                model: SpotImage,
                attributes: ['url', 'preview']
            },
            {
                model: Review,
                attributes: ['id', 'review', 'stars', 'spotId']
            }
        ]
    });

   return res.json({spots, page, size});

});

router.get('/current', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id; // Get current user ID
        const spots = await Spot.findAll({
            where: { ownerId: userId },
            include: [
                {
                    model: SpotImage,
                    attributes: ['url', 'preview']
                }
            ]
        });

        return res.json({ spots });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/', requireAuth, validateSpot, async (req, res) => {

    const { address, city, state, country, lat, lng, name, description, price} = req.body;

    const spot = await Spot.create({
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,
        ownerId: req.user.id, // Associate the current user as the owner
    })

    return res.json({ spot });

});

router.post('/:id/images', requireAuth, async (req, res) => {

    const {id} = req.params;
    const {url, preview } = req.body;
    const userId = req.user.id;

    try {

        const spot = await Spot.findByPk(id);

        if (!spot) {
            return res.status(404).json({ message:"No spot" });
        }

        if (spot.ownerId !== userId) {
            return res.status(403).json({message: 'Forbidden'})
        }

        const spotImage = await SpotImage.create({
            spotId: id,
            url,
            preview
        })

        return res.status(201).json({
            id: spotImage.id,
            url: spotImage.url,
            preview: spotImage.preview
        })

    } catch (error) {

        return res.status(500).json({ message: 'There was an error'})

    }
 
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const spot = await Spot.findByPk(id, {
            include: [
                {
                    model: SpotImage,
                    attributes: ['url', 'preview']
                },
                {
                    model: User,
                    as: 'Owner',
                    attributes: ['firstName', 'lastName']
                },
                {
                    model: Review,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ]
                }
            ]
        });
        if (!spot) {
            return res.status(404).json({ message: "Spot not found" });
        }


        const spotJson = spot.toJSON();
        const previewImageObj = spotJson.SpotImages.find(img => img.preview === true);
        spotJson.previewImage = previewImageObj ? previewImageObj.url : null;

        return res.json(spotJson);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.put('/:id', requireAuth, validateSpot, async (req, res) => {

    const {id} = req.params;
    const { address, city, state, country, lat, lng, name, description, price} = req.body;
    const userId = req.user.id;

   try {

    const spot = await Spot.findByPk(id);

    if (!spot) {
        return res.status(404).json({message: "No spot"})
    }

    if (spot.ownerId !== userId) {
        return res.status(403).json({ message: "Forbidden"})
    }

    await spot.update({
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price,

    })
    return res.json(spot);

   } catch(error) {
    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({message: "Validation error"})
    } 

    return res.status(500).json({message:"There was an error"})
    
   }
});

router.delete('/:id', requireAuth, async (req, res) => {

    const {id} = req.params;
    const userId = req.user.id;

    try {
        const spot = await Spot.findByPk(id);

        if (!spot) {
            return res.status(404).json({message: "No spot"})
        }

        if (spot.ownerId !== userId) {
            return res.status(403).json({message: "Forbidden" })
        }

        await spot.destroy();
        return res.json({message: "Sucess"});
    }
    catch (error) {
        return res.status(500).json({message: "There was an error"})
    }
    
});

module.exports = router;
