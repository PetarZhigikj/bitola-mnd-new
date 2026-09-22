const path =
    require('path');

const fs =
    require('fs');

    const nodemailer =
    require('nodemailer');

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

    let whereCondition;


    if (
        options.types &&
        Array.isArray(
            options.types
        )
    ) {

        whereCondition = {

            type: {
                in:
                    options.types
            }

        };

    } else {

        whereCondition = {

            type:
                options.type

        };

    }


    let items =
        await ContentItem.find(
            whereCondition
        )
        .sort(
            'createdAt DESC'
        );



    /* =========================================================
       DETAIL URL
    ========================================================= */

    items =
        items.map(
            item => {

                let detailBasePath =
                    options.basePath;


                if (
                    item.type ===
                    'sovremeni-dijalozi'
                ) {

                    detailBasePath =
                        '/publikacii/sovremeni-dijalozi';

                }


                return {

                    ...item,

                    detailUrl:
                        detailBasePath +
                        '/' +
                        item.id

                };

            }
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


    const sidebar =
        await getDetailSidebarData(
            req
        );


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
                options.listingTitle,

            sidebarNews:
                sidebar.sidebarNews,

            sidebarCalendar:
                sidebar.sidebarCalendar

        }
    );

}

async function getDetailSidebarData(req) {

    /* =====================================================
       LATEST NEWS
    ====================================================== */

    const sidebarNews =
        await ContentItem.find({
            type:
                'novost'
        })
        .sort(
            'createdAt DESC'
        )
        .limit(5);



    /* =====================================================
       CALENDAR MONTH / YEAR
    ====================================================== */

    const now =
        new Date();


    let month =
        parseInt(
            req.query.calendarMonth,
            10
        );


    let year =
        parseInt(
            req.query.calendarYear,
            10
        );


    if (
        !month ||
        month < 1 ||
        month > 12
    ) {

        month =
            now.getMonth() + 1;

    }


    if (
        !year ||
        year < 2000 ||
        year > 2100
    ) {

        year =
            now.getFullYear();

    }



    /* =====================================================
       NEWS IN THIS MONTH
    ====================================================== */

    const monthStart =
        new Date(
            year,
            month - 1,
            1
        );


    const monthEnd =
        new Date(
            year,
            month,
            1
        );


    const monthNews =
        await ContentItem.find({

            type:
                'novost',

            createdAt: {

                '>=':
                    monthStart.getTime(),

                '<':
                    monthEnd.getTime()

            }

        });



    /* =====================================================
       DAYS WHICH HAVE NEWS
    ====================================================== */

    const newsDays =
        new Set();


    monthNews.forEach(
        item => {

            const date =
                new Date(
                    item.createdAt
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                newsDays.add(
                    date.getDate()
                );

            }

        }
    );



    /* =====================================================
       CALENDAR CELLS
    ====================================================== */

    const daysInMonth =
        new Date(
            year,
            month,
            0
        )
        .getDate();


    const firstDay =
        new Date(
            year,
            month - 1,
            1
        )
        .getDay();


    /*
     * JS:
     * Sunday = 0
     *
     * We want:
     * Monday = first column
     */

    const leadingEmptyDays =
        (
            firstDay + 6
        ) % 7;


    const calendarDays =
        [];


    for (
        let i = 0;
        i < leadingEmptyDays;
        i++
    ) {

        calendarDays.push(
            null
        );

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        calendarDays.push({

            day,

            hasNews:
                newsDays.has(day),

            isToday:
                day === now.getDate() &&
                month ===
                    now.getMonth() + 1 &&
                year ===
                    now.getFullYear()

        });

    }



    /* =====================================================
       MONTH TITLE
    ====================================================== */

    const monthNames = [

        'Јануари',
        'Февруари',
        'Март',
        'Април',
        'Мај',
        'Јуни',
        'Јули',
        'Август',
        'Септември',
        'Октомври',
        'Ноември',
        'Декември'

    ];



    /* =====================================================
       PREVIOUS MONTH
    ====================================================== */

    let previousMonth =
        month - 1;

    let previousYear =
        year;


    if (
        previousMonth < 1
    ) {

        previousMonth =
            12;

        previousYear--;

    }



    /* =====================================================
       NEXT MONTH
    ====================================================== */

    let nextMonth =
        month + 1;

    let nextYear =
        year;


    if (
        nextMonth > 12
    ) {

        nextMonth =
            1;

        nextYear++;

    }



    const currentPath =
        req.path ||
        req.url.split('?')[0];


    const sidebarCalendar = {

        month,

        year,

        title:
            monthNames[
                month - 1
            ] +
            ' ' +
            year,

        days:
            calendarDays,

        previousUrl:
            currentPath +
            '?calendarMonth=' +
            previousMonth +
            '&calendarYear=' +
            previousYear,

        nextUrl:
            currentPath +
            '?calendarMonth=' +
            nextMonth +
            '&calendarYear=' +
            nextYear

    };


    return {

        sidebarNews,

        sidebarCalendar

    };

}

