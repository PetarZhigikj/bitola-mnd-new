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
    
    
    
    function sanitizeRichTextContent(content) {

        return sanitizeHtml(
            String(content || ''),
            {
    
                allowedTags: [
    
                    'p',
                    'br',
                    'span',
    
                    'strong',
                    'b',
    
                    'em',
                    'i',
    
                    'u',
                    's',
    
                    'sub',
                    'sup',
    
                    'h1',
                    'h2',
                    'h3',
                    'h4',

                    'img',
    
                    'blockquote',
    
                    'ol',
                    'ul',
                    'li',
    
                    'a'
    
                ],
    
    
                allowedAttributes: {
    
                    '*': [
                        'class',
                        'style'
                    ],
    
    
                    a: [
                        'href',
                        'target',
                        'rel',
                        'class',
                        'style'
                    ],
    
    
                    li: [
                        'data-list',
                        'class',
                        'style'
                    ],

                    img: [
                        'src',
                        'alt',
                        'title',
                        'class'
                    ]
    
                },
    
    
                allowedStyles: {
    
                    '*': {
    
                        color: [
    
                            /^#[0-9a-f]{3,8}$/i,
    
                            /^rgba?\([\d\s.,%]+\)$/i
    
                        ],
    
    
                        'background-color': [
    
                            /^#[0-9a-f]{3,8}$/i,
    
                            /^rgba?\([\d\s.,%]+\)$/i
    
                        ]
    
                    }
    
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

    const ABOUT_PAGES = [

        {
            slug:
                'osnovni-informacii',
    
            title:
                'Основни информации'
        },
    
    
        {
            slug:
                'istorijat',
    
            title:
                'Историјат'
        },
    
    
        {
            slug:
                'lica-za-kontakt',
    
            title:
                'Лица за контакт'
        },
    
    
        {
            slug:
                'rakovodna-struktura',
    
            title:
                'Раководна структура'
        }
    
    ];

    async function uploadAboutImage(req) {

        const uploadDirectory =
            path.resolve(
                sails.config.appPath,
                'assets/uploads/about'
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
    
    
                        const fileName =
                            path.basename(
                                uploadedFiles[0].fd
                            );
    
    
                        return resolve(
                            '/uploads/about/' +
                            fileName
                        );
    
                    }
                );
    
            }
        );
    
    }
    
    
    
    async function deleteAboutImage(imageUrl) {
    
        if (!imageUrl) {
            return;
        }
    
    
        const filePath =
            path.resolve(
                sails.config.appPath,
                'assets/uploads/about',
                path.basename(imageUrl)
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
                    'Unable to delete about image:',
                    error
                );
    
            }
    
        }
    
    }

    function getContentDirectory(type) {

        const directories = {
    
            'publikacija':
                'publikacii',
    
            'sovremeni-dijalozi':
                'sovremeni-dijalozi',
    
            'drugi-prilozi':
                'drugi-prilozi',
    
            'oglas':
                'oglasi',

            'novost':
                'novosti',

            'centar':
                'centri',

            'nagrada':
                'nagradi'
    
        };
    
    
        return directories[type];
    
    }

    async function uploadContentImage(
        req,
        type
    ) {
    
        const directory =
            getContentDirectory(type);
    
    
        const uploadDirectory =
            path.resolve(
                sails.config.appPath,
                `assets/uploads/${directory}/images`
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
    
                    (
                        error,
                        uploadedFiles
                    ) => {
    
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
    
    
                        console.log(
                            'CONTENT IMAGE SAVED:',
                            uploadedFile.fd
                        );
    
    
                        console.log(
                            'CONTENT IMAGE EXISTS:',
                            fs.existsSync(
                                uploadedFile.fd
                            )
                        );
    
    
                        return resolve({
    
                            url:
                                `/uploads/${directory}/images/${fileName}`
    
                        });
    
                    }
                );
    
            }
        );
    
    }

    async function uploadContentAttachment(
        req,
        type
    ) {
    
        const directory =
            getContentDirectory(type);
    
    
        const uploadDirectory =
            path.resolve(
                sails.config.appPath,
                `assets/uploads/${directory}/files`
            );
    
    
        await fs.promises.mkdir(
            uploadDirectory,
            {
                recursive: true
            }
        );
    
    
        return new Promise(
            (resolve, reject) => {
    
                req.file('attachment').upload(
                    {
    
                        dirname:
                            uploadDirectory,
    
                        maxBytes:
                            25 * 1024 * 1024
    
                    },
    
                    (
                        error,
                        uploadedFiles
                    ) => {
    
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
    
    
                        return resolve({
    
                            url:
                                `/uploads/${directory}/files/${fileName}`,
    
                            name:
                                uploadedFile.filename ||
                                fileName,
    
                            mimeType:
                                uploadedFile.type ||
                                ''
    
                        });
    
                    }
                );
    
            }
        );
    
    }

    async function deleteUploadedContentFile(
        fileUrl
    ) {
    
        if (!fileUrl) {
            return;
        }
    
    
        const cleanPath =
            String(fileUrl)
                .replace(
                    /^\/uploads\//,
                    ''
                );
    
    
        const filePath =
            path.resolve(
                sails.config.appPath,
                'assets/uploads',
                cleanPath
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
                    'Unable to delete uploaded content file:',
                    error
                );
    
            }
    
        }
    
    }

    function isValidContentType(type) {

        return [
    
            'publikacija',
    
            'sovremeni-dijalozi',
    
            'drugi-prilozi',
    
            'oglas',
            'novost',
            'centar',
            'nagrada'
    
        ].includes(type);
    
    }

    function uploadPublicationLandingImage(
        req,
        fieldName
    ) {
    
        const uploadDirectory =
            path.resolve(
                sails.config.appPath,
                'uploads',
                'publication-landing'
            );
    
    
        return fs.promises
            .mkdir(
                uploadDirectory,
                {
                    recursive: true
                }
            )
            .then(
                () => {
    
                    return new Promise(
                        (resolve, reject) => {
    
                            req.file(
                                fieldName
                            )
                            .upload(
                                {
    
                                    dirname:
                                        uploadDirectory,
    
                                    maxBytes:
                                        5 * 1024 * 1024
    
                                },
    
                                (
                                    error,
                                    uploadedFiles
                                ) => {
    
                                    if (error) {
    
                                        return reject(
                                            error
                                        );
    
                                    }
    
    
                                    if (
                                        !uploadedFiles ||
                                        !uploadedFiles.length
                                    ) {
    
                                        return resolve(
                                            null
                                        );
    
                                    }
    
    
                                    const file =
                                        uploadedFiles[0];
    
    
                                    const fileName =
                                        path.basename(
                                            file.fd
                                        );
    
    
                                    return resolve(
                                        '/publication-images/' +
                                        fileName
                                    );
    
                                }
                            );
    
                        }
                    );
    
                }
            );
    
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
                    sanitizeRichTextContent(
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
            sanitizeRichTextContent(
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

    /* =========================================================
   ЗА МНД PAGE
========================================================= */

    async aboutPagesPage(req, res) {

        return res.view(
            'admin/za-mnd',
            {

                layout:
                    'layouts/admin-layout',

                pageTitle:
                    'За МНД',

                adminPage:
                    'za-mnd'

            }
        );

    },

    async getAboutPages(req, res) {

        try {
    
            const existingPages =
                await AboutPage.find();
    
    
            const pages = [];
    
    
            for (
                const pageDefinition
                of ABOUT_PAGES
            ) {
    
                let page =
                    existingPages.find(
                        item =>
                            item.slug ===
                            pageDefinition.slug
                    );
    
    
                if (!page) {
    
                    page =
                        await AboutPage.create({
    
                            slug:
                                pageDefinition.slug,
    
                            content:
                                ''
    
                        })
                        .fetch();
    
                }
    
    
                pages.push({
    
                    ...page,
    
                    title:
                        pageDefinition.title
    
                });
    
            }
    
    
            return res.json({
    
                success: true,
    
                pages
    
            });
    
    
        } catch (error) {
    
            sails.log.error(
                'Get About pages error:',
                error
            );
    
    
            return res.status(500).json({
    
                success: false,
    
                message:
                    'Не може да се вчита содржината.'
    
            });
    
        }
    
    },

    async updateAboutPage(req, res) {

        let uploadedImage =
            null;
    
    
        try {
    
            const slug =
                String(
                    req.params.slug || ''
                ).trim();
    
    
            const pageDefinition =
                ABOUT_PAGES.find(
                    page =>
                        page.slug === slug
                );
    
    
            if (!pageDefinition) {
    
                return res.status(400).json({
    
                    success: false,
    
                    message:
                        'Невалидна страница.'
    
                });
    
            }
    
    
            let page =
                await AboutPage.findOne({
                    slug
                });
    
    
            if (!page) {
    
                page =
                    await AboutPage.create({
    
                        slug,
    
                        content: ''
    
                    })
                    .fetch();
    
            }
    
    
            const content =
                sanitizeRichTextContent(
                    req.body.content
                );
    
    
            const removeImage =
                String(
                    req.body.removeImage
                ) === 'true';
    
    
            uploadedImage =
                await uploadAboutImage(
                    req
                );
    
    
            let image =
                page.image;
    
    
            if (uploadedImage) {
    
                image =
                    uploadedImage;
    
            } else if (removeImage) {
    
                image =
                    null;
    
            }
    
    
            const updatedPage =
                await AboutPage.updateOne({
                    id: page.id
                })
                .set({
    
                    content,
    
                    image,
    
                    updatedBy:
                        req.session.adminUserId
    
                });
    
    
            if (
                page.image &&
                (
                    uploadedImage ||
                    removeImage
                )
            ) {
    
                await deleteAboutImage(
                    page.image
                );
    
            }
    
    
            return res.json({
    
                success: true,
    
                page: {
    
                    ...updatedPage,
    
                    title:
                        pageDefinition.title
    
                },
    
                message:
                    'Содржината е успешно зачувана.'
    
            });
    
    
        } catch (error) {
    
            sails.log.error(
                'Update About page error:',
                error
            );
    
    
            if (uploadedImage) {
    
                await deleteAboutImage(
                    uploadedImage
                );
    
            }
    
    
            return res.status(500).json({
    
                success: false,
    
                message:
                    'Не може да се зачува содржината.'
    
            });
    
        }
    
    },

    /* =========================================================
   ПУБЛИКАЦИИ
========================================================= */

async publicationsPage(req, res) {

    return res.view(
        'admin/content-items',
        {

            layout:
                'layouts/admin-layout',

            pageTitle:
                'Публикации',

            adminPage:
                'publikacii',

            contentType:
                'publikacija',

            contentPageTitle:
                'Публикации'

        }
    );

},

async contemporaryDialoguesAdminPage(
    req,
    res
) {

    return res.view(
        'admin/content-items',
        {

            layout:
                'layouts/admin-layout',

            pageTitle:
                'Современи дијалози',

            adminPage:
                'sovremeni-dijalozi',

            contentType:
                'sovremeni-dijalozi',

            contentPageTitle:
                'Современи дијалози'

        }
    );

},

async otherContributionsAdminPage(
    req,
    res
) {

    return res.view(
        'admin/content-items',
        {

            layout:
                'layouts/admin-layout',

            pageTitle:
                'Други прилози',

            adminPage:
                'drugi-prilozi',

            contentType:
                'drugi-prilozi',

            contentPageTitle:
                'Други прилози'

        }
    );

},

async getPublicationLanding(
    req,
    res
) {

    try {

        let landing =
            await PublicationLanding.findOne({
                key:
                    'main'
            });


        if (!landing) {

            landing =
                await PublicationLanding.create({
                    key:
                        'main'
                })
                .fetch();

        }


        return res.json({

            success: true,

            landing

        });


    } catch (error) {

        sails.log.error(
            'Get publication landing error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Не може да се вчитаат фотографиите.'

        });

    }

},

async updatePublicationLanding(
    req,
    res
) {

    try {

        let landing =
            await PublicationLanding.findOne({
                key:
                    'main'
            });


        if (!landing) {

            landing =
                await PublicationLanding.create({
                    key:
                        'main'
                })
                .fetch();

        }


        const [

            publicationsImage,

            dialoguesImage,

            otherContributionsImage

        ] = await Promise.all([

            uploadPublicationLandingImage(
                req,
                'publicationsImage'
            ),

            uploadPublicationLandingImage(
                req,
                'dialoguesImage'
            ),

            uploadPublicationLandingImage(
                req,
                'otherContributionsImage'
            )

        ]);


        const updatedLanding =
            await PublicationLanding.updateOne({
                id:
                    landing.id
            })
            .set({

                publicationsImage:
                    publicationsImage ||
                    landing.publicationsImage,

                dialoguesImage:
                    dialoguesImage ||
                    landing.dialoguesImage,

                otherContributionsImage:
                    otherContributionsImage ||
                    landing.otherContributionsImage,

                updatedBy:
                    req.session.adminUserId

            });


        return res.json({

            success: true,

            landing:
                updatedLanding,

            message:
                'Фотографиите се зачувани.'

        });


    } catch (error) {

        sails.log.error(
            'Update publication landing error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Не може да се зачуваат фотографиите.'

        });

    }

},





/* =========================================================
   ОГЛАСИ
========================================================= */

async announcementsPage(req, res) {

    return res.view(
        'admin/content-items',
        {

            layout:
                'layouts/admin-layout',

            pageTitle:
                'Огласи',

            adminPage:
                'oglasi',

            contentType:
                'oglas',

            contentPageTitle:
                'Огласи'

        }
    );

},

async getContentItems(req, res) {

    try {

        const type =
            String(
                req.params.type || ''
            );


        if (
            !isValidContentType(type)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Невалиден тип на содржина.'

            });

        }


        const items =
            await ContentItem.find({
                type
            })
            .sort(
                'createdAt DESC'
            );


        return res.json({

            success: true,

            items

        });


    } catch (error) {

        sails.log.error(
            'Get content items error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Не може да се вчита содржината.'

        });

    }

},

