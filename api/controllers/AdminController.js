const bcrypt =
    require('bcryptjs');

const sanitizeHtml =
    require('sanitize-html');

const path =
    require('path');

const fs =
    require('fs');



    const MEMBER_DEPARTMENTS = [

        'opstestveni-nauki',
    
        'pravni-nauki',
    
        'prirodni-nauki',
    
        'primeneti-nauki-i-medicina',
    
        'tehnicki-nauki',
    
        'umetnost',
    
        'lingvistika-i-literatura',
    
        'istorisko-geografski-nauki'
    
    ];
    
    
    
    function sanitizeMemberContent(content) {
    
        return sanitizeHtml(
            String(content || ''),
            {
    
                allowedTags: [
    
                    'p',
    
                    'br',
    
                    'strong',
    
                    'b',
    
                    'em',
    
                    'i',
    
                    'u',
    
                    's',
    
                    'h2',
    
                    'h3',
    
                    'blockquote',
    
                    'ol',
    
                    'ul',
    
                    'li',
    
                    'a'
    
                ],
    
    
                allowedAttributes: {
    
                    a: [
                        'href',
                        'target',
                        'rel'
                    ],
    
                    li: [
                        'data-list'
                    ]
    
                },
    
    
                allowedSchemes: [
                    'http',
                    'https',
                    'mailto'
                ]
    
            }
        );
    
    }
    
    
    
    async function uploadMemberImage(req) {
    
        const uploadDirectory =
            path.resolve(
                sails.config.appPath,
                'assets/uploads/members'
            );
    
    
        await fs.promises.mkdir(
            uploadDirectory,
            {
                recursive: true
            }
        );
    
    
        return new Promise(
            (resolve, reject) => {
    
                req.file('image').upload(
                    {
    
                        dirname:
                            uploadDirectory,
    
                        maxBytes:
                            5 * 1024 * 1024
    
                    },
    
                    (error, uploadedFiles) => {
    
                        if (error) {
                            return reject(error);
                        }
    
    
                        if (
                            !uploadedFiles ||
                            !uploadedFiles.length
                        ) {
    
                            return resolve(null);
    
                        }
    
    
                        const uploadedFile =
                            uploadedFiles[0];
    
    
                        const fileName =
                            path.basename(
                                uploadedFile.fd
                            );
    
    
                        return resolve(
                            '/uploads/members/' +
                            fileName
                        );
    
                    }
                );
    
            }
        );
    
    }
    
    
    
    async function deleteMemberImage(imageUrl) {
    
        if (!imageUrl) {
            return;
        }
    
    
        const fileName =
            path.basename(imageUrl);
    
    
        const filePath =
            path.resolve(
                sails.config.appPath,
                'assets/uploads/members',
                fileName
            );
    
    
        try {
    
            await fs.promises.unlink(
                filePath
            );
    
        } catch (error) {
    
            if (
                error.code !== 'ENOENT'
            ) {
    
                sails.log.warn(
                    'Unable to delete member image:',
                    error
                );
    
            }
    
        }
    
    }

