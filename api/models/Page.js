// api/models/Page.js

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

        pageType: {
            type: 'string',
            allowNull: true
        },

        excerpt: {
            type: 'string',
            allowNull: true
        },

        content: {
            type: 'string',
            allowNull: true
        },

        featuredImage: {
            model: 'mediaasset'
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