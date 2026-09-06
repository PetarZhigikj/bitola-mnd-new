// api/models/MediaAsset.js

module.exports = {

    attributes: {

        type: {
            type: 'string',
            required: true,
            isIn: [
                'image',
                'pdf',
                'document'
            ]
        },

        originalName: {
            type: 'string',
            required: true
        },

        fileName: {
            type: 'string',
            required: true
        },

        url: {
            type: 'string',
            required: true
        },

        mimeType: {
            type: 'string',
            required: true
        },

        size: {
            type: 'number',
            defaultsTo: 0
        },

        width: {
            type: 'number',
            allowNull: true
        },

        height: {
            type: 'number',
            allowNull: true
        },

        altText: {
            type: 'string',
            allowNull: true
        },

        caption: {
            type: 'string',
            allowNull: true
        },

        uploadedBy: {
            model: 'adminuser'
        }

    }

};