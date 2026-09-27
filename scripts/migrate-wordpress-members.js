'use strict';

/**
 * MND Bitola
 * One-time WordPress -> Sails/MongoDB MEMBER migration
 *
 * Old WordPress source:
 *   https://mnd-bitola.mk
 *
 * WordPress category:
 *   Био-Библиографии = category ID 29
 *
 * Usage:
 *
 *   Dry run:
 *   node scripts/migrate-wordpress-members.js --dry-run
 *
 *   Test first 5:
 *   node scripts/migrate-wordpress-members.js --limit=5
 *
 *   Import everything:
 *   node scripts/migrate-wordpress-members.js
 *
 *   Import one WordPress post:
 *   node scripts/migrate-wordpress-members.js --id=1234
 *
 *   Keep old remote image/file URLs:
 *   node scripts/migrate-wordpress-members.js --no-media
 *
 *   Ignore duplicate-name protection:
 *   node scripts/migrate-wordpress-members.js --force
 */


const fs =
    require('fs');

const path =
    require('path');

const crypto =
    require('crypto');

const sanitizeHtml =
    require('sanitize-html');


/* =========================================================
   APP ROOT
========================================================= */

const APP_ROOT =
    path.resolve(
        __dirname,
        '..'
    );

process.chdir(
    APP_ROOT
);


require('dotenv').config({
    path:
        path.join(
            APP_ROOT,
            '.env'
        )
});


/* =========================================================
   NODE VERSION
========================================================= */

if (
    typeof fetch !==
    'function'
) {

    console.error(
        'This script requires Node.js 18 or newer.'
    );

    process.exit(1);

}


/* =========================================================
   WORDPRESS
========================================================= */

const WORDPRESS_BASE_URL =
    'https://mnd-bitola.mk';

const WORDPRESS_POSTS_URL =
    `${WORDPRESS_BASE_URL}/wp-json/wp/v2/posts`;

const WORDPRESS_TAGS_URL =
    `${WORDPRESS_BASE_URL}/wp-json/wp/v2/tags`;


/*
 * Old WordPress category:
 *
 * 29 = Био-Библиографии
 */
const WP_MEMBER_CATEGORY_ID =
    29;


/* =========================================================
   COMMAND LINE OPTIONS
========================================================= */

const DRY_RUN =
    process.argv.includes(
        '--dry-run'
    );

const NO_MEDIA =
    process.argv.includes(
        '--no-media'
    );

const FORCE =
    process.argv.includes(
        '--force'
    );


const limitArgument =
    process.argv.find(
        argument =>
            argument.startsWith(
                '--limit='
            )
    );


const IMPORT_LIMIT =
    limitArgument
        ? Math.max(
            1,
            parseInt(
                limitArgument
                    .split('=')[1],
                10
            ) || 1
        )
        : null;


const idArgument =
    process.argv.find(
        argument =>
            argument.startsWith(
                '--id='
            )
    );


const IMPORT_ID =
    idArgument
        ? Number(
            idArgument
                .split('=')[1]
        )
        : null;


/* =========================================================
   MEMBER UPLOAD DIRECTORIES
========================================================= */

const MEMBER_IMAGE_DIRECTORY =
    path.join(
        APP_ROOT,
        'assets',
        'uploads',
        'members',
        'images'
    );


const MEMBER_FILE_DIRECTORY =
    path.join(
        APP_ROOT,
        'assets',
        'uploads',
        'members',
        'files'
    );


const MEMBER_IMAGE_PUBLIC_PATH =
    '/uploads/members/images';


const MEMBER_FILE_PUBLIC_PATH =
    '/uploads/members/files';


/* =========================================================
   SUPPORTED FILE TYPES
========================================================= */

const IMAGE_EXTENSIONS =
    new Set([
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.bmp',
        '.tif',
        '.tiff',
        '.avif'
    ]);


const DOCUMENT_EXTENSIONS =
    new Set([
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
        '.zip',
        '.rar',
        '.txt'
    ]);


/* =========================================================
   DEPARTMENT SLUGS
========================================================= */

const DEPARTMENTS = {

    SOCIAL:
        'opstestveni-nauki',

    LAW:
        'pravni-nauki',

    NATURAL:
        'prirodni-nauki',

    APPLIED:
        'primeneti-nauki-i-medicina',

    TECHNICAL:
        'tehnicki-nauki',

    ART:
        'umetnost',

    LINGUISTICS:
        'lingvistika-i-literatura',

    HISTORY:
        'istorisko-geografski-nauki'

};


/* =========================================================
   BASIC HELPERS
========================================================= */

function sleep(
    milliseconds
) {

    return new Promise(
        resolve => {
            setTimeout(
                resolve,
                milliseconds
            );
        }
    );

}


function ensureDirectories() {

    fs.mkdirSync(
        MEMBER_IMAGE_DIRECTORY,
        {
            recursive: true
        }
    );

    fs.mkdirSync(
        MEMBER_FILE_DIRECTORY,
        {
            recursive: true
        }
    );

}


function decodeHtmlText(
    value
) {

    return sanitizeHtml(
        String(
            value || ''
        ),
        {
            allowedTags: [],
            allowedAttributes: {}
        }
    )
        .replace(
            /\s+/g,
            ' '
        )
        .trim();

}


function safeDecodeURIComponent(
    value
) {

    try {

        return decodeURIComponent(
            value
        );

    } catch (error) {

        return value;

    }

}