function stripHtml(value) {

    return String(
        value || ''
    )
    .replace(
        /<[^>]*>/g,
        ' '
    )
    .replace(
        /\s+/g,
        ' '
    )
    .trim();

}


function createSearchExcerpt(
    value,
    maxLength = 180
) {

    const text =
        stripHtml(
            value
        );


    if (
        text.length <=
        maxLength
    ) {

        return text;

    }


    return (
        text
            .substring(
                0,
                maxLength
            )
            .trim() +
        '…'
    );

}


module.exports = {


    /* =============================================
       HOMEPAGE VIEW
    ============================================= */

    async home(req, res) {

        try {
    
            const news =
                await ContentItem.find({
                    type:
                        'novost'
                })
                .sort(
                    'createdAt DESC'
                )
                .limit(4);
    
    
            return res.view(
                'pages/home',
                {
    
                    layout:
                        'layouts/layout',
    
                    pageTitle:
                        'Македонско научно друштво - Битола',
    
                    metaDescription:
                        'Македонско научно друштво - Битола',
    
                    currentPage:
                        'home',
    
                    news:
                        news
    
                }
            );
    
    
        } catch (error) {
    
            sails.log.error(
                'Homepage error:',
                error
            );
    
    
            return res.serverError();
    
        }
    
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

            const sidebar =
    await getDetailSidebarData(
        req
    );


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

                departmentName,

                sidebarNews:
                sidebar.sidebarNews,

                 sidebarCalendar:
                sidebar.sidebarCalendar

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

async publicationsPage(
    req,
    res
) {

    try {

        const landing =
            await PublicationLanding.findOne({
                key:
                    'main'
            });


        return res.view(
            'pages/publications-home',
            {

                layout:
                    'layouts/layout',

                pageTitle:
                    'Публикации',

                metaDescription:
                    'Публикации - Македонско научно друштво Битола',

                currentPage:
                    'publikacii',

                landing:
                    landing || {}

            }
        );


    } catch (error) {

        sails.log.error(
            'Publications landing error:',
            error
        );


        return res.serverError();

    }

},

async publicationsListPage(
    req,
    res
) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                types: [
                    'publikacija',
                    'sovremeni-dijalozi'
                ],

                title:
                    'Публикации',

                currentPage:
                    'publikacii',

                basePath:
                    '/publikacii/publikacii'

            }
        );


    } catch (error) {

        sails.log.error(
            'Publications list error:',
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
                    'sovremeni-dijalozi',

                title:
                    'Современи дијалози',

                currentPage:
                    'sovremeni-dijalozi',

                basePath:
                    '/publikacii/sovremeni-dijalozi'

            }
        );


    } catch (error) {

        return res.serverError();

    }

},

async otherContributionsPage(
    req,
    res
) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                type:
                    'drugi-prilozi',

                title:
                    'Други прилози',

                currentPage:
                    'drugi-prilozi',

                basePath:
                    '/publikacii/drugi-prilozi'

            }
        );


    } catch (error) {

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
                    '/publikacii/publikacii',

                listingTitle:
                    'Публикации'

            }
        );


    } catch (error) {

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
                    'sovremeni-dijalozi',

                currentPage:
                    'sovremeni-dijalozi',

                basePath:
                    '/publikacii/sovremeni-dijalozi',

                listingTitle:
                    'Современи дијалози'

            }
        );


    } catch (error) {

        return res.serverError();

    }

},

