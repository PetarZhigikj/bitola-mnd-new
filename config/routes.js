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

};
