'use strict';

/**
 * MND Bitola - one-time WordPress -> Sails/MongoDB content migration
 *
 * Put this file at:
 *   scripts/migrate-wordpress.js
 *
 * Run from the Sails project root:
 *   node scripts/migrate-wordpress.js --dry-run
 *   node scripts/migrate-wordpress.js --limit=5
 *   node scripts/migrate-wordpress.js
 *
 * Optional:
 *   --no-media   Do not download images/documents; keep old remote URLs.
 *   --force      Import even if an item with the same type + title already exists.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const APP_ROOT = path.resolve(__dirname, '..');
process.chdir(APP_ROOT);

require('dotenv').config({
    path: path.join(APP_ROOT, '.env')
});

const sanitizeHtml = require('sanitize-html');

const WORDPRESS_BASE_URL = 'https://mnd-bitola.mk';
const WORDPRESS_POSTS_URL =
    `${WORDPRESS_BASE_URL}/wp-json/wp/v2/posts`;

const DRY_RUN = process.argv.includes('--dry-run');
const NO_MEDIA = process.argv.includes('--no-media');
const FORCE = process.argv.includes('--force');

const limitArgument = process.argv.find(
    argument => argument.startsWith('--limit=')
);

const IMPORT_LIMIT = limitArgument
    ? Math.max(
        1,
        parseInt(
            limitArgument.split('=')[1],
            10
        ) || 1
    )
    : null;

if (typeof fetch !== 'function') {
    console.error(
        'This migration script requires Node.js 18 or newer because it uses the built-in fetch API.'
    );
    process.exit(1);
}

/* =========================================================
   WORDPRESS CATEGORY IDS
========================================================= */

const WP_CATEGORY = {
    NEWS: 3,
    EVENTS: 13,
    AWARDS: 15,
    ANNOUNCEMENTS: 27,
    PUBLICATIONS: 26,
    CENTERS: 28
};

const TARGET_CATEGORY_IDS = new Set(
    Object.values(WP_CATEGORY)
);

/* =========================================================
   NEW CONTENT DIRECTORY MAPPING
   Matches AdminController.getContentDirectory()
========================================================= */

const CONTENT_DIRECTORIES = {
    'sovremeni-dijalozi': 'sovremeni-dijalozi',
    oglas: 'oglasi',
    novost: 'novosti',
    centar: 'centri',
    nagrada: 'nagradi'
};