async createContentItem(req, res) {

    let uploadedImage = null;
    let uploadedAttachment = null;


    try {

        const type =
            String(
                req.params.type || ''
            );


        if (
            !isValidContentType(type)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Невалиден тип на содржина.'

            });

        }


        const title =
            String(
                req.body.title || ''
            ).trim();


        const content =
            sanitizeRichTextContent(
                req.body.content
            );


        if (!title) {

            return res.status(400).json({

                success: false,

                message:
                    'Насловот е задолжителен.'

            });

        }



        /* IMAGE */

        /* =================================================
   UPLOAD IMAGE + ATTACHMENT AT THE SAME TIME
================================================= */

            [
                uploadedImage,
                uploadedAttachment
            ] = await Promise.all([

                uploadContentImage(
                    req,
                    type
                ),

                uploadContentAttachment(
                    req,
                    type
                )

            ]);



        const item =
            await ContentItem.create({

                type,

                title,

                content,

                image:
                    uploadedImage?.url ||
                    null,

                attachmentUrl:
                    uploadedAttachment?.url ||
                    null,

                attachmentName:
                    uploadedAttachment?.name ||
                    null,

                attachmentMimeType:
                    uploadedAttachment?.mimeType ||
                    null,

                createdBy:
                    req.session.adminUserId,

                updatedBy:
                    req.session.adminUserId

            })
            .fetch();


        return res.json({

            success: true,

            item,

            message:
                'Содржината е успешно додадена.'

        });


    } catch (error) {

        sails.log.error(
            'Create content item error:',
            error
        );


        if (
            uploadedImage?.url
        ) {

            await deleteUploadedContentFile(
                uploadedImage.url
            );

        }


        if (
            uploadedAttachment?.url
        ) {

            await deleteUploadedContentFile(
                uploadedAttachment.url
            );

        }


        return res.status(500).json({

            success: false,

            message:
                'Не може да се додаде содржината.'

        });

    }

},

