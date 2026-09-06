// api/models/Member.js

module.exports = {

    attributes: {

        fullName: {
            type: 'string',
            required: true
        },

        slug: {
            type: 'string',
            required: true,
            unique: true
        },

        academicTitle: {
            type: 'string',
            allowNull: true
        },

        shortBiography: {
            type: 'string',
            allowNull: true
        },

        biography: {
            type: 'string',
            allowNull: true
        },

        department: {
            model: 'department'
        },

        photo: {
            model: 'mediaasset'
        },

        cvPdf: {
            model: 'mediaasset'
        },

        email: {
            type: 'string',
            allowNull: true
        },

        phone: {
            type: 'string',
            allowNull: true
        },

        website: {
            type: 'string',
            allowNull: true
        },

        researchAreas: {
            type: 'json',
            defaultsTo: []
        },

        publications: {
            type: 'json',
            defaultsTo: []
        },

        isCurrentMember: {
            type: 'boolean',
            defaultsTo: true
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