const IMAGE_EXTENSIONS = new Set([
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

const DOCUMENT_EXTENSIONS = new Set([
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

const mediaCache = new Map();

/* =========================================================
   BASIC HELPERS
========================================================= */

function sleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

function decodeHtmlText(value) {
    return sanitizeHtml(
        String(value || ''),
        {
            allowedTags: [],
            allowedAttributes: {}
        }
    )
        .replace(/\s+/g, ' ')
        .trim();
}

function getAttribute(tag, attributeName) {
    const doubleQuoted = new RegExp(
        `${attributeName}\\s*=\\s*"([^"]*)"`,
        'i'
    );

    const singleQuoted = new RegExp(
        `${attributeName}\\s*=\\s*'([^']*)'`,
        'i'
    );

    const doubleMatch = tag.match(doubleQuoted);
    if (doubleMatch) {
        return doubleMatch[1];
    }

    const singleMatch = tag.match(singleQuoted);
    if (singleMatch) {
        return singleMatch[1];
    }

    return '';
}

function replaceAttribute(
    tag,
    attributeName,
    value
) {
    const escapedValue = String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');

    const existingAttribute = new RegExp(
        `\\s${attributeName}\\s*=\\s*(?:"[^"]*"|'[^']*')`,
        'i'
    );

    if (existingAttribute.test(tag)) {
        return tag.replace(
            existingAttribute,
            ` ${attributeName}="${escapedValue}"`
        );
    }

    return tag.replace(
        /\s*\/?\s*>$/,
        ` ${attributeName}="${escapedValue}">`
    );
}

function removeAttribute(tag, attributeName) {
    const expression = new RegExp(
        `\\s${attributeName}\\s*=\\s*(?:"[^"]*"|'[^']*')`,
        'gi'
    );

    return tag.replace(expression, '');
}

function safeDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
}

function normalizeRemoteUrl(urlValue) {

    let value =
        String(urlValue || '')
            .trim()
            .replace(/&amp;/gi, '&');

    /*
     * Fix legacy Windows-style paths from old WordPress content:
     *
     * \\files/novosti/file.pdf
     * \files/novosti/file.pdf
     *
     * Convert backslashes to normal URL slashes.
     */
    value =
        value.replace(/\\/g, '/');

    /*
     * Fix legacy "files" paths.
     *
     * //files/novosti/file.pdf
     * /files/novosti/file.pdf
     * https://files/novosti/file.pdf
     */
    value = value.replace(
        /^https?:\/\/files\//i,
        `${WORDPRESS_BASE_URL}/files/`
    );

    value = value.replace(
        /^\/+files\//i,
        `${WORDPRESS_BASE_URL}/files/`
    );

    try {

        return new URL(
            value,
            WORDPRESS_BASE_URL
        ).href;

    } catch (error) {

        return value;

    }

}

function getUrlExtension(urlValue) {
    try {
        const parsed = new URL(
            normalizeRemoteUrl(urlValue)
        );
        return path.extname(parsed.pathname).toLowerCase();
    } catch (error) {
        return '';
    }
}

function getMimeTypeFromExtension(extension) {
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.tif': 'image/tiff',
        '.tiff': 'image/tiff',
        '.avif': 'image/avif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx':
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.zip': 'application/zip',
        '.txt': 'text/plain'
    };

    return mimeTypes[extension] ||
        'application/octet-stream';
}

function extensionFromMimeType(mimeType) {
    const value = String(mimeType || '')
        .split(';')[0]
        .trim()
        .toLowerCase();

    const extensions = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/avif': '.avif',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'application/zip': '.zip',
        'text/plain': '.txt'
    };

    return extensions[value] || '';
}

function sanitizeFileName(fileName) {
    const decoded = safeDecodeURIComponent(
        String(fileName || 'file')
    );

    return decoded
        .normalize('NFKD')
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[-.]+|[-.]+$/g, '')
        .slice(0, 140) || 'file';
}

function getRemoteFileName(
    mediaUrl,
    mimeType = ''
) {
    let baseName = 'file';

    try {
        const parsed = new URL(mediaUrl);
        baseName = path.basename(parsed.pathname) ||
            'file';
    } catch (error) {
        // Use fallback.
    }

    baseName = sanitizeFileName(baseName);

    if (!path.extname(baseName)) {
        baseName += extensionFromMimeType(mimeType);
    }

    return baseName;
}

function chooseLargestSrcsetUrl(
    srcset,
    fallbackUrl
) {
    if (!srcset) {
        return fallbackUrl;
    }

    const candidates = String(srcset)
        .split(',')
        .map(entry => {
            const parts = entry.trim().split(/\s+/);
            const url = parts[0] || '';
            const widthMatch = String(parts[1] || '')
                .match(/^(\d+)w$/);

            return {
                url,
                width: widthMatch
                    ? Number(widthMatch[1])
                    : 0
            };
        })
        .filter(candidate => candidate.url);

    if (!candidates.length) {
        return fallbackUrl;
    }

    candidates.sort(
        (first, second) =>
            second.width - first.width
    );

    return candidates[0].url ||
        fallbackUrl;
}

function getMigrationTarget(post) {
    const categories = Array.isArray(post.categories)
        ? post.categories.map(Number)
        : [];

    // Child/special categories must win over the generic Новости category.
    if (
        categories.includes(
            WP_CATEGORY.AWARDS
        )
    ) {
        return {
            type: 'nagrada',
            isEvent: false
        };
    }

    if (
        categories.includes(
            WP_CATEGORY.ANNOUNCEMENTS
        )
    ) {
        return {
            type: 'oglas',
            isEvent: false
        };
    }

    if (
        categories.includes(
            WP_CATEGORY.PUBLICATIONS
        )
    ) {
        return {
            type:
                'sovremeni-dijalozi',
            isEvent: false
        };
    }

    if (
        categories.includes(
            WP_CATEGORY.CENTERS
        )
    ) {
        return {
            type: 'centar',
            isEvent: false
        };
    }

    if (
        categories.includes(
            WP_CATEGORY.EVENTS
        )
    ) {
        return {
            type: 'novost',
            isEvent: true
        };
    }

    if (
        categories.includes(
            WP_CATEGORY.NEWS
        )
    ) {
        return {
            type: 'novost',
            isEvent: false
        };
    }

    return null;
}

