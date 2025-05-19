'use strict';

const { Spot, SpotImage, User} = require('../models');



let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     * 
     * 
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

  

  // const demoUser = await User.findOne ({ where: { username: 'Demo-lition'}});

  const spots = await Spot.bulkCreate ('Spots', [
    {
      ownerId:  1,
      address:  '95 3rd St 2nd Floor',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      lat: 58.54,
      lng: -34.67,
      name: 'App Academy',
      description: 'Coding bootcamp',
      price: 29000

    },
    {
      ownerId: 1,
      address: '4565 Sunny dr',
      city: 'Los Angeles',
      state: "CA",
      country: 'USA',
      lat: 89.93,
      lng: -67.34,
      name: 'Sunny Store',
      description: 'Sunny Store',
      price: 29000
    },
    {
      ownerId: 1,
      address: '987 Lookout Mountain Rd',
      city: 'Golden',
      state: "CO",
      country: 'USA',
      lat: 66.70,
      lng: -33.31,
      name: 'Lookout Mountain Park',
      description: 'Viewpoint',
      price: 29000

    }
  ], { validate: true});

  await SpotImage.bulkCreate('SpotImages', [
    {
      spotId: spots[0].id,
      url: 'https://example.com/test-image.jpg',
      preview: true
    },
    {
      spotId: spots[1].id,
      url: 'https://example.com/test-image.jpg',
      preview: false
    },
    {
      spotId: spots[2].id,
      url: 'https://example.com/test-image.jpg',
      preview: true
    }
  ], {validate: true});
},
async down (queryInterface, Sequelize) {
    const Op = Sequelize.Op;

    options.tableName = 'SpotImages';
    await queryInterface.bulkDelete(options, {
      spotId: { [Op.ne]: null }
    });

    options.tableName = 'Spots';
    await queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['App Academy', 'Sunny Store', 'Lookout Mountain Park'] }
    });
  }
};