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
    
    }

};