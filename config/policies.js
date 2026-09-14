module.exports.policies = {

  AdminController: {

      '*': 'isAdmin',

      loginPage: true,

      login: true,

      editorImage: true

  }

};