const bcrypt = require('bcryptjs');

require('sails').lift(
    {
        hooks: {
            grunt: false
        }
    },

    async (err) => {

        if (err) {
            console.error(err);
            process.exit(1);
        }

        try {

            const email = 'admin@mnd.test';
            const password = 'Admin123!';

            const existingAdmin =
                await AdminUser.findOne({
                    email
                });


            if (existingAdmin) {

                console.log(
                    'Admin user already exists.'
                );

                await sails.lower();

                return;
            }


            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            const admin =
                await AdminUser.create({

                    email,

                    password:
                        hashedPassword,

                    firstName:
                        'Test',

                    lastName:
                        'Admin',

                    role:
                        'admin',

                    isActive:
                        true

                }).fetch();


            console.log(
                'Admin created successfully:'
            );

            console.log({
                id: admin.id,
                email: admin.email
            });

            console.log(
                `Password: ${password}`
            );


            await sails.lower();

        } catch (error) {

            console.error(
                'Error creating admin:',
                error
            );

            await sails.lower();

            process.exit(1);
        }

    }
);