function sanitizeFileName(
    fileName
) {

    const decoded =
        safeDecodeURIComponent(
            String(
                fileName ||
                'file'
            )
        );

    return decoded
        .normalize(
            'NFKD'
        )
        .replace(
            /[\\/:*?"<>|]/g,
            '-'
        )
        .replace(
            /\s+/g,
            '-'
        )
        .replace(
            /-+/g,
            '-'
        )
        .replace(
            /^[-.]+|[-.]+$/g,
            ''
        )
        .slice(
            0,
            140
        ) ||
        'file';

}


/* =========================================================
   URL HELPERS
========================================================= */

function normalizeRemoteUrl(
    rawUrl
) {

    if (!rawUrl) {
        return '';
    }


    let value =
        String(
            rawUrl
        )
            .trim()
            .replace(
                /&amp;/gi,
                '&'
            )
            .replace(
                /\\+/g,
                '/'
            );


    /*
     * //example.com/file.jpg
     */
    if (
        value.startsWith(
            '//'
        )
    ) {

        return (
            'https:' +
            value
        );

    }


    /*
     * /wp-content/...
     * /files/...
     */
    if (
        value.startsWith(
            '/'
        )
    ) {

        return (
            WORDPRESS_BASE_URL +
            value
        );

    }


    /*
     * Already valid HTTP URL.
     */
    if (
        /^https?:\/\//i.test(
            value
        )
    ) {

        try {

            const parsed =
                new URL(
                    value
                );


            /*
             * Previous WordPress content sometimes contained
             * malformed URLs such as:
             *
             * https://files/novosti/test.pdf
             *
             * They were really relative paths on mnd-bitola.mk.
             */
            if (
                parsed.hostname ===
                'files'
            ) {

                return (
                    WORDPRESS_BASE_URL +
                    parsed.pathname +
                    parsed.search
                );

            }


            return value;

        } catch (error) {

            return value;

        }

    }


    /*
     * Relative URL without leading slash.
     */
    try {

        return new URL(
            value,
            WORDPRESS_BASE_URL
        ).href;

    } catch (error) {

        return value;

    }

}


/* =========================================================
   HTML ATTRIBUTE HELPERS
========================================================= */

function getAttribute(
    tag,
    attributeName
) {

    const doubleQuoted =
        new RegExp(
            `${attributeName}\\s*=\\s*"([^"]*)"`,
            'i'
        );


    const singleQuoted =
        new RegExp(
            `${attributeName}\\s*=\\s*'([^']*)'`,
            'i'
        );


    const unquoted =
        new RegExp(
            `${attributeName}\\s*=\\s*([^\\s>]+)`,
            'i'
        );


    let match =
        String(
            tag || ''
        ).match(
            doubleQuoted
        );


    if (match) {
        return match[1];
    }


    match =
        String(
            tag || ''
        ).match(
            singleQuoted
        );


    if (match) {
        return match[1];
    }


    match =
        String(
            tag || ''
        ).match(
            unquoted
        );


    return match
        ? match[1]
        : '';

}