async updateContentItem(req, res) {

    let uploadedImage = null;
    let uploadedAttachment = null;


    try {

        const id =
            req.params.id;


        const existingItem =
            await ContentItem.findOne({
                id
            });


        if (!existingItem) {

            return res.status(404).json({

                success: false,

                message:
                    'Содржината не е пронајдена.'

            });

        }


        const title =
            String(
                req.body.title || ''
            ).trim();


        const content =
            sanitizeRichTextContent(
                req.body.content
            );


        const removeImage =
            String(
                req.body.removeImage
            ) === 'true';


        const removeAttachment =
            String(
                req.body.removeAttachment
            ) === 'true';


        if (!title) {

            return res.status(400).json({

                success: false,

                message:
                    'Насловот е задолжителен.'

            });

        }



        [
            uploadedImage,
            uploadedAttachment
        ] = await Promise.all([
        
            uploadContentImage(
                req,
                existingItem.type
            ),
        
            uploadContentAttachment(
                req,
                existingItem.type
            )
        
        ]);



        let image =
            existingItem.image;


        if (uploadedImage) {

            image =
                uploadedImage.url;

        } else if (removeImage) {

            image =
                null;

        }



        let attachmentUrl =
            existingItem.attachmentUrl;


        let attachmentName =
            existingItem.attachmentName;


        let attachmentMimeType =
            existingItem.attachmentMimeType;


        if (uploadedAttachment) {

            attachmentUrl =
                uploadedAttachment.url;

            attachmentName =
                uploadedAttachment.name;

            attachmentMimeType =
                uploadedAttachment.mimeType;

        } else if (removeAttachment) {

            attachmentUrl =
                null;

            attachmentName =
                null;

            attachmentMimeType =
                null;

        }



        const updatedItem =
            await ContentItem.updateOne({
                id
            })
            .set({

                title,

                content,

                image,

                attachmentUrl,

                attachmentName,

                attachmentMimeType,

                updatedBy:
                    req.session.adminUserId

            });



        /* DELETE OLD IMAGE */

        if (
            existingItem.image &&
            (
                uploadedImage ||
                removeImage
            )
        ) {

            await deleteUploadedContentFile(
                existingItem.image
            );

        }



        /* DELETE OLD ATTACHMENT */

        if (
            existingItem.attachmentUrl &&
            (
                uploadedAttachment ||
                removeAttachment
            )
        ) {

            await deleteUploadedContentFile(
                existingItem.attachmentUrl
            );

        }



        return res.json({

            success: true,

            item:
                updatedItem,

            message:
                'Содржината е успешно изменета.'

        });


    } catch (error) {

        sails.log.error(
            'Update content item error:',
            error
        );


        if (
            uploadedImage?.url
        ) {

            await deleteUploadedContentFile(
                uploadedImage.url
            );

        }


        if (
            uploadedAttachment?.url
        ) {

            await deleteUploadedContentFile(
                uploadedAttachment.url
            );

        }


        return res.status(500).json({

            success: false,

            message:
                'Не може да се измени содржината.'

        });

    }

},

