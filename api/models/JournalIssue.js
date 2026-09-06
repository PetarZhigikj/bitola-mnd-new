// api/models/JournalIssue.js

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

        issueNumber: {
            type: 'number',
            required: true
        },

        volume: {
            type: 'string',
            allowNull: true
        },

        year: {
            type: 'number',
            required: true
        },

        publicationDate: {
            type: 'ref',
            columnType: 'datetime'
        },

        issn: {
            type: 'string',
            allowNull: true
        },

        description: {
            type: 'string',
            allowNull: true
        },

        editorInChief: {
            type: 'string',
            allowNull: true
        },

        editorialBoard: {
            type: 'json',
            defaultsTo: []
        },

        internationalBoard: {
            type: 'json',
            defaultsTo: []
        },

        coverImage: {
            model: 'mediaasset'
        },

        fullPdf: {
            model: 'mediaasset'
        },

        articles: {
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