async otherContributionDetailPage(
    req,
    res
) {

    try {

        return await renderContentDetail(
            req,
            res,
            {

                type:
                    'drugi-prilozi',

                currentPage:
                    'drugi-prilozi',

                basePath:
                    '/publikacii/drugi-prilozi',

                listingTitle:
                    'Други прилози'

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

/* =========================================================
   RICH TEXT EDITOR IMAGE
========================================================= */

async editorImage(req, res) {

    try {

        const fileName =
            path.basename(
                String(
                    req.params.filename || ''
                )
            );


        if (!fileName) {
            return res.notFound();
        }


        const filePath =
            path.join(
                sails.config.appPath,
                'uploads',
                'editor',
                fileName
            );


        console.log(
            'EDITOR IMAGE REQUEST:',
            req.params.filename
        );

        console.log(
            'EDITOR IMAGE PATH:',
            filePath
        );

        console.log(
            'EDITOR IMAGE EXISTS:',
            fs.existsSync(filePath)
        );


        if (
            !fs.existsSync(
                filePath
            )
        ) {

            return res.notFound();

        }


        return res.sendFile(
            filePath
        );


    } catch (error) {

        sails.log.error(
            'Serve editor image error:',
            error
        );


        return res.serverError();

    }

},

async contactPage(req, res) {

    return res.view(
        'pages/contact',
        {

            layout:
                'layouts/layout',

            pageTitle:
                'Контакт',

            metaDescription:
                'Контакт - Македонско научно друштво Битола',

            currentPage:
                'kontakt'

        }
    );

},

async sendContact(req, res) {

    try {

        const name =
            String(
                req.body.name || ''
            )
            .trim();


        const subject =
            String(
                req.body.subject || ''
            )
            .trim();


        const contact =
            String(
                req.body.contact || ''
            )
            .trim();


        const message =
            String(
                req.body.message || ''
            )
            .trim();


        /*
         * Honeypot spam field.
         * Real users never fill this.
         */

        const website =
            String(
                req.body.website || ''
            )
            .trim();


        if (website) {

            return res.json({
                success: true
            });

        }


        if (
            !name ||
            !subject ||
            !contact ||
            !message
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Ве молиме пополнете ги сите полиња.'

            });

        }


        if (
            name.length > 150 ||
            subject.length > 200 ||
            contact.length > 200 ||
            message.length > 5000
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Внесените податоци се предолги.'

            });

        }


        const escapeHtml =
            value => {

                return String(value)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');

            };


        const transporter =
            nodemailer.createTransport({

                host:
                    process.env.SMTP_HOST,

                port:
                    Number(
                        process.env.SMTP_PORT ||
                        587
                    ),

                secure:
                    process.env.SMTP_SECURE ===
                    'true',

                auth: {

                    user:
                        process.env.SMTP_USER,

                    pass:
                        process.env.SMTP_PASS

                }

            });


        await transporter.sendMail({

            from:
                process.env.SMTP_USER,

            to:
                process.env.CONTACT_TO_EMAIL,

            replyTo:
                contact.includes('@')
                    ? contact
                    : undefined,

            subject:
                'МНД Битола - ' +
                subject,

            text:
                [
                    'Наслов: ' + subject,
                    '',
                    'Име и презиме: ' + name,
                    '',
                    'Контакт: ' + contact,
                    '',
                    'Порака:',
                    message
                ]
                .join('\n'),

            html:
                `
                    <h2>Нова порака од веб-страницата</h2>

                    <p>
                        <strong>Наслов:</strong><br>
                        ${escapeHtml(subject)}
                    </p>

                    <p>
                        <strong>Име и презиме:</strong><br>
                        ${escapeHtml(name)}
                    </p>

                    <p>
                        <strong>Контакт:</strong><br>
                        ${escapeHtml(contact)}
                    </p>

                    <p>
                        <strong>Порака:</strong><br>
                        ${escapeHtml(message)
                            .replace(/\n/g, '<br>')}
                    </p>
                `

        });


        return res.json({

            success: true,

            message:
                'Пораката е успешно испратена.'

        });


    } catch (error) {

        sails.log.error(
            'Contact email error:',
            error
        );


        return res.status(500).json({

            success: false,

            message:
                'Пораката не може да се испрати. Обидете се повторно.'

        });

    }

},

