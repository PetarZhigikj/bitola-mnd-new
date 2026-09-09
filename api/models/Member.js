module.exports = {

    attributes: {

        name: {
            type: 'string',
            required: true
        },


        image: {
            type: 'string',
            allowNull: true
        },


        department: {
            type: 'string',
            required: true,

            isIn: [
                'opstestveni-nauki',
                'pravni-nauki',
                'prirodni-nauki',
                'primeneti-nauki-i-medicina',
                'tehnicki-nauki',
                'umetnost',
                'lingvistika-i-literatura',
                'istorisko-geografski-nauki'
            ]
        },


        content: {
            type: 'string',
            defaultsTo: ''
        },


        isActive: {
            type: 'boolean',
            defaultsTo: true
        },


        createdBy: {
            model: 'adminuser'
        }

    }

};