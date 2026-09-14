const path =
    require('path');

const fs =
    require('fs');


module.exports.http = {

    middleware: {

        order: [

            'cookieParser',

            'session',

            'bodyParser',

            'compress',

            'poweredBy',


            /* Editor images before router */

            'editorImages',


            'router',

            'www',

            'favicon'

        ],



        /* =====================================================
           PUBLIC RICH-TEXT EDITOR IMAGES
        ===================================================== */

        editorImages: function (
            req,
            res,
            next
        ) {

            /*
             * Ignore every request except:
             *
             * GET /editor-images/...
             */

            if (
                req.method !== 'GET' ||
                !req.path.startsWith(
                    '/editor-images/'
                )
            ) {

                return next();

            }


            let requestedFileName;


            try {

                requestedFileName =
                    decodeURIComponent(
                        req.path.substring(
                            '/editor-images/'.length
                        )
                    );

            } catch (error) {

                return res.status(400).end();

            }


            /*
             * Security:
             * no folders / ../ traversal.
             */

            const fileName =
                path.basename(
                    requestedFileName
                );


            if (
                !fileName ||
                fileName !== requestedFileName
            ) {

                return res.status(404).end();

            }


            const filePath =
                path.resolve(
                    __dirname,
                    '../uploads/editor',
                    fileName
                );


            console.log(
                'EDITOR IMAGE:',
                filePath
            );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                console.log(
                    'EDITOR IMAGE NOT FOUND'
                );


                return res.status(404).end();

            }


            return res.sendFile(
                filePath
            );

        }

    }

};