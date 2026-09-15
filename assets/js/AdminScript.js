let memberRichTextEditor = null;
let aboutRichTextEditor = null;
let contentRichTextEditor = null;

let adminQuillFontsRegistered = false;


function registerAdminQuillFonts() {

    if (
        adminQuillFontsRegistered ||
        typeof Quill === 'undefined'
    ) {
        return;
    }


    const Font =
        Quill.import(
            'formats/font'
        );


    Font.whitelist = [

        'arial',

        'times-new-roman',

        'georgia',

        'verdana',

        'monospace'

    ];


    Quill.register(
        Font,
        true
    );


    adminQuillFontsRegistered =
        true;

}

async function uploadAdminEditorImage(
    quill
) {

    const input =
        document.createElement(
            'input'
        );


    input.setAttribute(
        'type',
        'file'
    );


    input.setAttribute(
        'accept',
        'image/jpeg,image/png,image/webp,image/gif'
    );


    input.click();


    input.onchange =
        async () => {

            const file =
                input.files?.[0];


            if (!file) {
                return;
            }


            /* =============================================
               CLIENT VALIDATION
            ============================================= */

            const allowedTypes = [

                'image/jpeg',

                'image/png',

                'image/webp',

                'image/gif'

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                window.alert(
                    'Дозволени се JPG, PNG, WEBP и GIF фотографии.'
                );

                return;

            }


            if (
                file.size >
                8 * 1024 * 1024
            ) {

                window.alert(
                    'Фотографијата не смее да биде поголема од 8 MB.'
                );

                return;

            }


            try {

                const formData =
                    new FormData();


                formData.append(
                    'image',
                    file
                );


                const response =
                    await axios.post(

                        '/admin/api/editor-image',

                        formData

                    );


                const imageUrl =
                    response.data?.url;


                if (!imageUrl) {

                    throw new Error(
                        'No image URL returned.'
                    );

                }


                /* =============================================
                   INSERT AT CURRENT CURSOR POSITION
                ============================================= */

                const selection =
                    quill.getSelection(
                        true
                    );


                let index =
                    selection
                        ? selection.index
                        : quill.getLength() - 1;


                /*
                 * Put the image on its own line.
                 */

                if (
                    index > 0 &&
                    quill.getText(
                        index - 1,
                        1
                    ) !== '\n'
                ) {

                    quill.insertText(
                        index,
                        '\n',
                        'user'
                    );


                    index++;

                }


                quill.insertEmbed(

                    index,

                    'image',

                    imageUrl,

                    'user'

                );


                /*
                 * Add a line after it so the user can
                 * continue typing.
                 */

                quill.insertText(

                    index + 1,

                    '\n',

                    'user'

                );


                /*
                 * Default inserted images to centered.
                 */

                quill.formatLine(

                    index,

                    1,

                    'align',

                    'center',

                    'user'

                );


                quill.setSelection(

                    index + 2,

                    0,

                    'silent'

                );


            } catch (error) {

                console.error(
                    'Editor image upload error:',
                    error
                );


                window.alert(
                    error.response?.data?.message ||
                    'Не може да се прикачи фотографијата.'
                );

            }

        };

}

function createAdminRichTextEditor(
    elementId,
    content = ''
) {

    const element =
        document.getElementById(
            elementId
        );


    if (
        !element ||
        typeof Quill === 'undefined'
    ) {

        return null;

    }


    registerAdminQuillFonts();


    element.innerHTML =
        '';


    const toolbarOptions = [

        [
            {
                font: [
                    false,
                    'arial',
                    'times-new-roman',
                    'georgia',
                    'verdana',
                    'monospace'
                ]
            }
        ],

        [
            {
                size: [
                    'small',
                    false,
                    'large',
                    'huge'
                ]
            }
        ],

        [
            {
                header: [
                    1,
                    2,
                    3,
                    4,
                    false
                ]
            }
        ],

        [
            'bold',
            'italic',
            'underline',
            'strike'
        ],

        [
            {
                color: []
            },

            {
                background: []
            }
        ],

        [
            {
                script: 'sub'
            },

            {
                script: 'super'
            }
        ],

        [
            {
                list: 'ordered'
            },

            {
                list: 'bullet'
            }
        ],

        [
            {
                indent: '-1'
            },

            {
                indent: '+1'
            }
        ],

        [
            {
                align: []
            }
        ],

        [
            'blockquote',
            'link',
            'image'
        ],

        [
            'clean'
        ]

    ];


    const editor =
        new Quill(
            element,
            {

                theme:
                    'snow',


                placeholder:
                    'Внесете содржина...',


                modules: {

                    toolbar: {

                        container:
                            toolbarOptions,


                        handlers: {

                            image: function () {

                                uploadAdminEditorImage(
                                    this.quill
                                );

                            }

                        }

                    }

                }

            }
        );


    /* =====================================================
       LOAD EXISTING CONTENT
    ===================================================== */

    if (content) {

        editor
            .clipboard
            .dangerouslyPasteHTML(
                content
            );

    }


    /* =====================================================
       IMAGE SELECTION
    ===================================================== */

    editor.root.addEventListener(
        'click',
        event => {

            if (
                event.target.tagName !==
                'IMG'
            ) {

                return;

            }


            const imageBlot =
                Quill.find(
                    event.target
                );


            if (!imageBlot) {
                return;
            }


            const imageIndex =
                editor.getIndex(
                    imageBlot
                );


            editor.setSelection(

                imageIndex,

                1,

                'silent'

            );

        }
    );


    return editor;

}


