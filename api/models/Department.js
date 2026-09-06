// api/models/Department.js

module.exports = {

    attributes: {

        name: {
            type: 'string',
            required: true
        },

        slug: {
            type: 'string',
            required: true,
            unique: true
        },

        description: {
            type: 'string',
            allowNull: true
        },

        image: {
            model: 'mediaasset'
        },

        sortOrder: {
            type: 'number',
            defaultsTo: 0
        },

        isActive: {
            type: 'boolean',
            defaultsTo: true
        },

        seoTitle: {
            type: 'string',
            allowNull: true
        },

        seoDescription: {
            type: 'string',
            allowNull: true
        },

        legacyUrl: {
            type: 'string',
            allowNull: true
        }

    }

};