function replaceAttribute(
    tag,
    attributeName,
    newValue
) {

    const expression =
        new RegExp(
            `${attributeName}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,
            'i'
        );


    if (
        expression.test(
            tag
        )
    ) {

        return tag.replace(
            expression,
            `${attributeName}="${newValue}"`
        );

    }


    return tag.replace(
        />$/,
        ` ${attributeName}="${newValue}">`
    );

}


function removeAttribute(
    tag,
    attributeName
) {

    const expression =
        new RegExp(
            `\\s+${attributeName}\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+)`,
            'ig'
        );

    return tag.replace(
        expression,
        ''
    );

}


/* =========================================================
   FILE EXTENSIONS
========================================================= */

function getUrlExtension(
    url
) {

    try {

        const parsed =
            new URL(
                normalizeRemoteUrl(
                    url
                )
            );

        return path
            .extname(
                parsed.pathname
            )
            .toLowerCase();

    } catch (error) {

        return '';

    }

}


function extensionFromMimeType(
    mimeType
) {

    const map = {

        'image/jpeg':
            '.jpg',

        'image/png':
            '.png',

        'image/gif':
            '.gif',

        'image/webp':
            '.webp',

        'image/bmp':
            '.bmp',

        'image/tiff':
            '.tif',

        'application/pdf':
            '.pdf',

        'application/msword':
            '.doc',

        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            '.docx',

        'application/vnd.ms-excel':
            '.xls',

        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            '.xlsx',

        'application/vnd.ms-powerpoint':
            '.ppt',

        'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            '.pptx',

        'application/zip':
            '.zip',

        'text/plain':
            '.txt'

    };


    return (
        map[
            String(
                mimeType || ''
            )
                .toLowerCase()
        ] ||
        ''
    );

}


function getRemoteFileName(
    mediaUrl,
    mimeType = ''
) {

    let baseName =
        'file';


    try {

        const parsed =
            new URL(
                mediaUrl
            );

        baseName =
            path.basename(
                parsed.pathname
            ) ||
            'file';

    } catch (error) {

        // Fallback.
    }


    baseName =
        sanitizeFileName(
            baseName
        );


    if (
        !path.extname(
            baseName
        )
    ) {

        baseName +=
            extensionFromMimeType(
                mimeType
            );

    }


    return baseName;

}


/* =========================================================
   SRCSET
========================================================= */

function chooseLargestSrcsetUrl(
    srcset,
    fallbackUrl
) {

    if (!srcset) {
        return fallbackUrl;
    }


    const candidates =
        String(
            srcset
        )
            .split(',')
            .map(
                entry => {

                    const parts =
                        entry
                            .trim()
                            .split(
                                /\s+/
                            );


                    const url =
                        parts[0] ||
                        '';


                    const widthMatch =
                        String(
                            parts[1] ||
                            ''
                        )
                            .match(
                                /^(\d+)w$/
                            );


                    return {
                        url,
                        width:
                            widthMatch
                                ? Number(
                                    widthMatch[1]
                                )
                                : 0
                    };

                }
            )
            .filter(
                candidate =>
                    candidate.url
            );


    if (
        !candidates.length
    ) {
        return fallbackUrl;
    }


    candidates.sort(
        (
            first,
            second
        ) =>
            second.width -
            first.width
    );


    return (
        candidates[0].url ||
        fallbackUrl
    );

}


/* =========================================================
   WORDPRESS TAG FETCHING
========================================================= */

async function fetchAllWordPressTags() {

    const allTags = [];

    let page = 1;

    let totalPages = 1;


    do {

        console.log(
            `Loading WordPress tags page ${page}...`
        );


        const parameters =
            new URLSearchParams({
                per_page:
                    '100',

                page:
                    String(
                        page
                    ),

                hide_empty:
                    'false',

                _fields:
                    'id,name,slug'
            });


        const url =
            `${WORDPRESS_TAGS_URL}?${parameters.toString()}`;


        const response =
            await fetch(
                url,
                {
                    headers: {
                        Accept:
                            'application/json',

                        'User-Agent':
                            'MND-Bitola-Member-Migration/1.0'
                    }
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `WordPress tags returned HTTP ${response.status} on page ${page}.`
            );

        }


        const tags =
            await response.json();


        if (
            !Array.isArray(
                tags
            )
        ) {

            throw new Error(
                'Unexpected WordPress tags response.'
            );

        }


        allTags.push(
            ...tags
        );


        const headerPages =
            Number(
                response.headers.get(
                    'x-wp-totalpages'
                )
            );


        totalPages =
            Number.isFinite(
                headerPages
            ) &&
            headerPages > 0

                ? headerPages

                : (
                    tags.length ===
                    100

                        ? page + 1

                        : page
                );


        page += 1;


    } while (
        page <=
        totalPages
    );


    return allTags;

}


/* =========================================================
   WORDPRESS MEMBER POSTS
========================================================= */

async function fetchAllMemberPosts() {

    const allPosts = [];

    let page = 1;

    let totalPages = 1;


    do {

        console.log(
            `Loading WordPress member posts page ${page}...`
        );


        const parameters =
            new URLSearchParams({

                per_page:
                    '100',

                page:
                    String(
                        page
                    ),

                status:
                    'publish',

                categories:
                    String(
                        WP_MEMBER_CATEGORY_ID
                    ),

                _embed:
                    'wp:featuredmedia',

                _fields:
                    [
                        'id',
                        'date',
                        'modified',
                        'link',
                        'title',
                        'content',
                        'categories',
                        'tags',
                        'featured_media',
                        '_embedded'
                    ].join(',')

            });


        const url =
            `${WORDPRESS_POSTS_URL}?${parameters.toString()}`;


        const response =
            await fetch(
                url,
                {
                    headers: {
                        Accept:
                            'application/json',

                        'User-Agent':
                            'MND-Bitola-Member-Migration/1.0'
                    }
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `WordPress returned HTTP ${response.status} for member page ${page}.`
            );

        }


        const posts =
            await response.json();


        if (
            !Array.isArray(
                posts
            )
        ) {

            throw new Error(
                'Unexpected WordPress member response.'
            );

        }


        allPosts.push(
            ...posts
        );


        const pagesHeader =
            Number(
                response.headers.get(
                    'x-wp-totalpages'
                )
            );


        totalPages =
            Number.isFinite(
                pagesHeader
            ) &&
            pagesHeader > 0

                ? pagesHeader

                : (
                    posts.length ===
                    100

                        ? page + 1

                        : page
                );


        page += 1;


    } while (
        page <=
        totalPages
    );


    return allPosts;

}


/* =========================================================
   TAG MAP
========================================================= */

function buildTagMap(
    tags
) {

    const map =
        new Map();


    for (
        const tag of tags
    ) {

        map.set(
            Number(
                tag.id
            ),
            {
                id:
                    Number(
                        tag.id
                    ),

                name:
                    decodeHtmlText(
                        tag.name
                    ),

                slug:
                    String(
                        tag.slug ||
                        ''
                    )
                        .trim()
                        .toLowerCase()
            }
        );

    }


    return map;

}


/* =========================================================
   DEPARTMENT DETECTION
========================================================= */

function normalizeDepartmentText(
    value
) {

    return String(
        value || ''
    )
        .toLowerCase()

        /*
         * Remove accents where applicable.
         */
        .normalize(
            'NFKD'
        )

        /*
         * Standardise Macedonian characters/spacing.
         */
        .replace(
            /[-–—_]+/g,
            ' '
        )

        .replace(
            /\s+/g,
            ' '
        )

        .trim();

}


function departmentFromText(
    rawValue
) {

    const value =
        normalizeDepartmentText(
            rawValue
        );


    if (!value) {
        return null;
    }


    /* ---------------------------------------------------------
       OPШТЕСТВЕНИ НАУКИ
    --------------------------------------------------------- */

    if (
        value.includes(
            'општествени'
        ) ||
        value.includes(
            'opstestveni'
        ) ||
        value.includes(
            'opshtestveni'
        )
    ) {

        return DEPARTMENTS.SOCIAL;

    }


    /* ---------------------------------------------------------
       ПРАВНИ НАУКИ
    --------------------------------------------------------- */

    if (
        value.includes(
            'правни'
        ) ||
        value.includes(
            'pravni'
        )
    ) {

        return DEPARTMENTS.LAW;

    }


    /* ---------------------------------------------------------
       ПРИРОДНИ НАУКИ
    --------------------------------------------------------- */

    if (
        value.includes(
            'природни'
        ) ||
        value.includes(
            'prirodni'
        )
    ) {

        return DEPARTMENTS.NATURAL;

    }


    /* ---------------------------------------------------------
       ПРИМЕНЕТИ НАУКИ И МЕДИЦИНА
    --------------------------------------------------------- */

    if (
        (
            value.includes(
                'применети'
            ) &&
            value.includes(
                'медицин'
            )
        ) ||
        value.includes(
            'primeneti'
        ) ||
        value.includes(
            'medicina'
        )
    ) {

        return DEPARTMENTS.APPLIED;

    }


    /* ---------------------------------------------------------
       ТЕХНИЧКИ НАУКИ
    --------------------------------------------------------- */

    if (
        value.includes(
            'технички'
        ) ||
        value.includes(
            'tehnicki'
        ) ||
        value.includes(
            'tehnichki'
        )
    ) {

        return DEPARTMENTS.TECHNICAL;

    }


    /* ---------------------------------------------------------
       УМЕТНОСТ
    --------------------------------------------------------- */

    if (
        value.includes(
            'уметност'
        ) ||
        value.includes(
            'umetnost'
        )
    ) {

        return DEPARTMENTS.ART;

    }


    /* ---------------------------------------------------------
       ЛИНГВИСТИКА И ЛИТЕРАТУРА
    --------------------------------------------------------- */

    if (
        value.includes(
            'лингвист'
        ) ||
        value.includes(
            'литератур'
        ) ||
        value.includes(
            'lingvist'
        ) ||
        value.includes(
            'literatur'
        )
    ) {

        return DEPARTMENTS.LINGUISTICS;

    }


    /* ---------------------------------------------------------
       ИСТОРИСКО-ГЕОГРАФСКИ НАУКИ
    --------------------------------------------------------- */

    if (
        value.includes(
            'историско'
        ) ||
        value.includes(
            'географ'
        ) ||
        value.includes(
            'istorisko'
        ) ||
        value.includes(
            'geograf'
        )
    ) {

        return DEPARTMENTS.HISTORY;

    }


    return null;

}


function getPostTagObjects(
    post,
    tagMap
) {

    const ids =
        Array.isArray(
            post.tags
        )
            ? post.tags
            : [];


    return ids
        .map(
            id =>
                tagMap.get(
                    Number(
                        id
                    )
                )
        )
        .filter(
            Boolean
        );

}


function getMemberDepartment(
    post,
    tagMap
) {

    const tagObjects =
        getPostTagObjects(
            post,
            tagMap
        );


    /*
     * First try tag names.
     */
    for (
        const tag of
        tagObjects
    ) {

        const department =
            departmentFromText(
                tag.name
            );


        if (department) {
            return department;
        }

    }


    /*
     * Then try tag slugs.
     */
    for (
        const tag of
        tagObjects
    ) {

        const department =
            departmentFromText(
                tag.slug
            );


        if (department) {
            return department;
        }

    }


    /*
     * Last fallback:
     * sometimes department information may have been
     * included in the post title or content.
     *
     * We only use this for strong department-name matches.
     */
    const searchable =
        [
            post.title?.rendered ||
                '',

            post.content?.rendered ||
                ''
        ]
            .join(
                ' '
            );


    return departmentFromText(
        searchable
    );

}


/* =========================================================
   DEPARTMENT LABELS
========================================================= */

function getDepartmentLabel(
    slug
) {

    const labels = {

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

        umetnost:
            'Одделение за уметност',

        'lingvistika-i-literatura':
            'Одделение за лингвистика и литература',

        'istorisko-geografski-nauki':
            'Одделение за историско-географски науки'

    };


    return (
        labels[slug] ||
        slug ||
        'Непознато'
    );

}


/* =========================================================
   FEATURED IMAGE
========================================================= */

function getFeaturedImageUrl(
    post
) {

    const featuredMedia =
        post &&
        post._embedded &&
        post._embedded[
            'wp:featuredmedia'
        ];


    if (
        Array.isArray(
            featuredMedia
        ) &&
        featuredMedia[0] &&
        featuredMedia[0]
            .source_url
    ) {

        return normalizeRemoteUrl(
            featuredMedia[0]
                .source_url
        );

    }


    return '';

}


/* =========================================================
   FIRST RAW IMAGE
========================================================= */

function getFirstRawImageUrl(
    html
) {

    const firstImageMatch =
        String(
            html || ''
        )
            .match(
                /<img\b[^>]*>/i
            );


    if (
        !firstImageMatch
    ) {

        return '';

    }


    const tag =
        firstImageMatch[0];


    return normalizeRemoteUrl(
        chooseLargestSrcsetUrl(
            getAttribute(
                tag,
                'srcset'
            ),
            getAttribute(
                tag,
                'src'
            )
        )
    );

}


/* =========================================================
   DOWNLOAD CACHE
========================================================= */

const mediaCache =
    new Map();


/* =========================================================
   DOWNLOAD MEDIA
========================================================= */

async function downloadMedia(
    rawUrl,
    kind,
    postId
) {

    let mediaUrl =
        normalizeRemoteUrl(
            rawUrl
        );


    if (!mediaUrl) {
        return null;
    }


    const cacheKey =
        `${kind}:${mediaUrl}`;


    if (
        mediaCache.has(
            cacheKey
        )
    ) {

        return mediaCache.get(
            cacheKey
        );

    }


    const extension =
        getUrlExtension(
            mediaUrl
        );


    if (
        kind === 'images' &&
        extension &&
        !IMAGE_EXTENSIONS.has(
            extension
        )
    ) {

        return null;

    }


    if (
        kind === 'files' &&
        extension &&
        !DOCUMENT_EXTENSIONS.has(
            extension
        )
    ) {

        return null;

    }


    /*
     * --no-media:
     * keep the old URL instead of downloading.
     */
    if (NO_MEDIA) {

        const remoteFileName =
            getRemoteFileName(
                mediaUrl
            );


        const result = {

            publicUrl:
                mediaUrl,

            fileName:
                remoteFileName,

            mimeType:
                ''

        };


        mediaCache.set(
            cacheKey,
            result
        );


        return result;

    }


    try {

        const response =
            await fetch(
                mediaUrl,
                {
                    headers: {
                        'User-Agent':
                            'MND-Bitola-Member-Migration/1.0',

                        Accept:
                            '*/*'
                    },

                    redirect:
                        'follow'
                }
            );


        if (
            !response.ok
        ) {

            console.warn(
                `  Media download failed: ${mediaUrl}`
            );

            console.warn(
                `  HTTP ${response.status}`
            );


            /*
             * Keep original URL as fallback.
             */
            const fallback = {

                publicUrl:
                    mediaUrl,

                fileName:
                    getRemoteFileName(
                        mediaUrl
                    ),

                mimeType:
                    response.headers.get(
                        'content-type'
                    ) ||
                    ''

            };


            mediaCache.set(
                cacheKey,
                fallback
            );


            return fallback;

        }


        const mimeType =
            (
                response.headers.get(
                    'content-type'
                ) ||
                ''
            )
                .split(';')[0]
                .trim();


        const buffer =
            Buffer.from(
                await response
                    .arrayBuffer()
            );


        let originalFileName =
            getRemoteFileName(
                mediaUrl,
                mimeType
            );


        /*
         * If the URL doesn't contain an extension,
         * add one based on MIME type.
         */
        if (
            !path.extname(
                originalFileName
            )
        ) {

            originalFileName +=
                extensionFromMimeType(
                    mimeType
                );

        }


        const hash =
            crypto
                .createHash(
                    'sha1'
                )
                .update(
                    mediaUrl
                )
                .digest(
                    'hex'
                )
                .slice(
                    0,
                    10
                );


        const fileName =
            sanitizeFileName(
                `${postId}-${hash}-${originalFileName}`
            );


        const targetDirectory =
            kind === 'images'
                ? MEMBER_IMAGE_DIRECTORY
                : MEMBER_FILE_DIRECTORY;


        const publicDirectory =
            kind === 'images'
                ? MEMBER_IMAGE_PUBLIC_PATH
                : MEMBER_FILE_PUBLIC_PATH;


        const destination =
            path.join(
                targetDirectory,
                fileName
            );


        if (
            !fs.existsSync(
                destination
            )
        ) {

            fs.writeFileSync(
                destination,
                buffer
            );

        }


        const result = {

            publicUrl:
                `${publicDirectory}/${fileName}`,

            fileName,

            mimeType

        };


        mediaCache.set(
            cacheKey,
            result
        );


        return result;


    } catch (error) {

        console.warn(
            `  Media download failed: ${mediaUrl}`
        );

        console.warn(
            `  ${error.message}`
        );


        /*
         * Don't discard the member because of one broken
         * old image/document. Keep the remote URL.
         */
        const fallback = {

            publicUrl:
                mediaUrl,

            fileName:
                getRemoteFileName(
                    mediaUrl
                ),

            mimeType:
                ''

        };


        mediaCache.set(
            cacheKey,
            fallback
        );


        return fallback;

    }

}


/* =========================================================
   MIGRATE INLINE IMAGES + DOCUMENT LINKS
========================================================= */

async function migrateMemberContentMedia(
    rawHtml,
    postId
) {

    let html =
        String(
            rawHtml || ''
        );


    let firstImageUrl =
        null;


    let firstAttachment =
        null;


    /* ---------------------------------------------------------
       IMAGES
    --------------------------------------------------------- */

    const imageTags =
        [
            ...html.matchAll(
                /<img\b[^>]*>/gi
            )
        ]
            .map(
                match =>
                    match[0]
            );


    for (
        const originalTag of
        imageTags
    ) {

        const src =
            getAttribute(
                originalTag,
                'src'
            );


        const srcset =
            getAttribute(
                originalTag,
                'srcset'
            );


        let imageUrl =
            chooseLargestSrcsetUrl(
                srcset,
                src
            );


        imageUrl =
            normalizeRemoteUrl(
                imageUrl
            );


        if (!imageUrl) {
            continue;
        }


        const downloaded =
            await downloadMedia(
                imageUrl,
                'images',
                postId
            );


        if (!downloaded) {
            continue;
        }


        if (!firstImageUrl) {

            firstImageUrl =
                downloaded.publicUrl;

        }


        let newTag =
            replaceAttribute(
                originalTag,
                'src',
                downloaded.publicUrl
            );


        /*
         * Remove old responsive WordPress URLs because
         * they still point to the old site.
         */
        newTag =
            removeAttribute(
                newTag,
                'srcset'
            );


        newTag =
            removeAttribute(
                newTag,
                'sizes'
            );


        html =
            html.replace(
                originalTag,
                newTag
            );

    }


    /* ---------------------------------------------------------
       DOCUMENT LINKS
    --------------------------------------------------------- */

    const anchorTags =
        [
            ...html.matchAll(
                /<a\b[^>]*>/gi
            )
        ]
            .map(
                match =>
                    match[0]
            );


    for (
        const originalTag of
        anchorTags
    ) {

        const rawHref =
            getAttribute(
                originalTag,
                'href'
            );


        if (!rawHref) {
            continue;
        }


        const href =
            normalizeRemoteUrl(
                rawHref
            );


        const extension =
            getUrlExtension(
                href
            );


        if (
            !DOCUMENT_EXTENSIONS.has(
                extension
            )
        ) {

            continue;

        }


        const downloaded =
            await downloadMedia(
                href,
                'files',
                postId
            );


        if (!downloaded) {
            continue;
        }


        if (
            !firstAttachment
        ) {

            firstAttachment =
                downloaded;

        }


        const newTag =
            replaceAttribute(
                originalTag,
                'href',
                downloaded.publicUrl
            );


        html =
            html.replace(
                originalTag,
                newTag
            );

    }


    return {

        html,

        firstImageUrl,

        firstAttachment

    };

}


/* =========================================================
   SANITIZE MEMBER CONTENT
========================================================= */

function sanitizeMigratedHtml(
    html
) {

    let cleaned =
        sanitizeHtml(
            String(
                html || ''
            ),
            {

                allowedTags: [

                    'p',
                    'br',
                    'div',
                    'span',

                    'strong',
                    'b',
                    'em',
                    'i',
                    'u',
                    's',

                    'sub',
                    'sup',

                    'h1',
                    'h2',
                    'h3',
                    'h4',
                    'h5',
                    'h6',

                    'img',

                    'figure',
                    'figcaption',

                    'blockquote',

                    'ol',
                    'ul',
                    'li',

                    'a',

                    'hr',

                    'table',
                    'thead',
                    'tbody',
                    'tr',
                    'th',
                    'td'

                ],


                allowedAttributes: {

                    '*': [
                        'dir'
                    ],

                    a: [
                        'href',
                        'target',
                        'rel',
                        'title'
                    ],

                    img: [
                        'src',
                        'alt',
                        'title',
                        'width',
                        'height'
                    ],

                    th: [
                        'colspan',
                        'rowspan'
                    ],

                    td: [
                        'colspan',
                        'rowspan'
                    ]

                },


                allowedSchemes: [
                    'http',
                    'https',
                    'mailto'
                ],


                allowProtocolRelative:
                    false

            }
        );


    cleaned =
        cleaned
            .replace(
                /&nbsp;/gi,
                ' '
            )
            .replace(
                /<(div|p)>\s*<\/(div|p)>/gi,
                ''
            )
            .replace(
                /\n{3,}/g,
                '\n\n'
            )
            .trim();


    return cleaned;

}


/* =========================================================
   MODEL TIMESTAMP HELPER
========================================================= */

function getTimestampForModel(
    model,
    attributeName,
    dateValue
) {

    if (!dateValue) {
        return undefined;
    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return undefined;

    }


    const attribute =
        model.attributes &&
        model.attributes[
            attributeName
        ];


    if (!attribute) {
        return undefined;
    }


    /*
     * Handle projects where timestamp attributes
     * are explicitly configured as strings.
     */
    if (
        attribute.type ===
        'string'
    ) {

        return date.toISOString();

    }


    return date.getTime();

}


/* =========================================================
   DRY RUN SUMMARY
========================================================= */

function printDryRunSummary(
    posts,
    tagMap
) {

    const counts = {

        'opstestveni-nauki':
            0,

        'pravni-nauki':
            0,

        'prirodni-nauki':
            0,

        'primeneti-nauki-i-medicina':
            0,

        'tehnicki-nauki':
            0,

        umetnost:
            0,

        'lingvistika-i-literatura':
            0,

        'istorisko-geografski-nauki':
            0

    };


    const missingDepartment =
        [];


    for (
        const post of posts
    ) {

        const department =
            getMemberDepartment(
                post,
                tagMap
            );


        if (
            department &&
            Object.prototype
                .hasOwnProperty.call(
                    counts,
                    department
                )
        ) {

            counts[
                department
            ] += 1;

        } else {

            missingDepartment.push({
                id:
                    post.id,

                title:
                    decodeHtmlText(
                        post.title
                            ?.rendered
                    ),

                tags:
                    getPostTagObjects(
                        post,
                        tagMap
                    )
                        .map(
                            tag =>
                                tag.name
                        )
            });

        }

    }


    console.log(
        '\nDRY RUN - nothing was written to MongoDB.'
    );

    console.log(
        '========================================================'
    );

    console.log(
        `Total WordPress member posts: ${posts.length}`
    );

    console.log(
        '--------------------------------------------------------'
    );


    for (
        const [
            department,
            count
        ]
        of Object.entries(
            counts
        )
    ) {

        console.log(
            `${getDepartmentLabel(department)}: ${count}`
        );

    }


    console.log(
        '--------------------------------------------------------'
    );

    console.log(
        `Without recognised department: ${missingDepartment.length}`
    );


    if (
        missingDepartment.length
    ) {

        console.log(
            '\nPOSTS WITHOUT A RECOGNISED DEPARTMENT'
        );

        console.log(
            '--------------------------------------------------------'
        );


        for (
            const item of
            missingDepartment
        ) {

            console.log(
                `#${item.id}: ${item.title}`
            );


            if (
                item.tags.length
            ) {

                console.log(
                    `  Tags: ${item.tags.join(', ')}`
                );

            } else {

                console.log(
                    '  Tags: none'
                );

            }

        }

    }


    console.log(
        '========================================================'
    );

}


