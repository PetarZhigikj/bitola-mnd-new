const MEMBER_DEPARTMENTS = {

    'opstestveni-nauki':
        'Одделение за општествени науки',

    'pravni-nauki':
        'Одделение за правни науки',

    'prirodni-nauki':
        'Одделение за природни науки',

    'primeneti-nauki-i-medicina':
        'Одделение за применети науки и медицина',

    'tehnicki-nauki':
        'Одделение за технички науки',

    'umetnost':
        'Одделение за уметност',

    'lingvistika-i-literatura':
        'Одделение за лингвистика и литература',

    'istorisko-geografski-nauki':
        'Одделение за историско-географски науки'

};

const ABOUT_PAGES = {

    'osnovni-informacii':
        'Основни информации',

    'istorijat':
        'Историјат',

    'lica-za-kontakt':
        'Лица за контакт',

    'rakovodna-struktura':
        'Раководна структура'

};

async function renderContentListing(
    req,
    res,
    options
) {

    const items =
        await ContentItem.find({
            type:
                options.type
        })
        .sort(
            'createdAt DESC'
        );


    return res.view(
        'pages/content-list',
        {

            layout:
                'layouts/layout',

            pageTitle:
                options.title,

            metaDescription:
                options.title +
                ' - Македонско научно друштво Битола',

            currentPage:
                options.currentPage,

            pageHeading:
                options.title,

            basePath:
                options.basePath,

            items

        }
    );

}

async function renderContentDetail(
    req,
    res,
    options
) {

    const item =
        await ContentItem.findOne({

            id:
                req.params.id,

            type:
                options.type

        });


    if (!item) {

        return res.notFound(
            'Содржината не е пронајдена.'
        );

    }


    return res.view(
        'pages/content-detail',
        {

            layout:
                'layouts/layout',

            pageTitle:
                item.title,

            metaDescription:
                item.title +
                ' - Македонско научно друштво Битола',

            currentPage:
                options.currentPage,

            item,

            basePath:
                options.basePath,

            listingTitle:
                options.listingTitle

        }
    );

}



