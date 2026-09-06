module.exports = async function (
    req,
    res,
    proceed
) {

    try {

        if (
            !req.session.adminUserId
        ) {

            if (
                req.wantsJSON ||
                req.path.startsWith(
                    '/admin/api/'
                )
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        'You must be logged in.'
                });
            }


            return res.redirect(
                '/admin/login'
            );
        }


        const admin =
            await AdminUser.findOne({
                id:
                    req.session
                        .adminUserId
            });


        if (
            !admin ||
            !admin.isActive
        ) {

            req.session.adminUserId =
                null;


            if (
                req.wantsJSON ||
                req.path.startsWith(
                    '/admin/api/'
                )
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        'Your admin session is no longer valid.'
                });
            }


            return res.redirect(
                '/admin/login'
            );
        }


        req.adminUser =
            admin;


        return proceed();

    } catch (error) {

        sails.log.error(
            'isAdmin policy error:',
            error
        );


        return res.serverError();
    }
};