/* =========================================================
   LOAD SAILS
========================================================= */

async function loadSailsApp() {

    const Sails =
        require('sails')
            .Sails;


    const sails =
        new Sails();


    await new Promise(
        (
            resolve,
            reject
        ) => {

            sails.load(
                {

                    appPath:
                        APP_ROOT,

                    hooks: {
                        grunt:
                            false
                    },

                    log: {
                        level:
                            'warn'
                    }

                },

                error => {

                    if (error) {

                        return reject(
                            error
                        );

                    }


                    resolve();

                }
            );

        }
    );


    return sails;

}


async function lowerSailsApp(
    sails
) {

    if (!sails) {
        return;
    }


    await new Promise(
        resolve => {

            sails.lower(
                () =>
                    resolve()
            );

        }
    );

}


/* =========================================================
   IMPORT MEMBERS
========================================================= */

async function importMembers(
    sails,
    posts,
    tagMap
) {

    const Member =
        sails.models.member;


    if (!Member) {

        throw new Error(
            'Sails model "Member" was not found.'
        );

    }


    const AdminUser =
        sails.models.adminuser;


    let adminUserId =
        null;


    /*
     * Assign imported members to the first admin account,
     * matching the previous migration approach.
     */
    if (AdminUser) {

        const admins =
            await AdminUser
                .find()
                .limit(
                    1
                );


        adminUserId =
            admins[0]?.id ||
            null;

    }


    const summary = {

        imported:
            0,

        skipped:
            0,

        failed:
            0,

        missingDepartment:
            0

    };


    for (
        let index = 0;
        index < posts.length;
        index += 1
    ) {

        const post =
            posts[index];


        const name =
            decodeHtmlText(
                post.title
                    ?.rendered
            );


        console.log(
            `\n[${index + 1}/${posts.length}] WordPress #${post.id}: ${name || '(no title)'}`
        );


        if (!name) {

            console.log(
                '  Empty title - skipped.'
            );

            summary.skipped +=
                1;

            continue;

        }


        const department =
            getMemberDepartment(
                post,
                tagMap
            );


        if (!department) {

            console.log(
                '  Could not determine department - skipped.'
            );


            const postTags =
                getPostTagObjects(
                    post,
                    tagMap
                );


            if (
                postTags.length
            ) {

                console.log(
                    `  WordPress tags: ${postTags.map(tag => tag.name).join(', ')}`
                );

            }


            summary
                .missingDepartment +=
                1;

            summary.skipped +=
                1;

            continue;

        }


        console.log(
            `  Department: ${getDepartmentLabel(department)}`
        );


        try {

            /* -------------------------------------------------
               DUPLICATE PROTECTION
            -------------------------------------------------- */

            if (!FORCE) {

                const existing =
                    await Member
                        .findOne({
                            name
                        });


                if (existing) {

                    console.log(
                        '  Member with this exact name already exists - skipped.'
                    );

                    summary.skipped +=
                        1;

                    continue;

                }

            }


            /* -------------------------------------------------
               CONTENT
            -------------------------------------------------- */

            const rawContent =
                String(
                    post.content
                        ?.rendered ||
                    ''
                );


            const mediaResult =
                await migrateMemberContentMedia(
                    rawContent,
                    post.id
                );


            const content =
                sanitizeMigratedHtml(
                    mediaResult.html
                );


            /* -------------------------------------------------
               PROFILE IMAGE
            -------------------------------------------------- */

            let image =
                mediaResult
                    .firstImageUrl ||
                null;


            const featuredImageUrl =
                getFeaturedImageUrl(
                    post
                );


            /*
             * Prefer the WordPress featured image
             * as the member profile image.
             */
            if (
                featuredImageUrl
            ) {

                const downloadedFeatured =
                    await downloadMedia(
                        featuredImageUrl,
                        'images',
                        post.id
                    );


                if (
                    downloadedFeatured
                ) {

                    image =
                        downloadedFeatured
                            .publicUrl;

                }

            }


            /*
             * If the post had no featured image and our
             * HTML migration did not find an inline image,
             * try finding the first raw image again.
             */
            if (!image) {

                const rawFirstImage =
                    getFirstRawImageUrl(
                        rawContent
                    );


                if (
                    rawFirstImage
                ) {

                    const downloadedImage =
                        await downloadMedia(
                            rawFirstImage,
                            'images',
                            post.id
                        );


                    if (
                        downloadedImage
                    ) {

                        image =
                            downloadedImage
                                .publicUrl;

                    }

                }

            }


            /* -------------------------------------------------
               MODEL VALUES
            -------------------------------------------------- */

            const values = {

                name,

                department,

                content,

                image,

                attachmentUrl:
                    mediaResult
                        .firstAttachment
                        ?.publicUrl ||
                    null,

                attachmentName:
                    mediaResult
                        .firstAttachment
                        ?.fileName ||
                    null,

                attachmentMimeType:
                    mediaResult
                        .firstAttachment
                        ?.mimeType ||
                    null,

                isActive:
                    true

            };


            /* -------------------------------------------------
               CREATED BY
            -------------------------------------------------- */

            if (
                adminUserId &&
                Member.attributes &&
                Member.attributes
                    .createdBy
            ) {

                values.createdBy =
                    adminUserId;

            }


            /* -------------------------------------------------
               PRESERVE WORDPRESS DATES
            -------------------------------------------------- */

            const createdAt =
                getTimestampForModel(
                    Member,
                    'createdAt',
                    post.date
                );


            const updatedAt =
                getTimestampForModel(
                    Member,
                    'updatedAt',
                    post.modified ||
                    post.date
                );


            if (
                createdAt !==
                undefined
            ) {

                values.createdAt =
                    createdAt;

            }


            if (
                updatedAt !==
                undefined
            ) {

                values.updatedAt =
                    updatedAt;

            }


            /* -------------------------------------------------
               CREATE MEMBER
            -------------------------------------------------- */

            await Member
                .create(
                    values
                )
                .fetch();


            summary.imported +=
                1;


            console.log(
                '  Imported.'
            );


            /*
             * Small delay so we don't hammer the old server
             * when downloading many images/documents.
             */
            await sleep(
                30
            );


        } catch (error) {

            summary.failed +=
                1;


            console.error(
                `  FAILED: ${error.message}`
            );

        }

    }


    return summary;

}


