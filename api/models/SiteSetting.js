// api/models/SiteSetting.js

module.exports = {

    attributes: {

        organizationName: {
            type: 'string',
            defaultsTo:
                'Македонско научно друштво - Битола'
        },

        logo: {
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

        address: {
            type: 'string',
            allowNull: true
        },

        workingHours: {
            type: 'string',
            allowNull: true
        },

        facebookUrl: {
            type: 'string',
            allowNull: true
        },

        instagramUrl: {
            type: 'string',
            allowNull: true
        },

        youtubeUrl: {
            type: 'string',
            allowNull: true
        },

        linkedinUrl: {
            type: 'string',
            allowNull: true
        },

        footerText: {
            type: 'string',
            allowNull: true
        },

        defaultSeoTitle: {
            type: 'string',
            allowNull: true
        },

        defaultSeoDescription: {
            type: 'string',
            allowNull: true
        },

        homepageFeaturedPost: {
            model: 'post'
        },

        homepageFeaturedJournalIssue: {
            model: 'journalissue'
        },

        showHomepageEvents: {
            type: 'boolean',
            defaultsTo: true
        },

        showHomepageDepartments: {
            type: 'boolean',
            defaultsTo: true
        },

        showMembershipSection: {
            type: 'boolean',
            defaultsTo: true
        }

    }

};