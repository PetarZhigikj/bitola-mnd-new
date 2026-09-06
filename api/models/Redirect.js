// api/models/Redirect.js

module.exports = {

    attributes: {

        oldPath: {
            type: 'string',
            required: true,
            unique: true
        },

        newPath: {
            type: 'string',
            required: true
        },

        statusCode: {
            type: 'number',
            defaultsTo: 301
        },

        note: {
            type: 'string',
            allowNull: true
        },

        isActive: {
            type: 'boolean',
            defaultsTo: true
        }

    }

};