/* =========================================================
   IMPORT SUMMARY
========================================================= */

function printImportSummary(
    summary
) {

    console.log(
        '\n========================================'
    );

    console.log(
        'MEMBER MIGRATION COMPLETE'
    );

    console.log(
        '========================================'
    );

    console.log(
        `Imported: ${summary.imported}`
    );

    console.log(
        `Skipped:  ${summary.skipped}`
    );

    console.log(
        `Failed:   ${summary.failed}`
    );

    console.log(
        `Missing department: ${summary.missingDepartment}`
    );

    console.log(
        '========================================'
    );

}


/* =========================================================
   MAIN
========================================================= */

async function main() {

    console.log(
        'MND Bitola WordPress MEMBER migration'
    );

    console.log(
        '======================================'
    );

    console.log(
        `Mode: ${DRY_RUN ? 'DRY RUN' : 'IMPORT'}`
    );

    console.log(
        `Media: ${NO_MEDIA ? 'keep remote URLs' : 'download locally'}`
    );


    if (
        IMPORT_ID
    ) {

        console.log(
            `Specific WordPress post: #${IMPORT_ID}`
        );

    }


    /* ---------------------------------------------------------
       FETCH WORDPRESS TAGS
    --------------------------------------------------------- */

    const tags =
        await fetchAllWordPressTags();


    console.log(
        `\nWordPress tags loaded: ${tags.length}`
    );


    const tagMap =
        buildTagMap(
            tags
        );


    /* ---------------------------------------------------------
       FETCH BIO-BIBLIOGRAPHY POSTS
    --------------------------------------------------------- */

    const allPosts =
        await fetchAllMemberPosts();


    console.log(
        `WordPress Био-Библиографии posts loaded: ${allPosts.length}`
    );


    let selectedPosts =
        [...allPosts];


    /* ---------------------------------------------------------
       SPECIFIC ID
    --------------------------------------------------------- */

    if (
        IMPORT_ID
    ) {

        selectedPosts =
            selectedPosts.filter(
                post =>
                    Number(
                        post.id
                    ) ===
                    IMPORT_ID
            );

    }


    /*
     * Oldest first, same as the previous content migration.
     */
    selectedPosts.sort(
        (
            first,
            second
        ) =>
            new Date(
                first.date
            ).getTime() -
            new Date(
                second.date
            ).getTime()
    );


    /* ---------------------------------------------------------
       LIMIT
    --------------------------------------------------------- */

    if (
        IMPORT_LIMIT
    ) {

        selectedPosts =
            selectedPosts.slice(
                0,
                IMPORT_LIMIT
            );

    }


    console.log(
        `Posts selected for migration: ${selectedPosts.length}`
    );


    if (
        IMPORT_ID &&
        selectedPosts.length ===
        0
    ) {

        console.log(
            `\nWordPress post #${IMPORT_ID} was not found in Био-Библиографии.`
        );

        return;

    }


    /* ---------------------------------------------------------
       DRY RUN
    --------------------------------------------------------- */

    if (
        DRY_RUN
    ) {

        printDryRunSummary(
            selectedPosts,
            tagMap
        );

        return;

    }


    /* ---------------------------------------------------------
       CREATE UPLOAD FOLDERS
    --------------------------------------------------------- */

    ensureDirectories();


    /* ---------------------------------------------------------
       LOAD SAILS + IMPORT
    --------------------------------------------------------- */

    let sails =
        null;


    try {

        sails =
            await loadSailsApp();


        const summary =
            await importMembers(
                sails,
                selectedPosts,
                tagMap
            );


        printImportSummary(
            summary
        );


    } finally {

        await lowerSailsApp(
            sails
        );

    }

}


/* =========================================================
   RUN
========================================================= */

main()
    .then(
        () => {

            process.exit(
                0
            );

        }
    )
    .catch(
        error => {

            console.error(
                '\nMember migration failed:'
            );

            console.error(
                error
            );

            process.exit(
                1
            );

        }
    );