const adminApp = Vue.createApp({

    data() {

        return {

            /* =================================================
               GENERAL
            ================================================= */

            currentAdminPage:
                document.body.dataset.adminPage || '',



            /* =================================================
               LOGIN
            ================================================= */

            loginForm: {

                email: '',

                password: ''

            },


            loggingIn: false,

            loginError: '',

            /* =================================================
   ЧЛЕНОВИ
================================================= */

            members: [],

            loadingMembers: false,

            savingMember: false,


            memberPageMode:
                'list',


            editingMemberId:
                null,


            memberSearch:
                '',


            memberDepartmentFilter:
                '',


            memberImageFile:
                null,


            memberImagePreview:
                '',


            memberFormError:
                '',


            memberForm: {

                name: '',

                department: '',

                isActive: true

            },


            memberDepartments: [

                {
                    value:
                        'opstestveni-nauki',

                    name:
                        'Одделение за општествени науки'
                },


                {
                    value:
                        'pravni-nauki',

                    name:
                        'Одделение за правни науки'
                },


                {
                    value:
                        'prirodni-nauki',

                    name:
                        'Одделение за природни науки'
                },


                {
                    value:
                        'primeneti-nauki-i-medicina',

                    name:
                        'Одделение за применети науки и медицина'
                },


                {
                    value:
                        'tehnicki-nauki',

                    name:
                        'Одделение за технички науки'
                },


                {
                    value:
                        'umetnost',

                    name:
                        'Одделение за уметност'
                },


                {
                    value:
                        'lingvistika-i-literatura',

                    name:
                        'Одделение за лингвистика и литература'
                },


                {
                    value:
                        'istorisko-geografski-nauki',

                    name:
                        'Одделение за историско-географски науки'
                }

            ],
            /* =================================================
                ЗА МНД
                ================================================= */

                aboutPages: [],

                loadingAboutPages: false,

                aboutPageMode:
                    'list',

                editingAboutSlug:
                    null,

                editingAboutTitle:
                    '',

                aboutImageFile:
                    null,

                aboutImagePreview:
                    '',

                removeAboutImage:
                    false,

                savingAboutPage:
                    false,

                aboutFormError:
                    '',

                    /* =================================================
   ПУБЛИКАЦИИ / ОГЛАСИ
================================================= */

                    contentItems: [],

                    contentType: '',

                    contentPageMode:
                        'list',

                    loadingContentItems:
                        false,

                    savingContentItem:
                        false,

                    editingContentItemId:
                        null,


                    contentForm: {

                        title: ''

                    },


                    contentImageFile:
                        null,

                    contentImagePreview:
                        '',

                    removeCurrentContentImage:
                        false,


                    contentAttachmentFile:
                        null,

                    contentAttachmentName:
                        '',

                    removeCurrentContentAttachment:
                        false,


                    contentFormError:
    '',

    publicationLanding: {

        publicationsImage: '',
    
        dialoguesImage: '',
    
        otherContributionsImage: ''
    
    },
    
    
    publicationLandingFiles: {
    
        publications: null,
    
        dialogues: null,
    
        other: null
    
    },
    
    
    publicationLandingPreviews: {
    
        publications: '',
    
        dialogues: '',
    
        other: ''
    
    },
    
    
    savingPublicationLanding:
        false,

        };

    },

    computed: {

        filteredMembers() {
    
            const search =
                this.memberSearch
                    .trim()
                    .toLowerCase();
    
    
            return this.members.filter(
                member => {
    
                    const matchesSearch =
                        !search ||
                        String(
                            member.name || ''
                        )
                        .toLowerCase()
                        .includes(search);
    
    
                    const matchesDepartment =
                        !this.memberDepartmentFilter ||
                        member.department ===
                            this.memberDepartmentFilter;
    
    
                    return (
                        matchesSearch &&
                        matchesDepartment
                    );
    
                }
            );
    
        }
    
    },



    methods: {


        async loadMembers() {

            try {

                this.loadingMembers = true;


                const response =
                    await axios.get(
                        '/admin/api/clenovi'
                    );


                this.members =
                    response.data?.members || [];


            } catch (error) {

                console.error(
                    'Load members error:',
                    error
                );


            } finally {

                this.loadingMembers = false;

            }

        },



        /* =========================================================
        DEPARTMENT NAME
        ========================================================= */

        getMemberDepartmentName(value) {

            const department =
                this.memberDepartments.find(
                    item =>
                        item.value === value
                );


            return department
                ? department.name
                : value;

        },



        /* =========================================================
        RICH TEXT EDITOR
        ========================================================= */

        initializeMemberEditor(content = '') {

            memberRichTextEditor =
                createAdminRichTextEditor(
                    'memberRichTextEditor',
                    content
                );
        
        },



        /* =========================================================
        CREATE FORM
        ========================================================= */

        openCreateMember() {

            this.editingMemberId =
                null;


            this.memberForm = {

                name: '',

                department: '',

                isActive: true

            };


            this.memberImageFile =
                null;


            this.memberImagePreview =
                '';


            this.memberFormError =
                '';


            this.memberPageMode =
                'form';


            this.$nextTick(
                () => {

                    this.initializeMemberEditor();

                }
            );

        },



        /* =========================================================
        EDIT FORM
        ========================================================= */

        openEditMember(member) {

            this.editingMemberId =
                member.id;


            this.memberForm = {

                name:
                    member.name || '',

                department:
                    member.department || '',

                isActive:
                    member.isActive !== false

            };


            this.memberImageFile =
                null;


            this.memberImagePreview =
                member.image || '';


            this.memberFormError =
                '';


            this.memberPageMode =
                'form';


            this.$nextTick(
                () => {

                    this.initializeMemberEditor(
                        member.content || ''
                    );

                }
            );

        },



        /* =========================================================
        CLOSE FORM
        ========================================================= */

        closeMemberForm() {

            if (
                this.memberImagePreview &&
                this.memberImagePreview.startsWith(
                    'blob:'
                )
            ) {

                URL.revokeObjectURL(
                    this.memberImagePreview
                );

            }


            this.memberPageMode =
                'list';


            this.editingMemberId =
                null;


            this.memberImageFile =
                null;


            this.memberImagePreview =
                '';


            this.memberFormError =
                '';


            memberRichTextEditor =
                null;

        },



        /* =========================================================
        IMAGE
        ========================================================= */

        handleMemberImageChange(event) {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            const allowedTypes = [

                'image/jpeg',

                'image/png',

                'image/webp'

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                this.memberFormError =
                    'Дозволени се JPG, PNG и WEBP фотографии.';

                event.target.value =
                    '';

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                this.memberFormError =
                    'Фотографијата не смее да биде поголема од 5 MB.';

                event.target.value =
                    '';

                return;

            }


            if (
                this.memberImagePreview &&
                this.memberImagePreview.startsWith(
                    'blob:'
                )
            ) {

                URL.revokeObjectURL(
                    this.memberImagePreview
                );

            }


            this.memberImageFile =
                file;


            this.memberImagePreview =
                URL.createObjectURL(
                    file
                );


            this.memberFormError =
                '';

        },



        /* =========================================================
        SAVE MEMBER
        ========================================================= */

        async saveMember() {

            if (this.savingMember) {
                return;
            }


            this.memberFormError =
                '';


            if (
                !this.memberForm.name.trim()
            ) {

                this.memberFormError =
                    'Внесете име и презиме.';

                return;

            }


            if (
                !this.memberForm.department
            ) {

                this.memberFormError =
                    'Изберете одделение.';

                return;

            }


            try {

                this.savingMember =
                    true;


                const formData =
                    new FormData();


                formData.append(
                    'name',
                    this.memberForm.name
                );


                formData.append(
                    'department',
                    this.memberForm.department
                );


                formData.append(
                    'isActive',
                    String(
                        this.memberForm.isActive
                    )
                );


                formData.append(
                    'content',
                    memberRichTextEditor
                        ? memberRichTextEditor.root.innerHTML
                        : ''
                );


                if (
                    this.memberImageFile
                ) {

                    formData.append(
                        'image',
                        this.memberImageFile
                    );

                }


                if (
                    this.editingMemberId
                ) {

                    await axios.put(

                        '/admin/api/clenovi/' +
                        this.editingMemberId,

                        formData

                    );

                } else {

                    await axios.post(

                        '/admin/api/clenovi',

                        formData

                    );

                }


                await this.loadMembers();


                this.closeMemberForm();


            } catch (error) {

                console.error(
                    'Save member error:',
                    error
                );


                this.memberFormError =
                    error.response?.data?.message ||
                    'Не може да се зачува членот.';


            } finally {

                this.savingMember =
                    false;

            }

        },



        /* =========================================================
        DELETE MEMBER
        ========================================================= */

        async deleteMember(member) {

            const confirmed =
                window.confirm(
                    'Дали сте сигурни дека сакате да го избришете членот "' +
                    member.name +
                    '"?'
                );


            if (!confirmed) {
                return;
            }


            try {

                await axios.delete(

                    '/admin/api/clenovi/' +
                    member.id

                );


                await this.loadMembers();


            } catch (error) {

                console.error(
                    'Delete member error:',
                    error
                );


                window.alert(
                    error.response?.data?.message ||
                    'Не може да се избрише членот.'
                );

            }

        },


        /* =====================================================
           LOGIN
        ===================================================== */

        async adminLogin() {

            if (this.loggingIn) {
                return;
            }


            this.loginError = '';


            if (
                !this.loginForm.email ||
                !this.loginForm.password
            ) {

                this.loginError =
                    'Please enter your email and password.';

                return;

            }


            try {

                this.loggingIn = true;


                const response =
                    await axios.post(
                        '/admin/api/login',
                        {

                            email:
                                this.loginForm.email,

                            password:
                                this.loginForm.password

                        }
                    );


                if (response.data?.success) {

                    window.location.href =
                        '/admin';

                }


            } catch (error) {

                console.error(
                    'Admin login error:',
                    error
                );


                this.loginError =
                    error.response?.data?.message ||
                    'Unable to log in.';


            } finally {

                this.loggingIn = false;

            }

        },



        /* =====================================================
           LOGOUT
        ===================================================== */

        async adminLogout() {

            try {

                await axios.post(
                    '/admin/api/logout'
                );


                window.location.href =
                    '/admin/login';


            } catch (error) {

                console.error(
                    'Admin logout error:',
                    error
                );

            }

        },

        /* =========================================================
   LOAD ABOUT PAGES
========================================================= */

async loadAboutPages() {

    try {

        this.loadingAboutPages =
            true;


        const response =
            await axios.get(
                '/admin/api/za-mnd'
            );


        this.aboutPages =
            response.data?.pages || [];


    } catch (error) {

        console.error(
            'Load About pages error:',
            error
        );


    } finally {

        this.loadingAboutPages =
            false;

    }

},



/* =========================================================
   OPEN EDIT
========================================================= */

openEditAboutPage(page) {

    this.editingAboutSlug =
        page.slug;


    this.editingAboutTitle =
        page.title;


    this.aboutImageFile =
        null;


    this.aboutImagePreview =
        page.image || '';


    this.removeAboutImage =
        false;


    this.aboutFormError =
        '';


    this.aboutPageMode =
        'form';


    this.$nextTick(
        () => {

            aboutRichTextEditor =
                createAdminRichTextEditor(
                    'aboutRichTextEditor',
                    page.content || ''
                );

        }
    );

},



/* =========================================================
   IMAGE
========================================================= */

handleAboutImageChange(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    const allowedTypes = [

        'image/jpeg',

        'image/png',

        'image/webp'

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        this.aboutFormError =
            'Дозволени се JPG, PNG и WEBP фотографии.';

        return;

    }


    if (
        file.size >
        5 * 1024 * 1024
    ) {

        this.aboutFormError =
            'Фотографијата не смее да биде поголема од 5 MB.';

        return;

    }


    this.aboutImageFile =
        file;


    this.removeAboutImage =
        false;


    this.aboutImagePreview =
        URL.createObjectURL(
            file
        );

},



removeCurrentAboutImage() {

    this.aboutImageFile =
        null;


    this.aboutImagePreview =
        '';


    this.removeAboutImage =
        true;

},



/* =========================================================
   SAVE
========================================================= */

async saveAboutPage() {

    if (
        this.savingAboutPage ||
        !this.editingAboutSlug
    ) {
        return;
    }


    try {

        this.savingAboutPage =
            true;


        const formData =
            new FormData();


        formData.append(
            'content',
            aboutRichTextEditor
                ? aboutRichTextEditor.root.innerHTML
                : ''
        );


        formData.append(
            'removeImage',
            String(
                this.removeAboutImage
            )
        );


        if (
            this.aboutImageFile
        ) {

            formData.append(
                'image',
                this.aboutImageFile
            );

        }


        await axios.put(

            '/admin/api/za-mnd/' +
            this.editingAboutSlug,

            formData

        );


        await this.loadAboutPages();


        this.closeAboutForm();


    } catch (error) {

        console.error(
            'Save About page error:',
            error
        );


        this.aboutFormError =
            error.response?.data?.message ||
            'Не може да се зачува содржината.';


    } finally {

        this.savingAboutPage =
            false;

    }

},



closeAboutForm() {

    this.aboutPageMode =
        'list';


    this.editingAboutSlug =
        null;


    this.editingAboutTitle =
        '';


    this.aboutImageFile =
        null;


    this.aboutImagePreview =
        '';


    this.removeAboutImage =
        false;


    this.aboutFormError =
        '';


    aboutRichTextEditor =
        null;

},

async loadContentItems() {

    try {

        this.loadingContentItems =
            true;


        const response =
            await axios.get(
                '/admin/api/content/' +
                this.contentType
            );


        this.contentItems =
            response.data?.items || [];


    } catch (error) {

        console.error(
            'Load content items error:',
            error
        );


    } finally {

        this.loadingContentItems =
            false;

    }

},

openCreateContentItem() {

    this.editingContentItemId =
        null;


    this.contentForm = {

        title: ''

    };


    this.contentImageFile =
        null;


    this.contentImagePreview =
        '';


    this.removeCurrentContentImage =
        false;


    this.contentAttachmentFile =
        null;


    this.contentAttachmentName =
        '';


    this.removeCurrentContentAttachment =
        false;


    this.contentFormError =
        '';


    this.contentPageMode =
        'form';


    this.$nextTick(
        () => {

            contentRichTextEditor =
                createAdminRichTextEditor(
                    'contentRichTextEditor'
                );

        }
    );

},

openEditContentItem(item) {

    this.editingContentItemId =
        item.id;


    this.contentForm = {

        title:
            item.title || ''

    };


    this.contentImageFile =
        null;


    this.contentImagePreview =
        item.image || '';


    this.removeCurrentContentImage =
        false;


    this.contentAttachmentFile =
        null;


    this.contentAttachmentName =
        item.attachmentName || '';


    this.removeCurrentContentAttachment =
        false;


    this.contentFormError =
        '';


    this.contentPageMode =
        'form';


    this.$nextTick(
        () => {

            contentRichTextEditor =
                createAdminRichTextEditor(

                    'contentRichTextEditor',

                    item.content || ''

                );

        }
    );

},

handleContentImageChange(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    this.contentImageFile =
        file;


    this.removeCurrentContentImage =
        false;


    this.contentImagePreview =
        URL.createObjectURL(
            file
        );

},



removeContentImage() {

    this.contentImageFile =
        null;


    this.contentImagePreview =
        '';


    this.removeCurrentContentImage =
        true;

},

handleContentAttachmentChange(event) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    if (
        file.size >
        25 * 1024 * 1024
    ) {

        this.contentFormError =
            'Документот не смее да биде поголем од 25 MB.';

        event.target.value =
            '';

        return;

    }


    this.contentAttachmentFile =
        file;


    this.contentAttachmentName =
        file.name;


    this.removeCurrentContentAttachment =
        false;

},



removeContentAttachment() {

    this.contentAttachmentFile =
        null;


    this.contentAttachmentName =
        '';


    this.removeCurrentContentAttachment =
        true;

},

async saveContentItem() {

    if (this.savingContentItem) {
        return;
    }


    this.contentFormError =
        '';


    if (
        !this.contentForm.title.trim()
    ) {

        this.contentFormError =
            'Внесете наслов.';

        return;

    }


    try {

        this.savingContentItem =
            true;


        const formData =
            new FormData();


        formData.append(
            'title',
            this.contentForm.title
        );


        formData.append(
            'content',
            contentRichTextEditor
                ? contentRichTextEditor.root.innerHTML
                : ''
        );


        formData.append(
            'removeImage',
            String(
                this.removeCurrentContentImage
            )
        );


        formData.append(
            'removeAttachment',
            String(
                this.removeCurrentContentAttachment
            )
        );


        if (
            this.contentImageFile
        ) {

            formData.append(
                'image',
                this.contentImageFile
            );

        }


        if (
            this.contentAttachmentFile
        ) {

            formData.append(
                'attachment',
                this.contentAttachmentFile
            );

        }


        if (
            this.editingContentItemId
        ) {

            await axios.put(

                '/admin/api/content/' +
                this.contentType +
                '/' +
                this.editingContentItemId,

                formData

            );

        } else {

            await axios.post(

                '/admin/api/content/' +
                this.contentType,

                formData

            );

        }


        await this.loadContentItems();


        this.closeContentForm();


    } catch (error) {

        console.error(
            'Save content error:',
            error
        );


        this.contentFormError =
            error.response?.data?.message ||
            'Не може да се зачува содржината.';


    } finally {

        this.savingContentItem =
            false;

    }

},

async deleteContentItem(item) {

    const confirmed =
        window.confirm(
            'Дали сте сигурни дека сакате да избришете "' +
            item.title +
            '"?'
        );


    if (!confirmed) {
        return;
    }


    try {

        await axios.delete(

            '/admin/api/content/' +
            this.contentType +
            '/' +
            item.id

        );


        await this.loadContentItems();


    } catch (error) {

        console.error(
            'Delete content error:',
            error
        );

    }

},

closeContentForm() {

    this.contentPageMode =
        'list';


    this.editingContentItemId =
        null;


    this.contentImageFile =
        null;


    this.contentImagePreview =
        '';


    this.contentAttachmentFile =
        null;


    this.contentAttachmentName =
        '';


    this.contentFormError =
        '';


    contentRichTextEditor =
        null;

},

async loadPublicationLanding() {

    try {

        const response =
            await axios.get(
                '/admin/api/publication-landing'
            );


        const landing =
            response.data?.landing || {};


        this.publicationLanding =
            landing;


        this.publicationLandingPreviews = {

            publications:
                landing.publicationsImage || '',

            dialogues:
                landing.dialoguesImage || '',

            other:
                landing.otherContributionsImage || ''

        };


    } catch (error) {

        console.error(
            'Load publication landing error:',
            error
        );

    }

},

handlePublicationLandingImage(
    event,
    type
) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    this.publicationLandingFiles[
        type
    ] = file;


    this.publicationLandingPreviews[
        type
    ] = URL.createObjectURL(
        file
    );

},

async savePublicationLanding() {

    if (
        this.savingPublicationLanding
    ) {

        return;

    }


    try {

        this.savingPublicationLanding =
            true;


        const formData =
            new FormData();


        if (
            this.publicationLandingFiles
                .publications
        ) {

            formData.append(
                'publicationsImage',

                this.publicationLandingFiles
                    .publications
            );

        }


        if (
            this.publicationLandingFiles
                .dialogues
        ) {

            formData.append(
                'dialoguesImage',

                this.publicationLandingFiles
                    .dialogues
            );

        }


        if (
            this.publicationLandingFiles
                .other
        ) {

            formData.append(
                'otherContributionsImage',

                this.publicationLandingFiles
                    .other
            );

        }


        await axios.put(

            '/admin/api/publication-landing',

            formData

        );


        await this.loadPublicationLanding();


        this.publicationLandingFiles = {

            publications:
                null,

            dialogues:
                null,

            other:
                null

        };


    } catch (error) {

        console.error(
            'Save publication landing error:',
            error
        );


    } finally {

        this.savingPublicationLanding =
            false;

    }

},

    },

    mounted() {

        if (
            this.currentAdminPage ===
            'clenovi'
        ) {
    
            this.loadMembers();
    
        }
    
    
        if (
            this.currentAdminPage ===
            'za-mnd'
        ) {
    
            this.loadAboutPages();
    
        }

        if (
            this.currentAdminPage ===
            'publikacii'
        ) {
        
            this.loadPublicationLanding();
        
        }
    
    
        const contentPage =
            document.getElementById(
                'adminContentPage'
            );
    
    
        if (contentPage) {
    
            this.contentType =
                contentPage.dataset.contentType;
    
    
            this.loadContentItems();
    
        }
    
    }

});








const adminMountElement =
    document.getElementById(
        'adminApp'
    );


if (adminMountElement) {

    adminApp.mount(
        '#adminApp'
    );

}