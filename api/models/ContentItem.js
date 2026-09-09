module.exports = {

    attributes: {

        type: {
            type: 'string',
            required: true,

            isIn: [
                'publikacija',
                'oglas'
            ]
        },


        title: {
            type: 'string',
            required: true
        },


        image: {
            type: 'string',
            allowNull: true
        },


        content: {
            type: 'string',
            defaultsTo: ''
        },


        attachmentUrl: {
            type: 'string',
            allowNull: true
        },


        attachmentName: {
            type: 'string',
            allowNull: true
        },


        attachmentMimeType: {
            type: 'string',
            allowNull: true
        },


        createdBy: {
            model: 'adminuser'
        },


        updatedBy: {
            model: 'adminuser'
        }

    }

};