module.exports = {


    /* =============================================
       HOMEPAGE VIEW
    ============================================= */

    async home(req, res) {

        return res.view('pages/home', {
    
            layout: 'layouts/layout',
    
            pageTitle:
                'Македонско научно друштво - Битола',
    
            metaDescription:
                'Македонско научно друштво - Битола',
    
            currentPage:
                'home'
    
        });
    
    },

    /* =========================================================
   ALL MEMBERS
========================================================= */

    async membersPage(req, res) {

        try {

            const members =
                await Member.find({
                    isActive: true
                })
                .sort(
                    'name ASC'
                );


            return res.view(
                'pages/members',
                {

                    layout:
                        'layouts/layout',

                    pageTitle:
                        'Членови',

                    metaDescription:
                        'Членови на Македонското научно друштво - Битола',

                    currentPage:
                        'members',

                    members,

                    departmentSlug:
                        null,

                    departmentName:
                        null,

                    pageHeading:
                        'Членови'

                }
            );


        } catch (error) {

            sails.log.error(
                'Members page error:',
                error
            );


            return res.serverError(
                'Unable to load members.'
            );

        }

    },
    /* =========================================================
   DEPARTMENT MEMBERS
========================================================= */

    async departmentMembersPage(req, res) {

        try {

            const departmentSlug =
                String(
                    req.params.slug || ''
                ).trim();


            const departmentName =
                MEMBER_DEPARTMENTS[
                    departmentSlug
                ];


            /* -------------------------------------------------
            VALIDATE DEPARTMENT
            -------------------------------------------------- */

            if (!departmentName) {

                return res.notFound(
                    'Одделението не е пронајдено.'
                );

            }


            /* -------------------------------------------------
            GET MEMBERS
            -------------------------------------------------- */

            const members =
                await Member.find({

                    department:
                        departmentSlug,

                    isActive:
                        true

                })
                .sort(
                    'name ASC'
                );


            return res.view(
                'pages/members',
                {

                    layout:
                        'layouts/layout',

                    pageTitle:
                        departmentName,

                    metaDescription:
                        departmentName +
                        ' - Македонско научно друштво Битола',

                    currentPage:
                        'department',

                    members,

                    departmentSlug,

                    departmentName,

                    pageHeading:
                        departmentName

                }
            );


        } catch (error) {

            sails.log.error(
                'Department members page error:',
                error
            );


            return res.serverError(
                'Unable to load department members.'
            );

        }

    },

    /* =========================================================
   MEMBER PAGE
========================================================= */

async memberPage(req, res) {

    try {

        const id =
            req.params.id;


        const member =
            await Member.findOne({

                id,

                isActive:
                    true

            });


        if (!member) {

            return res.notFound(
                'Членот не е пронајден.'
            );

        }


        const departmentName =
            MEMBER_DEPARTMENTS[
                member.department
            ] || '';


        return res.view(
            'pages/member',
            {

                layout:
                    'layouts/layout',

                pageTitle:
                    member.name,

                metaDescription:
                    member.name +
                    ' - Македонско научно друштво Битола',

                currentPage:
                    'member',

                member,

                departmentName

            }
        );


    } catch (error) {

        sails.log.error(
            'Member page error:',
            error
        );


        return res.serverError(
            'Unable to load member.'
        );

    }

},

/* =========================================================
   ЗА МНД
========================================================= */

async aboutPage(req, res) {

    try {

        const slug =
            String(
                req.params.slug || ''
            ).trim();


        const title =
            ABOUT_PAGES[
                slug
            ];


        if (!title) {

            return res.notFound(
                'Страницата не е пронајдена.'
            );

        }


        const aboutPage =
            await AboutPage.findOne({
                slug
            });


        return res.view(
            'pages/about',
            {

                layout:
                    'layouts/layout',

                pageTitle:
                    title,

                metaDescription:
                    title +
                    ' - Македонско научно друштво Битола',

                currentPage:
                    'about',

                aboutPage:
                    aboutPage || {

                        slug,

                        image:
                            null,

                        content:
                            ''

                    },

                aboutTitle:
                    title

            }
        );


    } catch (error) {

        sails.log.error(
            'About page error:',
            error
        );


        return res.serverError();

    }

},



async aboutRoot(req, res) {

    return res.redirect(
        '/za-mnd/osnovni-informacii'
    );

},

async publicationsPage(req, res) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                type:
                    'publikacija',

                title:
                    'Публикации',

                currentPage:
                    'publikacii',

                basePath:
                    '/publikacii'

            }
        );


    } catch (error) {

        sails.log.error(
            'Publications page error:',
            error
        );


        return res.serverError();

    }

},



async contemporaryDialoguesPage(
    req,
    res
) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                type:
                    'publikacija',

                title:
                    'Современи дијалози',

                currentPage:
                    'sovremeni-dijalozi',

                basePath:
                    '/sovremeni-dijalozi'

            }
        );


    } catch (error) {

        sails.log.error(
            'Contemporary Dialogues page error:',
            error
        );


        return res.serverError();

    }

},

async announcementsPage(req, res) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                type:
                    'oglas',

                title:
                    'Огласи',

                currentPage:
                    'oglasi',

                basePath:
                    '/oglasi'

            }
        );


    } catch (error) {

        sails.log.error(
            'Announcements page error:',
            error
        );


        return res.serverError();

    }

},

async publicationDetailPage(
    req,
    res
) {

    try {

        return await renderContentDetail(
            req,
            res,
            {

                type:
                    'publikacija',

                currentPage:
                    'publikacii',

                basePath:
                    '/publikacii',

                listingTitle:
                    'Публикации'

            }
        );


    } catch (error) {

        sails.log.error(
            'Publication detail error:',
            error
        );


        return res.serverError();

    }

},



async contemporaryDialoguesDetailPage(
    req,
    res
) {

    try {

        return await renderContentDetail(
            req,
            res,
            {

                type:
                    'publikacija',

                currentPage:
                    'sovremeni-dijalozi',

                basePath:
                    '/sovremeni-dijalozi',

                listingTitle:
                    'Современи дијалози'

            }
        );


    } catch (error) {

        return res.serverError();

    }

},



async announcementDetailPage(
    req,
    res
) {

    try {

        return await renderContentDetail(
            req,
            res,
            {

                type:
                    'oglas',

                currentPage:
                    'oglasi',

                basePath:
                    '/oglasi',

                listingTitle:
                    'Огласи'

            }
        );


    } catch (error) {

        return res.serverError();

    }

},



};