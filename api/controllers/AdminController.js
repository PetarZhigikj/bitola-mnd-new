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

        if (type === 'publikacija') {
            return 'publikacii';
        }
    
    
        return 'oglasi';
    
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
                `.tmp/public/uploads/${directory}/images`
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
                `.tmp/public/uploads/${directory}/files`
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
                .replace(/^\/+/, '');
    
    
        const filePath =
            path.resolve(
                sails.config.appPath,
                '.tmp/public',
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
            'oglas'
        ].includes(type);
    
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



};