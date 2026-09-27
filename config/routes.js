/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // '/': { view: 'pages/homepage' },
  'GET /': 'MainController.home',

  /* =========================================================
   ADMIN
========================================================= */

'GET /admin/login':
'AdminController.loginPage',

'GET /admin':
'AdminController.dashboard',

'POST /admin/api/login':
'AdminController.login',

'POST /admin/api/logout':
'AdminController.logout',


/* =========================================================
   ADMIN - ЧЛЕНОВИ
========================================================= */

'GET /admin/clenovi':
    'AdminController.membersPage',


'GET /admin/api/clenovi':
    'AdminController.getMembers',


'POST /admin/api/clenovi':
    'AdminController.createMember',


'PUT /admin/api/clenovi/:id':
    'AdminController.updateMember',


'DELETE /admin/api/clenovi/:id':
    'AdminController.deleteMember',


    /* =========================================================
   MEMBERS
========================================================= */

'GET /clenovi':
'MainController.membersPage',


'GET /clenovi/:id':
'MainController.memberPage',



/* =========================================================
DEPARTMENTS
========================================================= */

'GET /oddelnija/:slug':
'MainController.departmentMembersPage',

/* =========================================================
   ADMIN - ЗА МНД
========================================================= */

'GET /admin/za-mnd':
    'AdminController.aboutPagesPage',


'GET /admin/api/za-mnd':
    'AdminController.getAboutPages',


'PUT /admin/api/za-mnd/:slug':
    'AdminController.updateAboutPage',

    /* =========================================================
   ЗА МНД
========================================================= */

'GET /za-mnd':
'MainController.aboutRoot',


'GET /za-mnd/:slug':
'MainController.aboutPage',

/* =========================================================
   ADMIN - ПУБЛИКАЦИИ
========================================================= */

/* =========================================================
   PUBLICATIONS LANDING
========================================================= */

'GET /publikacii':
    'MainController.publicationsPage',



/* =========================================================
   ПУБЛИКАЦИИ
========================================================= */

'GET /publikacii/publikacii':
    'MainController.publicationsListPage',


'GET /publikacii/publikacii/:id':
    'MainController.publicationDetailPage',



/* =========================================================
   СОВРЕМЕНИ ДИЈАЛОЗИ
========================================================= */

'GET /publikacii/sovremeni-dijalozi':
    'MainController.contemporaryDialoguesPage',


'GET /publikacii/sovremeni-dijalozi/:id':
    'MainController.contemporaryDialoguesDetailPage',



/* =========================================================
   ДРУГИ ПРИЛОЗИ
========================================================= */

'GET /publikacii/drugi-prilozi':
    'MainController.otherContributionsPage',


'GET /publikacii/drugi-prilozi/:id':
    'MainController.otherContributionDetailPage',


/* =========================================================
   ADMIN - ОГЛАСИ
========================================================= */

'GET /admin/oglasi':
    'AdminController.announcementsPage',



/* =========================================================
   ADMIN - SHARED CONTENT API
========================================================= */

'GET /admin/api/content/:type':
    'AdminController.getContentItems',


'POST /admin/api/content/:type':
    'AdminController.createContentItem',


'PUT /admin/api/content/:type/:id':
    'AdminController.updateContentItem',


'DELETE /admin/api/content/:type/:id':
    'AdminController.deleteContentItem',


/* =========================================================
ОГЛАСИ
========================================================= */

'GET /oglasi':
'MainController.announcementsPage',





'GET /oglasi/:id':
'MainController.announcementDetailPage',

/* Upload - ADMIN ONLY */

'POST /admin/api/editor-image':
    'AdminController.uploadEditorImage',




'GET /admin/publikacii':
    'AdminController.publicationsPage',


'GET /admin/sovremeni-dijalozi':
    'AdminController.contemporaryDialoguesAdminPage',


'GET /admin/drugi-prilozi':
    'AdminController.otherContributionsAdminPage',

    'GET /admin/api/publication-landing':
    'AdminController.getPublicationLanding',


'PUT /admin/api/publication-landing':
    'AdminController.updatePublicationLanding',

    /* =========================================================
   CONTACT
========================================================= */

'GET /kontakt':
'MainController.contactPage',


'POST /api/contact':
'MainController.sendContact',

/* =========================================================
   ADMIN - НОВОСТИ
========================================================= */

'GET /admin/novosti':
    'AdminController.newsPage',

    /* =========================================================
   НОВОСТИ
========================================================= */

'GET /novosti':
'MainController.newsPage',

'GET /novosti/nastani':
'MainController.eventsPage',


'GET /novosti/:id':
'MainController.newsDetailPage',

'GET /api/home-news':
    'MainController.getHomeNews',




    'GET /admin/centri':
    'AdminController.centersPage',

'GET /admin/nagradi':
    'AdminController.awardsPage',

    'GET /centri':
    'MainController.centersPage',

'GET /centri/:id':
    'MainController.centerDetailPage',

'GET /nagradi':
    'MainController.awardsPage',

'GET /nagradi/:id':
    'MainController.awardDetailPage',

    'GET /search':
    'MainController.searchPage',


    'GET /admin/administratori':
    'AdminController.adminUsersPage',

'GET /admin/api/administratori':
    'AdminController.getAdminUsers',

'POST /admin/api/administratori':
    'AdminController.createAdminUser',

'PUT /admin/api/administratori/:id':
    'AdminController.updateAdminUser',

'DELETE /admin/api/administratori/:id':
    'AdminController.deleteAdminUser',

};

