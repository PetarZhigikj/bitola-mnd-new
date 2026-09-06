require('dotenv').config();

module.exports.datastores = {

  default: {
    adapter: 'sails-mongo',
    url: process.env.MONGO_URI,
  },

};