function postHasAnyTargetCategory(post) {
    const categories = Array.isArray(post.categories)
        ? post.categories.map(Number)
        : [];

    return categories.some(
        categoryId =>
            TARGET_CATEGORY_IDS.has(
                categoryId
            )
    );
}

/* =========================================================
   WORDPRESS FETCHING
========================================================= */

async function fetchAllWordPressPosts() {
    const allPosts = [];
    let page = 1;
    let totalPages = 1;

    do {
        const parameters =
            new URLSearchParams({
                per_page: '100',
                page: String(page),
                status: 'publish',
                _embed: 'wp:featuredmedia',
                _fields:
                    'id,date,modified,link,title,content,categories,featured_media,_links,_embedded'
            });

        const url =
            `${WORDPRESS_POSTS_URL}?${parameters.toString()}`;

        console.log(
            `Loading WordPress posts page ${page}...`
        );

        const response = await fetch(
            url,
            {
                headers: {
                    Accept: 'application/json',
                    'User-Agent':
                        'MND-Bitola-Migration/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `WordPress returned HTTP ${response.status} for page ${page}.`
            );
        }

        const posts = await response.json();

        if (!Array.isArray(posts)) {
            throw new Error(
                'Unexpected WordPress API response.'
            );
        }

        allPosts.push(...posts);

        const pagesHeader = Number(
            response.headers.get(
                'x-wp-totalpages'
            )
        );

        totalPages = Number.isFinite(
            pagesHeader
        ) && pagesHeader > 0
            ? pagesHeader
            : (
                posts.length === 100
                    ? page + 1
                    : page
            );

        page += 1;

    } while (page <= totalPages);

    return allPosts;
}

/* =========================================================
   MEDIA DOWNLOADS
========================================================= */

async function downloadMedia(
    mediaUrl,
    directory,
    kind,
    postId
) {
    if (!mediaUrl) {
        return null;
    }

    mediaUrl =
        normalizeRemoteUrl(mediaUrl);

    if (NO_MEDIA) {
        const extension =
            getUrlExtension(mediaUrl);

        return {
            publicUrl: mediaUrl,
            fileName:
                getRemoteFileName(
                    mediaUrl
                ),
            mimeType:
                getMimeTypeFromExtension(
                    extension
                )
        };
    }

    const cacheKey =
        `${directory}|${kind}|${mediaUrl}`;

    if (mediaCache.has(cacheKey)) {
        return mediaCache.get(cacheKey);
    }

    try {
        const response = await fetch(
            mediaUrl,
            {
                headers: {
                    'User-Agent':
                        'MND-Bitola-Migration/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const mimeType =
            response.headers
                .get('content-type') ||
            getMimeTypeFromExtension(
                getUrlExtension(mediaUrl)
            );

        const originalFileName =
            getRemoteFileName(
                mediaUrl,
                mimeType
            );

        const hash = crypto
            .createHash('sha1')
            .update(mediaUrl)
            .digest('hex')
            .slice(0, 10);

        const fileName =
            `${postId}-${hash}-${originalFileName}`;

        const absoluteDirectory =
            path.resolve(
                APP_ROOT,
                'assets',
                'uploads',
                directory,
                kind
            );

        await fs.promises.mkdir(
            absoluteDirectory,
            {
                recursive: true
            }
        );

        const absoluteFilePath =
            path.join(
                absoluteDirectory,
                fileName
            );

        const arrayBuffer =
            await response.arrayBuffer();

        await fs.promises.writeFile(
            absoluteFilePath,
            Buffer.from(arrayBuffer)
        );

        const result = {
            publicUrl:
                `/uploads/${directory}/${kind}/${fileName}`,
            fileName:
                originalFileName,
            mimeType:
                String(mimeType)
                    .split(';')[0]
                    .trim()
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

        const fallback = {
            publicUrl: mediaUrl,
        
            fileName:
                getRemoteFileName(
                    mediaUrl
                ),
        
            mimeType:
                getMimeTypeFromExtension(
                    getUrlExtension(mediaUrl)
                ),
        
            downloadFailed: true
        };

        mediaCache.set(
            cacheKey,
            fallback
        );

        return fallback;
    }
}

async function migrateContentMedia(
    rawHtml,
    type,
    postId
) {
    const directory =
        CONTENT_DIRECTORIES[type];

    let html = String(rawHtml || '');
    let firstImageUrl = null;
    let firstAttachment = null;

    if (!directory) {
        return {
            html,
            firstImageUrl,
            firstAttachment
        };
    }

    /* -----------------------------------------------------
       INLINE IMAGES
    ----------------------------------------------------- */

    const imageTags = [
        ...html.matchAll(
            /<img\b[^>]*>/gi
        )
    ].map(match => match[0]);

    for (
        let imageIndex = 0;
        imageIndex < imageTags.length;
        imageIndex += 1
    ) {
        const originalTag =
            imageTags[imageIndex];

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

        const sourceUrl =
            chooseLargestSrcsetUrl(
                srcset,
                src
            );

        if (!sourceUrl) {
            continue;
        }

        const downloaded =
            await downloadMedia(
                sourceUrl,
                directory,
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

        newTag = removeAttribute(
            newTag,
            'srcset'
        );

        newTag = removeAttribute(
            newTag,
            'sizes'
        );

        html = html.replace(
            originalTag,
            newTag
        );
    }

    /* -----------------------------------------------------
       DOCUMENT LINKS
    ----------------------------------------------------- */

    const anchorTags = [
        ...html.matchAll(
            /<a\b[^>]*>/gi
        )
    ].map(match => match[0]);

    for (
        let anchorIndex = 0;
        anchorIndex < anchorTags.length;
        anchorIndex += 1
    ) {
        const originalTag =
            anchorTags[anchorIndex];

        const href =
            getAttribute(
                originalTag,
                'href'
            );

        if (!href) {
            continue;
        }

        const extension =
            getUrlExtension(href);

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
                directory,
                'files',
                postId
            );

        if (!downloaded) {
            continue;
        }

        if (
            !firstAttachment &&
            !downloaded.downloadFailed
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

        html = html.replace(
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

function sanitizeMigratedHtml(html) {
    let cleaned = sanitizeHtml(
        String(html || ''),
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
            allowProtocolRelative: false
        }
    );

    cleaned = cleaned
        .replace(/&nbsp;/gi, ' ')
        .replace(
            /<(div|p)>\s*<\/(div|p)>/gi,
            ''
        )
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    return cleaned;
}

function getFeaturedImageUrl(post) {
    const featuredMedia =
        post &&
        post._embedded &&
        post._embedded[
            'wp:featuredmedia'
        ];

    if (
        Array.isArray(featuredMedia) &&
        featuredMedia[0] &&
        featuredMedia[0].source_url
    ) {
        return featuredMedia[0].source_url;
    }

    return '';
}

function getFirstRawImageUrl(html) {
    const firstImageMatch =
        String(html || '')
            .match(/<img\b[^>]*>/i);

    if (!firstImageMatch) {
        return '';
    }

    const tag = firstImageMatch[0];

    return chooseLargestSrcsetUrl(
        getAttribute(tag, 'srcset'),
        getAttribute(tag, 'src')
    );
}

function getTimestampForModel(
    model,
    attributeName,
    dateValue
) {
    if (!dateValue) {
        return undefined;
    }

    const date = new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return undefined;
    }

    const attribute =
        model.attributes &&
        model.attributes[attributeName];

    if (!attribute) {
        return undefined;
    }

    if (attribute.type === 'string') {
        return date.toISOString();
    }

    return date.getTime();
}

/* =========================================================
   DRY RUN SUMMARY
========================================================= */

function printDryRunSummary(posts) {
    const counts = {
        novost: 0,
        events: 0,
        nagrada: 0,
        oglas: 0,
        'sovremeni-dijalozi': 0,
        centar: 0
    };

    for (const post of posts) {
        const target =
            getMigrationTarget(post);

        if (!target) {
            continue;
        }

        if (
            target.type === 'novost' &&
            target.isEvent
        ) {
            counts.events += 1;
        } else {
            counts[target.type] += 1;
        }
    }

    console.log('\nDRY RUN - nothing was written to MongoDB.');
    console.log('----------------------------------------');
    console.log(`Новости: ${counts.novost}`);
    console.log(`Настани: ${counts.events}`);
    console.log(`Награди: ${counts.nagrada}`);
    console.log(`Огласи: ${counts.oglas}`);
    console.log(
        `Публикации -> Современи дијалози: ${counts['sovremeni-dijalozi']}`
    );
    console.log(`Центри: ${counts.centar}`);
    console.log('----------------------------------------');
    console.log(
        `Total selected posts: ${posts.length}`
    );
}

/* =========================================================
   SAILS LOADING
========================================================= */

async function loadSailsApp() {
    const Sails = require('sails').Sails;
    const sails = new Sails();

    await new Promise(
        (resolve, reject) => {
            sails.load(
                {
                    appPath: APP_ROOT,
                    hooks: {
                        grunt: false
                    },
                    log: {
                        level: 'warn'
                    }
                },
                error => {
                    if (error) {
                        return reject(error);
                    }

                    resolve();
                }
            );
        }
    );

    return sails;
}

async function lowerSailsApp(sails) {
    if (!sails) {
        return;
    }

    await new Promise(resolve => {
        sails.lower(() => resolve());
    });
}

/* =========================================================
   DATABASE IMPORT
========================================================= */

async function importPosts(
    sails,
    posts
) {
    const ContentItem =
        sails.models.contentitem;

    if (!ContentItem) {
        throw new Error(
            'Sails model "ContentItem" was not found.'
        );
    }

    const AdminUser =
        sails.models.adminuser;

    let adminUserId = null;

    if (AdminUser) {
        const adminUsers =
            await AdminUser
                .find()
                .limit(1);

        adminUserId =
            adminUsers[0]?.id ||
            null;
    }

    const summary = {
        imported: 0,
        skipped: 0,
        failed: 0,
        byType: {
            novost: 0,
            events: 0,
            nagrada: 0,
            oglas: 0,
            'sovremeni-dijalozi': 0,
            centar: 0
        }
    };

    for (
        let index = 0;
        index < posts.length;
        index += 1
    ) {
        const post = posts[index];
        const target =
            getMigrationTarget(post);

        if (!target) {
            continue;
        }

        const title =
            decodeHtmlText(
                post.title?.rendered
            );

        if (!title) {
            console.warn(
                `[${index + 1}/${posts.length}] Skipped WordPress #${post.id}: empty title.`
            );
            summary.skipped += 1;
            continue;
        }

        console.log(
            `\n[${index + 1}/${posts.length}] WordPress #${post.id}: ${title}`
        );

        try {
            if (!FORCE) {
                const existing =
                    await ContentItem.findOne({
                        type: target.type,
                        title
                    });

                if (existing) {
                    console.log(
                        '  Already exists - skipped.'
                    );
                    summary.skipped += 1;
                    continue;
                }
            }

            const rawContent =
                String(
                    post.content?.rendered ||
                    ''
                );

            const mediaResult =
                await migrateContentMedia(
                    rawContent,
                    target.type,
                    post.id
                );

            const content =
                sanitizeMigratedHtml(
                    mediaResult.html
                );

            const directory =
                CONTENT_DIRECTORIES[
                    target.type
                ];

            let image =
                mediaResult.firstImageUrl ||
                null;

            const featuredImageUrl =
                getFeaturedImageUrl(post);

            if (featuredImageUrl) {
                const featuredImage =
                    await downloadMedia(
                        featuredImageUrl,
                        directory,
                        'images',
                        post.id
                    );

                if (featuredImage) {
                    image =
                        featuredImage.publicUrl;
                }
            } else if (!image) {
                const rawFirstImage =
                    getFirstRawImageUrl(
                        rawContent
                    );

                if (rawFirstImage) {
                    const downloaded =
                        await downloadMedia(
                            rawFirstImage,
                            directory,
                            'images',
                            post.id
                        );

                    if (downloaded) {
                        image =
                            downloaded.publicUrl;
                    }
                }
            }

            const values = {
                type:
                    target.type,
                title,
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
                    null
            };

            if (
                ContentItem.attributes &&
                ContentItem.attributes.isEvent
            ) {
                values.isEvent =
                    target.isEvent === true;
            }

            if (
                adminUserId &&
                ContentItem.attributes &&
                ContentItem.attributes.createdBy
            ) {
                values.createdBy =
                    adminUserId;
            }

            if (
                adminUserId &&
                ContentItem.attributes &&
                ContentItem.attributes.updatedBy
            ) {
                values.updatedBy =
                    adminUserId;
            }

            const createdAt =
                getTimestampForModel(
                    ContentItem,
                    'createdAt',
                    post.date
                );

            const updatedAt =
                getTimestampForModel(
                    ContentItem,
                    'updatedAt',
                    post.modified ||
                    post.date
                );

            if (createdAt !== undefined) {
                values.createdAt =
                    createdAt;
            }

            if (updatedAt !== undefined) {
                values.updatedAt =
                    updatedAt;
            }

            await ContentItem
                .create(values)
                .fetch();

            summary.imported += 1;

            if (
                target.type === 'novost' &&
                target.isEvent
            ) {
                summary.byType.events += 1;
            } else {
                summary.byType[
                    target.type
                ] += 1;
            }

            console.log('  Imported.');

            // Be polite to the old server when a post has many media files.
            await sleep(30);

        } catch (error) {
            summary.failed += 1;

            console.error(
                `  FAILED: ${error.message}`
            );
        }
    }

    return summary;
}

function printImportSummary(summary) {
    console.log('\n========================================');
    console.log('MIGRATION COMPLETE');
    console.log('========================================');
    console.log(
        `Imported: ${summary.imported}`
    );
    console.log(
        `Skipped:  ${summary.skipped}`
    );
    console.log(
        `Failed:   ${summary.failed}`
    );
    console.log('----------------------------------------');
    console.log(
        `Новости: ${summary.byType.novost}`
    );
    console.log(
        `Настани: ${summary.byType.events}`
    );
    console.log(
        `Награди: ${summary.byType.nagrada}`
    );
    console.log(
        `Огласи: ${summary.byType.oglas}`
    );
    console.log(
        `Современи дијалози: ${summary.byType['sovremeni-dijalozi']}`
    );
    console.log(
        `Центри: ${summary.byType.centar}`
    );
    console.log('========================================');
}

/* =========================================================
   MAIN
========================================================= */

async function main() {
    console.log('MND Bitola WordPress migration');
    console.log('==============================');
    console.log(
        `Mode: ${DRY_RUN ? 'DRY RUN' : 'IMPORT'}`
    );
    console.log(
        `Media: ${NO_MEDIA ? 'keep remote URLs' : 'download locally'}`
    );

    const allPosts =
        await fetchAllWordPressPosts();

    let selectedPosts =
        allPosts.filter(
            post =>
                postHasAnyTargetCategory(
                    post
                ) &&
                getMigrationTarget(post)
        );

    // Import oldest first, so the operation proceeds chronologically.
    selectedPosts.sort(
        (first, second) =>
            new Date(first.date).getTime() -
            new Date(second.date).getTime()
    );

    if (IMPORT_LIMIT) {
        selectedPosts =
            selectedPosts.slice(
                0,
                IMPORT_LIMIT
            );
    }

    console.log(
        `\nWordPress posts loaded: ${allPosts.length}`
    );
    console.log(
        `Posts selected for migration: ${selectedPosts.length}`
    );

    if (DRY_RUN) {
        printDryRunSummary(
            selectedPosts
        );
        return;
    }

    let sails = null;

    try {
        sails =
            await loadSailsApp();

        const summary =
            await importPosts(
                sails,
                selectedPosts
            );

        printImportSummary(summary);

    } finally {
        await lowerSailsApp(sails);
    }
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('\nMigration failed:');
        console.error(error);
        process.exit(1);
    });
