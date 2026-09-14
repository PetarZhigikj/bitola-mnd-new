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

'GET /admin/publikacii':
    'AdminController.publicationsPage',



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
   ПУБЛИКАЦИИ
========================================================= */

'GET /publikacii':
'MainController.publicationsPage',


'GET /publikacii/:id':
'MainController.publicationDetailPage',



/* =========================================================
СОВРЕМЕНИ ДИЈАЛОЗИ
SAME PUBLICATION DATA
========================================================= */

'GET /sovremeni-dijalozi':
'MainController.contemporaryDialoguesPage',


'GET /sovremeni-dijalozi/:id':
'MainController.contemporaryDialoguesDetailPage',



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


/* Display - PUBLIC */


};