async newsPage(req, res) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                type:
                    'novost',

                title:
                    'Новости',

                currentPage:
                    'novosti',

                basePath:
                    '/novosti'

            }
        );


    } catch (error) {

        sails.log.error(
            'News page error:',
            error
        );


        return res.serverError();

    }

},

async newsDetailPage(req, res) {

    try {

        return await renderContentDetail(
            req,
            res,
            {

                type:
                    'novost',

                currentPage:
                    'novosti',

                basePath:
                    '/novosti',

                listingTitle:
                    'Новости'

            }
        );


    } catch (error) {

        sails.log.error(
            'News detail page error:',
            error
        );


        return res.serverError();

    }

},

async getHomeNews(req, res) {

    try {

        const news =
            await ContentItem.find({
                type:
                    'novost'
            })
            .sort(
                'createdAt DESC'
            )
            .limit(6);


        return res.json({

            success:
                true,

            news:
                news

        });


    } catch (error) {

        sails.log.error(
            'Home news error:',
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                'Не може да се вчитаат новостите.'

        });

    }

},

async centersPage(req, res) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                type:
                    'centar',

                title:
                    'Центри',

                currentPage:
                    'centri',

                basePath:
                    '/centri'

            }
        );


    } catch (error) {

        sails.log.error(
            'Centers page error:',
            error
        );


        return res.serverError();

    }

},

async centerDetailPage(req, res) {

    try {

        return await renderContentDetail(
            req,
            res,
            {

                type:
                    'centar',

                currentPage:
                    'centri',

                basePath:
                    '/centri',

                listingTitle:
                    'Центри'

            }
        );


    } catch (error) {

        sails.log.error(
            'Center detail error:',
            error
        );


        return res.serverError();

    }

},

async awardsPage(req, res) {

    try {

        return await renderContentListing(
            req,
            res,
            {

                type:
                    'nagrada',

                title:
                    'Награди',

                currentPage:
                    'nagradi',

                basePath:
                    '/nagradi'

            }
        );


    } catch (error) {

        sails.log.error(
            'Awards page error:',
            error
        );


        return res.serverError();

    }

},

async awardDetailPage(req, res) {

    try {

        return await renderContentDetail(
            req,
            res,
            {

                type:
                    'nagrada',

                currentPage:
                    'nagradi',

                basePath:
                    '/nagradi',

                listingTitle:
                    'Награди'

            }
        );


    } catch (error) {

        sails.log.error(
            'Award detail error:',
            error
        );


        return res.serverError();

    }

},

