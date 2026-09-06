// api/models/Post.js

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

        type: {
            type: 'string',
            isIn: [
                'news',
                'event',
                'announcement'
            ],
            defaultsTo: 'news'
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

        attachments: {
            type: 'json',
            defaultsTo: []
        },

        category: {
            type: 'string',
            allowNull: true
        },

        tags: {
            type: 'json',
            defaultsTo: []
        },

        eventStartAt: {
            type: 'ref',
            columnType: 'datetime'
        },

        eventEndAt: {
            type: 'ref',
            columnType: 'datetime'
        },

        eventLocation: {
            type: 'string',
            allowNull: true
        },

        isFeatured: {
            type: 'boolean',
            defaultsTo: false
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