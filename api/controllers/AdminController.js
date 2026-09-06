const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');


// =========================================================
// SMALL INTERNAL HELPERS
// =========================================================

function nullableString(value) {
    if (value === undefined || value === null) {
        return null;
    }

    const cleaned = String(value).trim();

    return cleaned || null;
}


function createBasicSlug(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\u0400-\u04FF]+/g, '-')
        .replace(/^-+|-+$/g, '');
}


async function createUniqueSlug(Model, value, excludeId = null) {

    let baseSlug = createBasicSlug(value);

    if (!baseSlug) {
        baseSlug = `item-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 2;

    while (true) {

        const existing = await Model.findOne({
            slug
        });

        if (
            !existing ||
            (
                excludeId &&
                String(existing.id) === String(excludeId)
            )
        ) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}


function parseDate(value) {

    if (!value) {
        return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}


function renderAdminPage(res, view, pageTitle, adminPage) {

    return res.view(view, {
        layout: 'layouts/admin-layout',
        pageTitle,
        adminPage
    });
}


async function getPopulatedMember(id) {

    return Member.findOne({
        id
    })
        .populate('department')
        .populate('photo')
        .populate('cvPdf');
}


async function getPopulatedPost(id) {

    return Post.findOne({
        id
    })
        .populate('featuredImage');
}


async function getPopulatedDepartment(id) {

    return Department.findOne({
        id
    })
        .populate('image');
}


// =========================================================
// CONTROLLER
// =========================================================

module.exports = {


    // =====================================================
    // ADMIN PAGE ROUTES
    // =====================================================

    async loginPage(req, res) {

        if (req.session.adminUserId) {
            return res.redirect('/admin');
        }

        return res.view('admin/login', {
            layout: false,
            pageTitle: 'Admin Login'
        });
    },


    async dashboard(req, res) {

        return renderAdminPage(
            res,
            'admin/dashboard',
            'Dashboard',
            'dashboard'
        );
    },


    async postsPage(req, res) {

        return renderAdminPage(
            res,
            'admin/posts',
            'News & Events',
            'posts'
        );
    },


    async membersPage(req, res) {

        return renderAdminPage(
            res,
            'admin/members',
            'Members',
            'members'
        );
    },


    async departmentsPage(req, res) {

        return renderAdminPage(
            res,
            'admin/departments',
            'Departments',
            'departments'
        );
    },


    async centersPage(req, res) {

        return renderAdminPage(
            res,
            'admin/centers',
            'Centers',
            'centers'
        );
    },


    async publicationsPage(req, res) {

        return renderAdminPage(
            res,
            'admin/publications',
            'Publications',
            'publications'
        );
    },


    async journalPage(req, res) {

        return renderAdminPage(
            res,
            'admin/journal',
            'Современи дијалози',
            'journal'
        );
    },


    async pagesPage(req, res) {

        return renderAdminPage(
            res,
            'admin/pages',
            'Pages',
            'pages'
        );
    },


    async mediaPage(req, res) {

        return renderAdminPage(
            res,
            'admin/media',
            'Media Library',
            'media'
        );
    },


    async redirectsPage(req, res) {

        return renderAdminPage(
            res,
            'admin/redirects',
            'Redirects',
            'redirects'
        );
    },


    async settingsPage(req, res) {

        return renderAdminPage(
            res,
            'admin/settings',
            'Settings',
            'settings'
        );
    },



    // =====================================================
    // AUTH
    // =====================================================

    async login(req, res) {

        try {

            const email = String(
                req.body.email || ''
            )
                .trim()
                .toLowerCase();

            const password = String(
                req.body.password || ''
            );


            if (!email || !password) {

                return res.badRequest({
                    success: false,
                    message: 'Email and password are required.'
                });
            }


            const admin = await AdminUser.findOne({
                email
            });


            if (!admin || !admin.isActive) {

                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password.'
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
                    message: 'Invalid email or password.'
                });
            }


            req.session.adminUserId = admin.id;


            await AdminUser.updateOne({
                id: admin.id
            }).set({
                lastLoginAt: new Date()
            });


            return res.json({
                success: true,
                message: 'Login successful.',
                admin: {
                    id: admin.id,
                    email: admin.email,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: admin.role
                }
            });

        } catch (error) {

            sails.log.error(
                'Admin login error:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Unable to log in.'
            });
        }
    },


    async logout(req, res) {

        try {

            req.session.adminUserId = null;

            return res.json({
                success: true,
                message: 'Logged out successfully.'
            });

        } catch (error) {

            sails.log.error(
                'Admin logout error:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Unable to log out.'
            });
        }
    },



    // =====================================================
    // MEMBERS
    // =====================================================

    async getMembers(req, res) {

        try {

            const members = await Member.find()
                .sort('fullName ASC')
                .populate('department')
                .populate('photo')
                .populate('cvPdf');


            return res.json({
                success: true,
                members
            });

        } catch (error) {

            sails.log.error(
                'Error loading members:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to load members.'
            });
        }
    },


    async createMember(req, res) {

        try {

            const {
                fullName,
                academicTitle,
                shortBiography,
                biography,
                department,
                photo,
                cvPdf,
                email,
                website,
                isCurrentMember,
                status,
                legacyUrl
            } = req.body;


            if (!fullName?.trim()) {

                return res.badRequest({
                    success: false,
                    message: 'Full name is required.'
                });
            }


            const slug = await createUniqueSlug(
                Member,
                req.body.slug || fullName
            );


            const createdMember = await Member.create({

                fullName:
                    fullName.trim(),

                slug,

                academicTitle:
                    nullableString(academicTitle),

                shortBiography:
                    nullableString(shortBiography),

                biography:
                    nullableString(biography),

                department:
                    department || null,

                photo:
                    photo || null,

                cvPdf:
                    cvPdf || null,

                email:
                    nullableString(email),

                website:
                    nullableString(website),

                isCurrentMember:
                    typeof isCurrentMember === 'boolean'
                        ? isCurrentMember
                        : true,

                status:
                    status || 'draft',

                legacyUrl:
                    nullableString(legacyUrl)

            }).fetch();


            const member =
                await getPopulatedMember(
                    createdMember.id
                );


            return res.json({
                success: true,
                message: 'Member created successfully.',
                member
            });

        } catch (error) {

            sails.log.error(
                'Error creating member:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to create member.'
            });
        }
    },


    async updateMember(req, res) {

        try {

            const memberId = req.params.id;


            const existingMember =
                await Member.findOne({
                    id: memberId
                });


            if (!existingMember) {

                return res.notFound({
                    success: false,
                    message: 'Member not found.'
                });
            }


            const {
                fullName,
                academicTitle,
                shortBiography,
                biography,
                department,
                photo,
                cvPdf,
                email,
                website,
                isCurrentMember,
                status,
                legacyUrl
            } = req.body;


            if (!fullName?.trim()) {

                return res.badRequest({
                    success: false,
                    message: 'Full name is required.'
                });
            }


            const slug = await createUniqueSlug(
                Member,
                req.body.slug || fullName,
                memberId
            );


            await Member.updateOne({
                id: memberId
            }).set({

                fullName:
                    fullName.trim(),

                slug,

                academicTitle:
                    nullableString(academicTitle),

                shortBiography:
                    nullableString(shortBiography),

                biography:
                    nullableString(biography),

                department:
                    department || null,

                photo:
                    photo || null,

                cvPdf:
                    cvPdf || null,

                email:
                    nullableString(email),

                website:
                    nullableString(website),

                isCurrentMember:
                    typeof isCurrentMember === 'boolean'
                        ? isCurrentMember
                        : existingMember.isCurrentMember,

                status:
                    status || existingMember.status,

                legacyUrl:
                    nullableString(legacyUrl)

            });


            const member =
                await getPopulatedMember(
                    memberId
                );


            return res.json({
                success: true,
                message: 'Member updated successfully.',
                member
            });

        } catch (error) {

            sails.log.error(
                'Error updating member:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to update member.'
            });
        }
    },


    async deleteMember(req, res) {

        try {

            const memberId = req.params.id;


            const existingMember =
                await Member.findOne({
                    id: memberId
                });


            if (!existingMember) {

                return res.notFound({
                    success: false,
                    message: 'Member not found.'
                });
            }


            await Member.destroyOne({
                id: memberId
            });


            return res.json({
                success: true,
                message: 'Member deleted successfully.'
            });

        } catch (error) {

            sails.log.error(
                'Error deleting member:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to delete member.'
            });
        }
    },



    // =====================================================
    // POSTS
    // =====================================================

    async getPosts(req, res) {

        try {

            const posts = await Post.find()
                .sort('createdAt DESC')
                .populate('featuredImage');


            return res.json({
                success: true,
                posts
            });

        } catch (error) {

            sails.log.error(
                'Error loading posts:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to load posts.'
            });
        }
    },


    async createPost(req, res) {

        try {

            const {
                title,
                type,
                excerpt,
                content,
                featuredImage,
                eventStartAt,
                eventEndAt,
                eventLocation,
                status,
                publishedAt,
                legacyUrl,
                seoTitle,
                seoDescription
            } = req.body;


            if (!title?.trim()) {

                return res.badRequest({
                    success: false,
                    message: 'Title is required.'
                });
            }


            const slug = await createUniqueSlug(
                Post,
                req.body.slug || title
            );


            let finalPublishedAt =
                parseDate(publishedAt);


            if (
                status === 'published' &&
                !finalPublishedAt
            ) {
                finalPublishedAt = new Date();
            }


            const createdPost = await Post.create({

                title:
                    title.trim(),

                slug,

                type:
                    type || 'news',

                excerpt:
                    nullableString(excerpt),

                content:
                    nullableString(content),

                featuredImage:
                    featuredImage || null,

                eventStartAt:
                    parseDate(eventStartAt),

                eventEndAt:
                    parseDate(eventEndAt),

                eventLocation:
                    nullableString(eventLocation),

                status:
                    status || 'draft',

                publishedAt:
                    finalPublishedAt,

                legacyUrl:
                    nullableString(legacyUrl),

                seoTitle:
                    nullableString(seoTitle),

                seoDescription:
                    nullableString(seoDescription)

            }).fetch();


            const post =
                await getPopulatedPost(
                    createdPost.id
                );


            return res.json({
                success: true,
                message: 'Post created successfully.',
                post
            });

        } catch (error) {

            sails.log.error(
                'Error creating post:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to create post.'
            });
        }
    },


    async updatePost(req, res) {

        try {

            const postId = req.params.id;


            const existingPost =
                await Post.findOne({
                    id: postId
                });


            if (!existingPost) {

                return res.notFound({
                    success: false,
                    message: 'Post not found.'
                });
            }


            const {
                title,
                type,
                excerpt,
                content,
                featuredImage,
                eventStartAt,
                eventEndAt,
                eventLocation,
                status,
                publishedAt,
                legacyUrl,
                seoTitle,
                seoDescription
            } = req.body;


            if (!title?.trim()) {

                return res.badRequest({
                    success: false,
                    message: 'Title is required.'
                });
            }


            const slug = await createUniqueSlug(
                Post,
                req.body.slug || title,
                postId
            );


            let finalPublishedAt =
                parseDate(publishedAt);


            if (
                status === 'published' &&
                !finalPublishedAt
            ) {

                finalPublishedAt =
                    existingPost.publishedAt ||
                    new Date();
            }


            await Post.updateOne({
                id: postId
            }).set({

                title:
                    title.trim(),

                slug,

                type:
                    type || existingPost.type,

                excerpt:
                    nullableString(excerpt),

                content:
                    nullableString(content),

                featuredImage:
                    featuredImage || null,

                eventStartAt:
                    parseDate(eventStartAt),

                eventEndAt:
                    parseDate(eventEndAt),

                eventLocation:
                    nullableString(eventLocation),

                status:
                    status || existingPost.status,

                publishedAt:
                    finalPublishedAt,

                legacyUrl:
                    nullableString(legacyUrl),

                seoTitle:
                    nullableString(seoTitle),

                seoDescription:
                    nullableString(seoDescription)

            });


            const post =
                await getPopulatedPost(
                    postId
                );


            return res.json({
                success: true,
                message: 'Post updated successfully.',
                post
            });

        } catch (error) {

            sails.log.error(
                'Error updating post:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to update post.'
            });
        }
    },


    async deletePost(req, res) {

        try {

            const postId = req.params.id;


            const existingPost =
                await Post.findOne({
                    id: postId
                });


            if (!existingPost) {

                return res.notFound({
                    success: false,
                    message: 'Post not found.'
                });
            }


            await Post.destroyOne({
                id: postId
            });


            return res.json({
                success: true,
                message: 'Post deleted successfully.'
            });

        } catch (error) {

            sails.log.error(
                'Error deleting post:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to delete post.'
            });
        }
    },



    // =====================================================
    // DEPARTMENTS
    // =====================================================

    async getDepartments(req, res) {

        try {

            const departments =
                await Department.find()
                    .sort('sortOrder ASC')
                    .populate('image');


            return res.json({
                success: true,
                departments
            });

        } catch (error) {

            sails.log.error(
                'Error loading departments:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to load departments.'
            });
        }
    },


    async createDepartment(req, res) {

        try {

            const {
                name,
                description,
                image,
                sortOrder,
                isActive
            } = req.body;


            if (!name?.trim()) {

                return res.badRequest({
                    success: false,
                    message: 'Department name is required.'
                });
            }


            const slug = await createUniqueSlug(
                Department,
                req.body.slug || name
            );


            const createdDepartment =
                await Department.create({

                    name:
                        name.trim(),

                    slug,

                    description:
                        nullableString(description),

                    image:
                        image || null,

                    sortOrder:
                        Number(sortOrder) || 0,

                    isActive:
                        typeof isActive === 'boolean'
                            ? isActive
                            : true

                }).fetch();


            const department =
                await getPopulatedDepartment(
                    createdDepartment.id
                );


            return res.json({
                success: true,
                message: 'Department created successfully.',
                department
            });

        } catch (error) {

            sails.log.error(
                'Error creating department:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to create department.'
            });
        }
    },


    async updateDepartment(req, res) {

        try {

            const departmentId =
                req.params.id;


            const existingDepartment =
                await Department.findOne({
                    id: departmentId
                });


            if (!existingDepartment) {

                return res.notFound({
                    success: false,
                    message: 'Department not found.'
                });
            }


            const {
                name,
                description,
                image,
                sortOrder,
                isActive
            } = req.body;


            if (!name?.trim()) {

                return res.badRequest({
                    success: false,
                    message: 'Department name is required.'
                });
            }


            const slug = await createUniqueSlug(
                Department,
                req.body.slug || name,
                departmentId
            );


            await Department.updateOne({
                id: departmentId
            }).set({

                name:
                    name.trim(),

                slug,

                description:
                    nullableString(description),

                image:
                    image || null,

                sortOrder:
                    Number(sortOrder) || 0,

                isActive:
                    typeof isActive === 'boolean'
                        ? isActive
                        : existingDepartment.isActive

            });


            const department =
                await getPopulatedDepartment(
                    departmentId
                );


            return res.json({
                success: true,
                message: 'Department updated successfully.',
                department
            });

        } catch (error) {

            sails.log.error(
                'Error updating department:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to update department.'
            });
        }
    },


    async deleteDepartment(req, res) {

        try {

            const departmentId =
                req.params.id;


            const existingDepartment =
                await Department.findOne({
                    id: departmentId
                });


            if (!existingDepartment) {

                return res.notFound({
                    success: false,
                    message: 'Department not found.'
                });
            }


            /*
             * Prevent deletion if there are members
             * assigned to this department.
             */
            const memberCount =
                await Member.count({
                    department: departmentId
                });


            if (memberCount > 0) {

                return res.badRequest({
                    success: false,
                    message:
                        `This department cannot be deleted because ` +
                        `${memberCount} member(s) are assigned to it.`
                });
            }


            await Department.destroyOne({
                id: departmentId
            });


            return res.json({
                success: true,
                message: 'Department deleted successfully.'
            });

        } catch (error) {

            sails.log.error(
                'Error deleting department:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to delete department.'
            });
        }
    },



    // =====================================================
    // MEDIA
    // =====================================================

    async getMedia(req, res) {

        try {

            const where = {};


            if (
                req.query.type &&
                ['image', 'pdf', 'document']
                    .includes(req.query.type)
            ) {
                where.type = req.query.type;
            }


            const media =
                await MediaAsset.find({
                    where
                })
                    .sort('createdAt DESC');


            return res.json({
                success: true,
                media
            });

        } catch (error) {

            sails.log.error(
                'Error loading media:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to load media.'
            });
        }
    },


    async uploadMedia(req, res) {

        try {

            /*
             * DEVELOPMENT / LOCAL STORAGE.
             *
             * For production I would later change only this part
             * to S3/object storage or persistent server storage.
             */
            const uploadDirectory =
                path.resolve(
                    sails.config.appPath,
                    'assets',
                    'uploads'
                );


            if (!fs.existsSync(uploadDirectory)) {

                fs.mkdirSync(
                    uploadDirectory,
                    {
                        recursive: true
                    }
                );
            }


            const uploadedFiles =
                await new Promise(
                    (resolve, reject) => {

                        req.file('file').upload(
                            {
                                dirname:
                                    uploadDirectory,

                                maxBytes:
                                    25 * 1024 * 1024
                            },

                            (error, files) => {

                                if (error) {
                                    return reject(error);
                                }

                                return resolve(files);
                            }
                        );
                    }
                );


            if (!uploadedFiles?.length) {

                return res.badRequest({
                    success: false,
                    message: 'No file was uploaded.'
                });
            }


            const uploadedFile =
                uploadedFiles[0];


            const allowedImageTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif'
            ];


            const allowedPdfTypes = [
                'application/pdf'
            ];


            const allowedDocumentTypes = [
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];


            let mediaType = null;


            if (
                allowedImageTypes.includes(
                    uploadedFile.type
                )
            ) {

                mediaType = 'image';

            } else if (
                allowedPdfTypes.includes(
                    uploadedFile.type
                )
            ) {

                mediaType = 'pdf';

            } else if (
                allowedDocumentTypes.includes(
                    uploadedFile.type
                )
            ) {

                mediaType = 'document';
            }


            /*
             * Reject unsupported files.
             */
            if (!mediaType) {

                if (
                    uploadedFile.fd &&
                    fs.existsSync(uploadedFile.fd)
                ) {
                    fs.unlinkSync(uploadedFile.fd);
                }


                return res.badRequest({
                    success: false,
                    message:
                        'Unsupported file type.'
                });
            }


            const storedFileName =
                path.basename(
                    uploadedFile.fd
                );


            const media =
                await MediaAsset.create({

                    type:
                        mediaType,

                    originalName:
                        uploadedFile.filename,

                    fileName:
                        storedFileName,

                    url:
                        `/uploads/${storedFileName}`,

                    mimeType:
                        uploadedFile.type,

                    size:
                        uploadedFile.size || 0,

                    altText:
                        nullableString(
                            req.body.altText
                        ),

                    caption:
                        nullableString(
                            req.body.caption
                        ),

                    uploadedBy:
                        req.session.adminUserId

                }).fetch();


            return res.json({
                success: true,
                message: 'File uploaded successfully.',
                media
            });

        } catch (error) {

            sails.log.error(
                'Media upload error:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to upload file.'
            });
        }
    },


    async deleteMedia(req, res) {

        try {

            const mediaId =
                req.params.id;


            const media =
                await MediaAsset.findOne({
                    id: mediaId
                });


            if (!media) {

                return res.notFound({
                    success: false,
                    message: 'Media file not found.'
                });
            }


            /*
             * Prevent deletion if the file is currently used.
             */
            const [
                memberPhotoCount,
                memberCvCount,
                postCount,
                departmentCount
            ] = await Promise.all([

                Member.count({
                    photo: mediaId
                }),

                Member.count({
                    cvPdf: mediaId
                }),

                Post.count({
                    featuredImage: mediaId
                }),

                Department.count({
                    image: mediaId
                })

            ]);


            const usageCount =
                memberPhotoCount +
                memberCvCount +
                postCount +
                departmentCount;


            if (usageCount > 0) {

                return res.badRequest({
                    success: false,
                    message:
                        'This file is currently being used and cannot be deleted.'
                });
            }


            /*
             * Delete local physical file.
             */
            if (
                media.url &&
                media.url.startsWith('/uploads/')
            ) {

                const fileName =
                    path.basename(media.url);


                const filePath =
                    path.resolve(
                        sails.config.appPath,
                        'assets',
                        'uploads',
                        fileName
                    );


                if (fs.existsSync(filePath)) {

                    fs.unlinkSync(filePath);
                }
            }


            await MediaAsset.destroyOne({
                id: mediaId
            });


            return res.json({
                success: true,
                message: 'Media deleted successfully.'
            });

        } catch (error) {

            sails.log.error(
                'Error deleting media:',
                error
            );

            return res.serverError({
                success: false,
                message: 'Failed to delete media.'
            });
        }
    }

};