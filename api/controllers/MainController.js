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

};