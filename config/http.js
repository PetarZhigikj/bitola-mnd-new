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

            'uploadedFiles',

            'router',

            'www',

            'favicon'

        ],


        uploadedFiles: function (
            req,
            res,
            next
        ) {

            if (
                req.method !== 'GET'
            ) {

                return next();

            }


            let baseDirectory =
                null;

            let urlPrefix =
                null;


            /*
             * QUILL EDITOR IMAGES
             */

            if (
                req.path.startsWith(
                    '/editor-images/'
                )
            ) {

                urlPrefix =
                    '/editor-images/';

                baseDirectory =
                    path.resolve(
                        __dirname,
                        '../uploads/editor'
                    );

            }


            /*
             * PUBLICATION LANDING IMAGES
             */

            else if (
                req.path.startsWith(
                    '/publication-images/'
                )
            ) {

                urlPrefix =
                    '/publication-images/';

                baseDirectory =
                    path.resolve(
                        __dirname,
                        '../uploads/publication-landing'
                    );

            }


            /*
             * Not one of our uploaded files.
             */

            else {

                return next();

            }


            let requestedFileName;


            try {

                requestedFileName =
                    decodeURIComponent(
                        req.path.substring(
                            urlPrefix.length
                        )
                    );

            } catch (error) {

                return res.status(400).end();

            }


            const fileName =
                path.basename(
                    requestedFileName
                );


            /*
             * Prevent ../ path traversal.
             */

            if (
                !fileName ||
                fileName !== requestedFileName
            ) {

                return res.status(404).end();

            }


            const filePath =
                path.join(
                    baseDirectory,
                    fileName
                );


            console.log(
                'UPLOAD REQUEST:',
                req.path
            );


            console.log(
                'UPLOAD FILE:',
                filePath
            );


            console.log(
                'UPLOAD EXISTS:',
                fs.existsSync(
                    filePath
                )
            );


            if (
                !fs.existsSync(
                    filePath
                )
            ) {

                return res.status(404).end();

            }


            return res.sendFile(
                filePath
            );

        }

    }

};