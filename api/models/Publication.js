// api/models/Publication.js

module.exports = {

    attributes: {

        title: {
            type: 'string',
            required: true
        },

        slug: {
            type: 'string',
            required: true,
            unique: true
        },

        publicationType: {
            type: 'string',
            isIn: [
                'monograph',
                'proceedings',
                'bibliography',
                'book',
                'other'
            ],
            defaultsTo: 'other'
        },

        authors: {
            type: 'json',
            defaultsTo: []
        },

        editors: {
            type: 'json',
            defaultsTo: []
        },

        year: {
            type: 'number',
            allowNull: true
        },

        isbn: {
            type: 'string',
            allowNull: true
        },

        description: {
            type: 'string',
            allowNull: true
        },

        coverImage: {
            model: 'mediaasset'
        },

        pdf: {
            model: 'mediaasset'
        },

        attachments: {
            type: 'json',
            defaultsTo: []
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

        publishedAt: {
            type: 'ref',
            columnType: 'datetime'
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