// api/models/AdminUser.js

module.exports = {

    attributes: {

        email: {
            type: 'string',
            required: true,
            unique: true,
            isEmail: true
        },

        password: {
            type: 'string',
            required: true
        },

        firstName: {
            type: 'string',
            allowNull: true
            
        },

        lastName: {
            type: 'string',
            allowNull: true
            
        },

        role: {
            type: 'string',
            isIn: [
                'admin',
                'editor'
            ],
            defaultsTo: 'admin'
        },

        isActive: {
            type: 'boolean',
            defaultsTo: true
        },

        lastLoginAt: {
            type: 'ref',
            columnType: 'datetime'
        }

    },


    customToJSON() {

        return _.omit(
            this,
            [
                'password'
            ]
        );
    }

};