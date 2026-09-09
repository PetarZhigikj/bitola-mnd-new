module.exports = {

    attributes: {


        slug: {

            type: 'string',

            required: true,

            unique: true,

            isIn: [

                'osnovni-informacii',

                'istorijat',

                'lica-za-kontakt',

                'rakovodna-struktura'

            ]

        },


        image: {

            type: 'string',

            allowNull: true

        },


        content: {

            type: 'string',

            defaultsTo: ''

        },


        updatedBy: {

            model: 'adminuser'

        }

    }

};