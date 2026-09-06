// api/models/Center.js

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

        director: {
            type: 'string',
            allowNull: true
        },

        email: {
            type: 'string',
            allowNull: true
        },

        phone: {
            type: 'string',
            allowNull: true
        },

        address: {
            type: 'string',
            allowNull: true
        },

        image: {
            model: 'mediaasset'
        },

        documents: {
            type: 'json',
            defaultsTo: []
        },

        sortOrder: {
            type: 'number',
            defaultsTo: 0
        },

        status: {
            type: 'string',
            isIn: [
                'draft',
                'published',
                'archived'
            ],
            defaultsTo: 'draft'
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