async searchPage(req, res) {

    try {

        const query =
            String(
                req.query.q || ''
            )
            .trim();


        const results =
            [];


        /*
         * If no search term was supplied,
         * just show the empty search page.
         */

        if (!query) {

            return res.view(
                'pages/search',
                {

                    layout:
                        'layouts/layout',

                    pageTitle:
                        'Пребарување',

                    metaDescription:
                        'Пребарување - Македонско научно друштво Битола',

                    currentPage:
                        'search',

                    query:
                        '',

                    results

                }
            );

        }



        const normalizedQuery =
            query.toLocaleLowerCase(
                'mk-MK'
            );



        /* =====================================================
           LOAD SEARCHABLE DATA
        ====================================================== */

        const [
            contentItems,
            members,
            aboutPages
        ] =
            await Promise.all([

                ContentItem.find()
                    .sort(
                        'createdAt DESC'
                    ),

                Member.find({
                    isActive:
                        true
                })
                .sort(
                    'name ASC'
                ),

                AboutPage.find()

            ]);



        /* =====================================================
           CONTENT ITEM TYPE CONFIG
        ====================================================== */

        const contentTypes = {

            'publikacija': {

                label:
                    'Публикација',

                basePath:
                    '/publikacii/publikacii'

            },


            'sovremeni-dijalozi': {

                label:
                    'Современи дијалози',

                basePath:
                    '/publikacii/sovremeni-dijalozi'

            },


            'drugi-prilozi': {

                label:
                    'Други прилози',

                basePath:
                    '/publikacii/drugi-prilozi'

            },


            'oglas': {

                label:
                    'Оглас',

                basePath:
                    '/oglasi'

            },


            'novost': {

                label:
                    'Новост',

                basePath:
                    '/novosti'

            },


            'centar': {

                label:
                    'Центар',

                basePath:
                    '/centri'

            },


            'nagrada': {

                label:
                    'Награда',

                basePath:
                    '/nagradi'

            }

        };



        /* =====================================================
           CONTENT ITEMS
        ====================================================== */

        contentItems.forEach(
            item => {

                const typeConfig =
                    contentTypes[
                        item.type
                    ];


                if (!typeConfig) {
                    return;
                }


                const plainContent =
                    stripHtml(
                        item.content
                    );


                const searchableText =
                    (
                        String(
                            item.title || ''
                        ) +
                        ' ' +
                        plainContent
                    )
                    .toLocaleLowerCase(
                        'mk-MK'
                    );


                if (
                    !searchableText.includes(
                        normalizedQuery
                    )
                ) {

                    return;

                }


                results.push({

                    type:
                        item.type,

                    typeLabel:
                        typeConfig.label,

                    title:
                        item.title,

                    image:
                        item.image || null,

                    excerpt:
                        createSearchExcerpt(
                            item.content
                        ),

                    url:
                        typeConfig.basePath +
                        '/' +
                        item.id,

                    createdAt:
                        item.createdAt

                });

            }
        );



        /* =====================================================
           MEMBERS
        ====================================================== */

        members.forEach(
            member => {

                const plainContent =
                    stripHtml(
                        member.content
                    );


                const departmentName =
                    MEMBER_DEPARTMENTS[
                        member.department
                    ] || '';


                const searchableText =
                    (
                        String(
                            member.name || ''
                        ) +
                        ' ' +
                        departmentName +
                        ' ' +
                        plainContent
                    )
                    .toLocaleLowerCase(
                        'mk-MK'
                    );


                if (
                    !searchableText.includes(
                        normalizedQuery
                    )
                ) {

                    return;

                }


                results.push({

                    type:
                        'member',

                    typeLabel:
                        'Член',

                    title:
                        member.name,

                    image:
                        member.image || null,

                    excerpt:
                        createSearchExcerpt(
                            member.content
                        ),

                    url:
                        '/clenovi/' +
                        member.id,

                    createdAt:
                        member.createdAt

                });

            }
        );



        /* =====================================================
           ABOUT PAGES
        ====================================================== */

        aboutPages.forEach(
            page => {

                const title =
                    ABOUT_PAGES[
                        page.slug
                    ];


                if (!title) {
                    return;
                }


                const plainContent =
                    stripHtml(
                        page.content
                    );


                const searchableText =
                    (
                        title +
                        ' ' +
                        plainContent
                    )
                    .toLocaleLowerCase(
                        'mk-MK'
                    );


                if (
                    !searchableText.includes(
                        normalizedQuery
                    )
                ) {

                    return;

                }


                results.push({

                    type:
                        'about',

                    typeLabel:
                        'За МНД',

                    title,

                    image:
                        page.image || null,

                    excerpt:
                        createSearchExcerpt(
                            page.content
                        ),

                    url:
                        '/za-mnd/' +
                        page.slug,

                    createdAt:
                        page.updatedAt ||
                        page.createdAt

                });

            }
        );



        /* =====================================================
           RENDER
        ====================================================== */

        return res.view(
            'pages/search',
            {

                layout:
                    'layouts/layout',

                pageTitle:
                    'Пребарување',

                metaDescription:
                    'Резултати од пребарување - Македонско научно друштво Битола',

                currentPage:
                    'search',

                query,

                results

            }
        );


    } catch (error) {

        sails.log.error(
            'Search page error:',
            error
        );


        return res.serverError();

    }

},



};