module.exports = {


    /* =========================================================
       LOGIN PAGE
    ========================================================= */

    async loginPage(req, res) {

        if (req.session.adminUserId) {
            return res.redirect('/admin');
        }

        return res.view('admin/login', {

            layout: false,

            pageTitle: 'Admin Login',

            adminPage: 'login'

        });

    },



    /* =========================================================
       LOGIN
    ========================================================= */

    async login(req, res) {

        try {

            const email =
                String(req.body.email || '')
                    .trim()
                    .toLowerCase();

            const password =
                String(req.body.password || '');


            if (!email || !password) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Email and password are required.'

                });

            }


            const admin =
                await AdminUser.findOne({
                    email
                });


            if (!admin) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Invalid email or password.'

                });

            }


            if (!admin.isActive) {

                return res.status(403).json({

                    success: false,

                    message:
                        'This administrator account is inactive.'

                });

            }


            const passwordMatches =
                await bcrypt.compare(
                    password,
                    admin.password
                );


            if (!passwordMatches) {

                return res.status(401).json({

                    success: false,

                    message:
                        'Invalid email or password.'

                });

            }


            req.session.adminUserId =
                admin.id;


            await AdminUser.updateOne({
                id: admin.id
            })
            .set({
                lastLoginAt: new Date()
            });


            return res.json({

                success: true,

                message:
                    'Login successful.'

            });


        } catch (error) {

            sails.log.error(
                'Admin login error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to log in.'

            });

        }

    },



    /* =========================================================
       LOGOUT
    ========================================================= */

    async logout(req, res) {

        try {

            req.session.adminUserId = null;


            return res.json({

                success: true,

                message:
                    'Logged out successfully.'

            });


        } catch (error) {

            sails.log.error(
                'Admin logout error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Unable to log out.'

            });

        }

    },



    /* =========================================================
       DASHBOARD
    ========================================================= */

    async dashboard(req, res) {

        try {

            const admin =
                await AdminUser.findOne({
                    id: req.session.adminUserId
                });


            return res.view(
                'admin/dashboard',
                {

                    layout:
                        'layouts/admin-layout',

                    pageTitle:
                        'Dashboard',

                    adminPage:
                        'dashboard',

                    admin

                }
            );


        } catch (error) {

            sails.log.error(
                'Admin dashboard error:',
                error
            );


            return res.serverError(
                'Unable to load dashboard.'
            );

        }

    },

    /* =========================================================
   ЧЛЕНОВИ PAGE
========================================================= */

    async membersPage(req, res) {

        return res.view(
            'admin/clenovi',
            {

                layout:
                    'layouts/admin-layout',

                pageTitle:
                    'Членови',

                adminPage:
                    'clenovi'

            }
        );

    },

    /* =========================================================
    GET MEMBERS
    ========================================================= */

    async getMembers(req, res) {

        try {

            const members =
                await Member.find()
                    .sort(
                        'createdAt DESC'
                    );


            return res.json({

                success: true,

                members

            });


        } catch (error) {

            sails.log.error(
                'Get members error:',
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    'Не може да се вчитаат членовите.'

            });

        }

    },
    /* =========================================================
    CREATE MEMBER
    ========================================================= */

    async createMember(req, res) {

        let uploadedImage = null;


        try {

            const name =
                String(
                    req.body.name || ''
                ).trim();


            const department =
                String(
                    req.body.department || ''
                ).trim();


            const content =
                sanitizeMemberContent(
                    req.body.content
                );


            const isActive =
                String(
                    req.body.isActive
                ) !== 'false';



            /* -------------------------------------------------
            VALIDATION
            -------------------------------------------------- */

            if (!name) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Името и презимето се задолжителни.'

                });

            }


            if (
                !MEMBER_DEPARTMENTS.includes(
                    department
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        'Изберете валидно одделение.'

                });

            }



            /* -------------------------------------------------
            IMAGE
            -------------------------------------------------- */

            uploadedImage =
                await uploadMemberImage(
                    req
                );



            /* -------------------------------------------------
            CREATE
            -------------------------------------------------- */

            const member =
                await Member.create({

                    name,

                    department,

                    content,

                    image:
                        uploadedImage,

                    isActive,

                    createdBy:
                        req.session.adminUserId

                })
                .fetch();


            return res.json({

                success: true,

                member,

                message:
                    'Членот е успешно додаден.'

            });


        } catch (error) {

            sails.log.error(
                'Create member error:',
                error
            );


            if (uploadedImage) {

                await deleteMemberImage(
                    uploadedImage
                );

            }


            return res.status(500).json({

                success: false,

                message:
                    'Не може да се додаде членот.'

            });

        }

    },

    /* =========================================================
   UPDATE MEMBER
========================================================= */

async updateMember(req, res) {

    let uploadedImage = null;


    try {

        const id =
            req.params.id;


        const existingMember =
            await Member.findOne({
                id
            });


        if (!existingMember) {

            return res.status(404).json({

                success: false,

                message:
                    'Членот не е пронајден.'

            });

        }


        const name =
            String(
                req.body.name || ''
            ).trim();


        const department =
            String(
                req.body.department || ''
            ).trim();


        const content =
            sanitizeMemberContent(
                req.body.content
            );


        const isActive =
            String(
                req.body.isActive
            ) !== 'false';


        if (!name) {

            return res.status(400).json({

                success: false,

                message:
                    'Името и презимето се задолжителни.'

            });

        }


        if (
            !MEMBER_DEPARTMENTS.includes(
                department
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Изберете валидно одделение.'

            });

        }



        uploadedImage =
            await uploadMemberImage(
                req
            );


        const newImage =
            uploadedImage ||
            existingMember.image;


        const updatedMember =
            await Member.updateOne({
                id
            })
            .set({

                name,

                department,

                content,

                image:
                    newImage,

                isActive

            });


        if (
            uploadedImage &&
            existingMember.image
        ) {

            await deleteMemberImage(
                existingMember.image
            );

        }


        return res.json({

            success: true,

            member:
                updatedMember,

            message:
                'Членот е успешно изменет.'

        });


    } catch (error) {

        sails.log.error(
            'Update member error:',
            error
        );


        if (uploadedImage) {

            await deleteMemberImage(
                uploadedImage
            );

        }


        return res.status(500).json({

            success: false,

            message:
                'Не може да се измени членот.'

        });

    }

},

/* =========================================================
   DELETE MEMBER
========================================================= */

async deleteMember(req, res) {

    try {

        const id =
            req.params.id;


        const member =
            await Member.findOne({
                id
            });


        if (!member) {

            return res.status(404).json({

                success: false,

                message:
                    'Членот не е пронајден.'

            });

        }


        await Member.destroyOne({
            id
        });


        if (member.image) {

            await deleteMemberImage(
                member.image
            );

        }


        return res.json({

            success: true,

            message:
                'Членот е избришан.'

        });


    } catch (error) {

        sails.log.error(
            'Delete member error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Не може да се избрише членот.'

        });

    }

},

};