async deleteContentItem(req, res) {

    try {

        const id =
            req.params.id;


        const item =
            await ContentItem.findOne({
                id
            });


        if (!item) {

            return res.status(404).json({

                success: false,

                message:
                    'Содржината не е пронајдена.'

            });

        }


        await ContentItem.destroyOne({
            id
        });


        if (item.image) {

            await deleteUploadedContentFile(
                item.image
            );

        }


        if (item.attachmentUrl) {

            await deleteUploadedContentFile(
                item.attachmentUrl
            );

        }


        return res.json({

            success: true,

            message:
                'Содржината е избришана.'

        });


    } catch (error) {

        sails.log.error(
            'Delete content item error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Не може да се избрише содржината.'

        });

    }

},

/* =========================================================
   RICH TEXT EDITOR IMAGE UPLOAD
========================================================= */

async uploadEditorImage(req, res) {

    try {

        const uploadDirectory =
            path.resolve(
                sails.config.appPath,
                'uploads/editor'
            );


        await fs.promises.mkdir(
            uploadDirectory,
            {
                recursive: true
            }
        );


        req.file('image').upload(
            {

                dirname:
                    uploadDirectory,

                maxBytes:
                    8 * 1024 * 1024

            },

            async (error, uploadedFiles) => {

                if (error) {

                    sails.log.error(
                        'Editor image upload error:',
                        error
                    );


                    return res.status(500).json({

                        success: false,

                        message:
                            'Не може да се прикачи фотографијата.'

                    });

                }


                if (
                    !uploadedFiles ||
                    !uploadedFiles.length
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            'Не е избрана фотографија.'

                    });

                }


                const uploadedFile =
                    uploadedFiles[0];


                const allowedTypes = [

                    'image/jpeg',

                    'image/png',

                    'image/webp',

                    'image/gif'

                ];


                if (
                    !allowedTypes.includes(
                        uploadedFile.type
                    )
                ) {

                    try {

                        await fs.promises.unlink(
                            uploadedFile.fd
                        );

                    } catch (_) {}


                    return res.status(400).json({

                        success: false,

                        message:
                            'Дозволени се JPG, PNG, WEBP и GIF фотографии.'

                    });

                }


                const fileName =
                    path.basename(
                        uploadedFile.fd
                    );


                return res.json({

                    success: true,

                    url:
                        '/editor-images/' +
                        fileName

                });

            }
        );


    } catch (error) {

        sails.log.error(
            'Editor image upload error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Не може да се прикачи фотографијата.'

        });

    }

},

async newsPage(req, res) {

    return res.view(
        'admin/content-items',
        {

            layout:
                'layouts/admin-layout',

            pageTitle:
                'Новости',

            adminPage:
                'novosti',

            contentType:
                'novost',

            contentPageTitle:
                'Новости'

        }
    );

},

async centersPage(req, res) {

    return res.view(
        'admin/content-items',
        {

            layout:
                'layouts/admin-layout',

            pageTitle:
                'Центри',

            adminPage:
                'centri',

            contentType:
                'centar',

            contentPageTitle:
                'Центри'

        }
    );

},

async awardsPage(req, res) {

    return res.view(
        'admin/content-items',
        {

            layout:
                'layouts/admin-layout',

            pageTitle:
                'Награди',

            adminPage:
                'nagradi',

            contentType:
                'nagrada',

            contentPageTitle:
                'Награди'

        }
    );

},




};