module.exports = {

    attributes: {

        key: {
            type: 'string',
            required: true,
            unique: true
        },


        publicationsImage: {
            type: 'string',
            allowNull: true
        },


        dialoguesImage: {
            type: 'string',
            allowNull: true
        },


        otherContributionsImage: {
            type: 'string',
            allowNull: true
        },


        updatedBy: {
            model: 'adminuser'
        }

    }

};