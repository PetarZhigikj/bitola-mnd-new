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


            /* =================================================
               EDITOR IMAGES
            ================================================= */

            if (
                req.path.startsWith(
                    '/editor-images/'
                )
            ) {

                const requestedFileName =
                    req.path.substring(
                        '/editor-images/'.length
                    );


                return sendUploadedFile(

                    res,

                    path.resolve(
                        __dirname,
                        '../uploads/editor'
                    ),

                    requestedFileName

                );

            }


            /* =================================================
               PUBLICATION LANDING IMAGES
            ================================================= */

            if (
                req.path.startsWith(
                    '/publication-images/'
                )
            ) {

                const requestedFileName =
                    req.path.substring(
                        '/publication-images/'.length
                    );


                return sendUploadedFile(

                    res,

                    path.resolve(
                        __dirname,
                        '../uploads/publication-landing'
                    ),

                    requestedFileName

                );

            }


            /* =================================================
               GENERAL CONTENT UPLOADS
               
               /uploads/novosti/...
               /uploads/publikacii/...
               /uploads/oglasi/...
               /uploads/sovremeni-dijalozi/...
               /uploads/drugi-prilozi/...
            ================================================= */

            if (
                req.path.startsWith(
                    '/uploads/'
                )
            ) {

                let relativePath;


                try {

                    relativePath =
                        decodeURIComponent(
                            req.path.substring(
                                '/uploads/'.length
                            )
                        );

                } catch (error) {

                    return res
                        .status(400)
                        .end();

                }


                const uploadsDirectory =
                    path.resolve(
                        __dirname,
                        '../assets/uploads'
                    );


                const filePath =
                    path.resolve(
                        uploadsDirectory,
                        relativePath
                    );


                /*
                 * Prevent:
                 *
                 * /uploads/../../something
                 */

                if (
                    !filePath.startsWith(
                        uploadsDirectory +
                        path.sep
                    )
                ) {

                    return res
                        .status(404)
                        .end();

                }


                console.log(
                    'PUBLIC UPLOAD:',
                    filePath
                );


                console.log(
                    'PUBLIC UPLOAD EXISTS:',
                    fs.existsSync(filePath)
                );


                if (
                    !fs.existsSync(
                        filePath
                    )
                ) {

                    return res
                        .status(404)
                        .end();

                }


                return res.sendFile(
                    filePath
                );

            }


            return next();

        }

    }

};



function sendUploadedFile(
    res,
    directory,
    requestedFileName
) {

    let decodedFileName;


    try {

        decodedFileName =
            decodeURIComponent(
                requestedFileName
            );

    } catch (error) {

        return res
            .status(400)
            .end();

    }


    const fileName =
        path.basename(
            decodedFileName
        );


    if (
        !fileName ||
        fileName !== decodedFileName
    ) {

        return res
            .status(404)
            .end();

    }


    const filePath =
        path.join(
            directory,
            fileName
        );


    if (
        !fs.existsSync(
            filePath
        )
    ) {

        return res
            .status(404)
            .end();

    }


    return res.sendFile(
        filePath
    );

}