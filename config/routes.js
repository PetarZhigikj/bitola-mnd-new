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

  'GET /admin/login':
    'AdminController.loginPage',

'GET /admin':
    'AdminController.dashboard',

'GET /admin/posts':
    'AdminController.postsPage',

'GET /admin/members':
    'AdminController.membersPage',

'GET /admin/departments':
    'AdminController.departmentsPage',

'GET /admin/centers':
    'AdminController.centersPage',

'GET /admin/publications':
    'AdminController.publicationsPage',

'GET /admin/journal':
    'AdminController.journalPage',

'GET /admin/pages':
    'AdminController.pagesPage',

'GET /admin/media':
    'AdminController.mediaPage',

'GET /admin/redirects':
    'AdminController.redirectsPage',

'GET /admin/settings':
    'AdminController.settingsPage',

    // AUTH

'POST /admin/api/login':
'AdminController.login',

'POST /admin/api/logout':
'AdminController.logout',


// MEMBERS

'GET /admin/api/members':
'AdminController.getMembers',

'POST /admin/api/members':
'AdminController.createMember',

'PUT /admin/api/members/:id':
'AdminController.updateMember',

'DELETE /admin/api/members/:id':
'AdminController.deleteMember',


// POSTS

'GET /admin/api/posts':
'AdminController.getPosts',

'POST /admin/api/posts':
'AdminController.createPost',

'PUT /admin/api/posts/:id':
'AdminController.updatePost',

'DELETE /admin/api/posts/:id':
'AdminController.deletePost',


// DEPARTMENTS

'GET /admin/api/departments':
'AdminController.getDepartments',

'POST /admin/api/departments':
'AdminController.createDepartment',

'PUT /admin/api/departments/:id':
'AdminController.updateDepartment',

'DELETE /admin/api/departments/:id':
'AdminController.deleteDepartment',


// MEDIA

'GET /admin/api/media':
'AdminController.getMedia',

'POST /admin/api/media/upload':
'AdminController.uploadMedia',

'DELETE /admin/api/media/:id':
'AdminController.deleteMedia',



// =====================================================
// CENTERS
// =====================================================

'GET /admin/api/centers':
    'AdminController.getCenters',

'POST /admin/api/centers':
    'AdminController.createCenter',

'PUT /admin/api/centers/:id':
    'AdminController.updateCenter',

'DELETE /admin/api/centers/:id':
    'AdminController.deleteCenter',


// =====================================================
// PUBLICATIONS
// =====================================================

'GET /admin/api/publications':
    'AdminController.getPublications',

'POST /admin/api/publications':
    'AdminController.createPublication',

'PUT /admin/api/publications/:id':
    'AdminController.updatePublication',

'DELETE /admin/api/publications/:id':
    'AdminController.deletePublication',


// =====================================================
// JOURNAL
// =====================================================

'GET /admin/api/journal':
    'AdminController.getJournalIssues',

'POST /admin/api/journal':
    'AdminController.createJournalIssue',

'PUT /admin/api/journal/:id':
    'AdminController.updateJournalIssue',

'DELETE /admin/api/journal/:id':
    'AdminController.deleteJournalIssue',


// =====================================================
// PAGES
// =====================================================

'GET /admin/api/pages':
    'AdminController.getPages',

'POST /admin/api/pages':
    'AdminController.createPage',

'PUT /admin/api/pages/:id':
    'AdminController.updatePage',

'DELETE /admin/api/pages/:id':
    'AdminController.deletePage',


// =====================================================
// REDIRECTS
// =====================================================

'GET /admin/api/redirects':
    'AdminController.getRedirects',

'POST /admin/api/redirects':
    'AdminController.createRedirect',

'PUT /admin/api/redirects/:id':
    'AdminController.updateRedirect',

'DELETE /admin/api/redirects/:id':
    'AdminController.deleteRedirect',


// =====================================================
// SETTINGS
// =====================================================

'GET /admin/api/settings':
    'AdminController.getSettings',

'PUT /admin/api/settings':
    'AdminController.updateSettings',

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
