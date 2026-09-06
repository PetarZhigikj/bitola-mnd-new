// =========================================================
// EMPTY FORM OBJECTS
// =========================================================

function createEmptyMember() {

    return {
        id: null,

        fullName: '',
        slug: '',

        academicTitle: '',

        shortBiography: '',
        biography: '',

        department: null,

        photo: null,
        photoPreview: null,

        cvPdf: null,
        cvPdfPreview: null,

        email: '',
        website: '',

        isCurrentMember: true,

        status: 'draft',

        legacyUrl: ''
    };
}


function createEmptyPost() {

    return {
        id: null,

        title: '',
        slug: '',

        type: 'news',

        excerpt: '',
        content: '',

        featuredImage: null,
        featuredImagePreview: null,

        eventStartAt: '',
        eventEndAt: '',
        eventLocation: '',

        status: 'draft',

        publishedAt: '',

        legacyUrl: '',

        seoTitle: '',
        seoDescription: ''
    };
}


function createEmptyDepartment() {

    return {
        id: null,

        name: '',
        slug: '',

        description: '',

        image: null,
        imagePreview: null,

        sortOrder: 0,

        isActive: true
    };
}



// =========================================================
// VUE ADMIN APP
// =========================================================

const adminApp = Vue.createApp({

    data() {

        return {

            // =================================================
            // GLOBAL
            // =================================================

            currentAdminPage:
                document.body.dataset.adminPage || '',

            loading: false,

            saving: false,

            adminMessage: '',

            adminMessageType: '',


            // =================================================
            // AUTH
            // =================================================

            loginForm: {
                email: '',
                password: ''
            },

            loginError: '',

            loggingIn: false,


            // =================================================
            // MEMBERS
            // =================================================

            members: [],

            memberPageMode: 'list',

            editingMember:
                createEmptyMember(),

            memberSearch: '',

            memberDepartmentFilter: '',

            memberStatusFilter: '',


            // =================================================
            // POSTS
            // =================================================

            posts: [],

            postPageMode: 'list',

            editingPost:
                createEmptyPost(),

            postSearch: '',

            postTypeFilter: '',

            postStatusFilter: '',


            // =================================================
            // DEPARTMENTS
            // =================================================

            departments: [],

            departmentPageMode: 'list',

            editingDepartment:
                createEmptyDepartment(),

            departmentSearch: '',


            // =================================================
            // MEDIA
            // =================================================

            mediaItems: [],

            mediaSearch: '',

            mediaTypeFilter: '',

            uploadingMedia: false

        };
    },



    // =====================================================
    // COMPUTED
    // =====================================================

    computed: {


        filteredMembers() {

            let members =
                [...this.members];


            if (this.memberSearch) {

                const search =
                    this.memberSearch
                        .trim()
                        .toLowerCase();


                members =
                    members.filter(member => {

                        const name =
                            member.fullName
                                ?.toLowerCase() ||
                            '';

                        const title =
                            member.academicTitle
                                ?.toLowerCase() ||
                            '';

                        return (
                            name.includes(search) ||
                            title.includes(search)
                        );
                    });
            }


            if (
                this.memberDepartmentFilter
            ) {

                members =
                    members.filter(member => {

                        const departmentId =
                            typeof member.department ===
                            'object'
                                ? member.department?.id
                                : member.department;


                        return (
                            String(departmentId) ===
                            String(
                                this.memberDepartmentFilter
                            )
                        );
                    });
            }


            if (
                this.memberStatusFilter
            ) {

                members =
                    members.filter(member =>
                        member.status ===
                        this.memberStatusFilter
                    );
            }


            return members;
        },



        filteredPosts() {

            let posts =
                [...this.posts];


            if (this.postSearch) {

                const search =
                    this.postSearch
                        .trim()
                        .toLowerCase();


                posts =
                    posts.filter(post =>

                        post.title
                            ?.toLowerCase()
                            .includes(search)

                    );
            }


            if (this.postTypeFilter) {

                posts =
                    posts.filter(post =>
                        post.type ===
                        this.postTypeFilter
                    );
            }


            if (this.postStatusFilter) {

                posts =
                    posts.filter(post =>
                        post.status ===
                        this.postStatusFilter
                    );
            }


            return posts;
        },



        filteredDepartments() {

            let departments =
                [...this.departments];


            if (this.departmentSearch) {

                const search =
                    this.departmentSearch
                        .trim()
                        .toLowerCase();


                departments =
                    departments.filter(
                        department =>

                            department.name
                                ?.toLowerCase()
                                .includes(search)
                    );
            }


            return departments;
        },



        filteredMedia() {

            let media =
                [...this.mediaItems];


            if (this.mediaSearch) {

                const search =
                    this.mediaSearch
                        .trim()
                        .toLowerCase();


                media =
                    media.filter(item =>

                        item.originalName
                            ?.toLowerCase()
                            .includes(search)

                    );
            }


            if (this.mediaTypeFilter) {

                media =
                    media.filter(item =>
                        item.type ===
                        this.mediaTypeFilter
                    );
            }


            return media;
        }

    },



    // =====================================================
    // METHODS
    // =====================================================

    methods: {


        // =================================================
        // GLOBAL HELPERS
        // =================================================

        showAdminMessage(
            message,
            type = 'success'
        ) {

            this.adminMessage =
                message;

            this.adminMessageType =
                type;


            setTimeout(() => {

                if (
                    this.adminMessage ===
                    message
                ) {
                    this.adminMessage = '';
                }

            }, 4000);
        },


        getErrorMessage(
            error,
            fallback = 'Something went wrong.'
        ) {

            return (
                error?.response?.data?.message ||
                fallback
            );
        },


        getMediaUrl(media) {

            if (!media) {
                return '';
            }

            if (
                typeof media === 'object'
            ) {
                return media.url || '';
            }

            return '';
        },



        // =================================================
        // AUTH
        // =================================================

        async adminLogin() {

            if (this.loggingIn) {
                return;
            }


            try {

                this.loggingIn = true;

                this.loginError = '';


                await axios.post(
                    '/admin/api/login',
                    {
                        email:
                            this.loginForm.email,

                        password:
                            this.loginForm.password
                    }
                );


                window.location.href =
                    '/admin';

            } catch (error) {

                this.loginError =
                    this.getErrorMessage(
                        error,
                        'Unable to log in.'
                    );

            } finally {

                this.loggingIn = false;
            }
        },


        async adminLogout() {

            try {

                await axios.post(
                    '/admin/api/logout'
                );

            } catch (error) {

                console.error(
                    'Logout error:',
                    error
                );

            } finally {

                window.location.href =
                    '/admin/login';
            }
        },



        // =================================================
        // MEMBERS
        // =================================================

        async loadMembers() {

            try {

                const response =
                    await axios.get(
                        '/admin/api/members'
                    );


                this.members =
                    response.data.members || [];

            } catch (error) {

                console.error(
                    'Error loading members:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to load members.'
                    ),
                    'error'
                );
            }
        },


        startCreateMember() {

            this.editingMember =
                createEmptyMember();

            this.memberPageMode =
                'form';
        },


        editMember(member) {

            this.editingMember = {

                ...member,

                department:
                    typeof member.department ===
                    'object'
                        ? member.department?.id || null
                        : member.department || null,

                photo:
                    typeof member.photo ===
                    'object'
                        ? member.photo?.id || null
                        : member.photo || null,

                photoPreview:
                    typeof member.photo ===
                    'object'
                        ? member.photo
                        : null,

                cvPdf:
                    typeof member.cvPdf ===
                    'object'
                        ? member.cvPdf?.id || null
                        : member.cvPdf || null,

                cvPdfPreview:
                    typeof member.cvPdf ===
                    'object'
                        ? member.cvPdf
                        : null

            };


            this.memberPageMode =
                'form';
        },


        cancelMemberEdit() {

            this.editingMember =
                createEmptyMember();

            this.memberPageMode =
                'list';
        },


        async saveMember() {

            if (this.saving) {
                return;
            }


            if (
                !this.editingMember.fullName
                    ?.trim()
            ) {

                this.showAdminMessage(
                    'Full name is required.',
                    'error'
                );

                return;
            }


            try {

                this.saving = true;


                if (
                    this.editingMember.id
                ) {

                    await axios.put(

                        `/admin/api/members/${this.editingMember.id}`,

                        this.editingMember
                    );


                    this.showAdminMessage(
                        'Member updated successfully.'
                    );

                } else {

                    await axios.post(
                        '/admin/api/members',
                        this.editingMember
                    );


                    this.showAdminMessage(
                        'Member created successfully.'
                    );
                }


                await this.loadMembers();


                this.cancelMemberEdit();

            } catch (error) {

                console.error(
                    'Error saving member:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to save member.'
                    ),
                    'error'
                );

            } finally {

                this.saving = false;
            }
        },


        async deleteMember(member) {

            const confirmed =
                window.confirm(
                    `Are you sure you want to delete "${member.fullName}"?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await axios.delete(
                    `/admin/api/members/${member.id}`
                );


                this.members =
                    this.members.filter(
                        item =>
                            item.id !== member.id
                    );


                this.showAdminMessage(
                    'Member deleted successfully.'
                );

            } catch (error) {

                console.error(
                    'Error deleting member:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to delete member.'
                    ),
                    'error'
                );
            }
        },



        // =================================================
        // POSTS
        // =================================================

        async loadPosts() {

            try {

                const response =
                    await axios.get(
                        '/admin/api/posts'
                    );


                this.posts =
                    response.data.posts || [];

            } catch (error) {

                console.error(
                    'Error loading posts:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to load posts.'
                    ),
                    'error'
                );
            }
        },


        startCreatePost() {

            this.editingPost =
                createEmptyPost();

            this.postPageMode =
                'form';
        },


        editPost(post) {

            this.editingPost = {

                ...post,

                featuredImage:
                    typeof post.featuredImage ===
                    'object'
                        ? post.featuredImage?.id || null
                        : post.featuredImage || null,

                featuredImagePreview:
                    typeof post.featuredImage ===
                    'object'
                        ? post.featuredImage
                        : null,

                eventStartAt:
                    this.formatDateForInput(
                        post.eventStartAt
                    ),

                eventEndAt:
                    this.formatDateForInput(
                        post.eventEndAt
                    ),

                publishedAt:
                    this.formatDateForInput(
                        post.publishedAt
                    )

            };


            this.postPageMode =
                'form';
        },


        cancelPostEdit() {

            this.editingPost =
                createEmptyPost();

            this.postPageMode =
                'list';
        },


        async savePost() {

            if (this.saving) {
                return;
            }


            if (
                !this.editingPost.title
                    ?.trim()
            ) {

                this.showAdminMessage(
                    'Post title is required.',
                    'error'
                );

                return;
            }


            try {

                this.saving = true;


                if (
                    this.editingPost.id
                ) {

                    await axios.put(

                        `/admin/api/posts/${this.editingPost.id}`,

                        this.editingPost
                    );


                    this.showAdminMessage(
                        'Post updated successfully.'
                    );

                } else {

                    await axios.post(
                        '/admin/api/posts',
                        this.editingPost
                    );


                    this.showAdminMessage(
                        'Post created successfully.'
                    );
                }


                await this.loadPosts();


                this.cancelPostEdit();

            } catch (error) {

                console.error(
                    'Error saving post:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to save post.'
                    ),
                    'error'
                );

            } finally {

                this.saving = false;
            }
        },


        async deletePost(post) {

            const confirmed =
                window.confirm(
                    `Are you sure you want to delete "${post.title}"?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await axios.delete(
                    `/admin/api/posts/${post.id}`
                );


                this.posts =
                    this.posts.filter(
                        item =>
                            item.id !== post.id
                    );


                this.showAdminMessage(
                    'Post deleted successfully.'
                );

            } catch (error) {

                console.error(
                    'Error deleting post:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to delete post.'
                    ),
                    'error'
                );
            }
        },



        // =================================================
        // DEPARTMENTS
        // =================================================

        async loadDepartments() {

            try {

                const response =
                    await axios.get(
                        '/admin/api/departments'
                    );


                this.departments =
                    response.data.departments ||
                    [];

            } catch (error) {

                console.error(
                    'Error loading departments:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to load departments.'
                    ),
                    'error'
                );
            }
        },


        startCreateDepartment() {

            this.editingDepartment =
                createEmptyDepartment();

            this.departmentPageMode =
                'form';
        },


        editDepartment(department) {

            this.editingDepartment = {

                ...department,

                image:
                    typeof department.image ===
                    'object'
                        ? department.image?.id ||
                          null
                        : department.image ||
                          null,

                imagePreview:
                    typeof department.image ===
                    'object'
                        ? department.image
                        : null

            };


            this.departmentPageMode =
                'form';
        },


        cancelDepartmentEdit() {

            this.editingDepartment =
                createEmptyDepartment();

            this.departmentPageMode =
                'list';
        },


        async saveDepartment() {

            if (this.saving) {
                return;
            }


            if (
                !this.editingDepartment.name
                    ?.trim()
            ) {

                this.showAdminMessage(
                    'Department name is required.',
                    'error'
                );

                return;
            }


            try {

                this.saving = true;


                if (
                    this.editingDepartment.id
                ) {

                    await axios.put(

                        `/admin/api/departments/${this.editingDepartment.id}`,

                        this.editingDepartment
                    );


                    this.showAdminMessage(
                        'Department updated successfully.'
                    );

                } else {

                    await axios.post(
                        '/admin/api/departments',
                        this.editingDepartment
                    );


                    this.showAdminMessage(
                        'Department created successfully.'
                    );
                }


                await this.loadDepartments();


                this.cancelDepartmentEdit();

            } catch (error) {

                console.error(
                    'Error saving department:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to save department.'
                    ),
                    'error'
                );

            } finally {

                this.saving = false;
            }
        },


        async deleteDepartment(
            department
        ) {

            const confirmed =
                window.confirm(
                    `Are you sure you want to delete "${department.name}"?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await axios.delete(
                    `/admin/api/departments/${department.id}`
                );


                this.departments =
                    this.departments.filter(
                        item =>
                            item.id !==
                            department.id
                    );


                this.showAdminMessage(
                    'Department deleted successfully.'
                );

            } catch (error) {

                console.error(
                    'Error deleting department:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to delete department.'
                    ),
                    'error'
                );
            }
        },



        // =================================================
        // MEDIA
        // =================================================

        async loadMedia() {

            try {

                const response =
                    await axios.get(
                        '/admin/api/media'
                    );


                this.mediaItems =
                    response.data.media || [];

            } catch (error) {

                console.error(
                    'Error loading media:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to load media.'
                    ),
                    'error'
                );
            }
        },


        async uploadMedia(file) {

            if (!file) {
                return null;
            }


            try {

                this.uploadingMedia = true;


                const formData =
                    new FormData();


                formData.append(
                    'file',
                    file
                );


                const response =
                    await axios.post(
                        '/admin/api/media/upload',
                        formData
                    );


                const media =
                    response.data.media;


                if (media) {

                    this.mediaItems.unshift(
                        media
                    );
                }


                return media;

            } catch (error) {

                console.error(
                    'Media upload error:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to upload file.'
                    ),
                    'error'
                );


                return null;

            } finally {

                this.uploadingMedia = false;
            }
        },


        async uploadMediaFromInput(
            event
        ) {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            const media =
                await this.uploadMedia(file);


            if (media) {

                this.showAdminMessage(
                    'File uploaded successfully.'
                );
            }


            event.target.value = '';
        },


        async deleteMedia(media) {

            const confirmed =
                window.confirm(
                    `Delete "${media.originalName}"?`
                );


            if (!confirmed) {
                return;
            }


            try {

                await axios.delete(
                    `/admin/api/media/${media.id}`
                );


                this.mediaItems =
                    this.mediaItems.filter(
                        item =>
                            item.id !== media.id
                    );


                this.showAdminMessage(
                    'File deleted successfully.'
                );

            } catch (error) {

                console.error(
                    'Error deleting media:',
                    error
                );


                this.showAdminMessage(
                    this.getErrorMessage(
                        error,
                        'Failed to delete file.'
                    ),
                    'error'
                );
            }
        },



        // =================================================
        // FORM MEDIA UPLOADS
        // =================================================

        async uploadMemberPhoto(
            event
        ) {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            const media =
                await this.uploadMedia(file);


            if (!media) {
                return;
            }


            this.editingMember.photo =
                media.id;

            this.editingMember.photoPreview =
                media;


            event.target.value = '';
        },


        async uploadMemberCv(
            event
        ) {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            const media =
                await this.uploadMedia(file);


            if (!media) {
                return;
            }


            this.editingMember.cvPdf =
                media.id;

            this.editingMember.cvPdfPreview =
                media;


            event.target.value = '';
        },


        removeMemberPhoto() {

            this.editingMember.photo =
                null;

            this.editingMember.photoPreview =
                null;
        },


        removeMemberCv() {

            this.editingMember.cvPdf =
                null;

            this.editingMember.cvPdfPreview =
                null;
        },


        async uploadPostImage(
            event
        ) {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            const media =
                await this.uploadMedia(file);


            if (!media) {
                return;
            }


            this.editingPost.featuredImage =
                media.id;

            this.editingPost.featuredImagePreview =
                media;


            event.target.value = '';
        },


        removePostImage() {

            this.editingPost.featuredImage =
                null;

            this.editingPost.featuredImagePreview =
                null;
        },


        async uploadDepartmentImage(
            event
        ) {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            const media =
                await this.uploadMedia(file);


            if (!media) {
                return;
            }


            this.editingDepartment.image =
                media.id;

            this.editingDepartment.imagePreview =
                media;


            event.target.value = '';
        },


        removeDepartmentImage() {

            this.editingDepartment.image =
                null;

            this.editingDepartment.imagePreview =
                null;
        },



        // =================================================
        // DATE HELPERS
        // =================================================

        formatDateForInput(value) {

            if (!value) {
                return '';
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return '';
            }


            const pad = number =>
                String(number).padStart(
                    2,
                    '0'
                );


            return (
                `${date.getFullYear()}-` +
                `${pad(date.getMonth() + 1)}-` +
                `${pad(date.getDate())}T` +
                `${pad(date.getHours())}:` +
                `${pad(date.getMinutes())}`
            );
        }

    },



    // =====================================================
    // MOUNTED
    // =====================================================

    async mounted() {

        try {

            switch (
                this.currentAdminPage
            ) {

                case 'login':

                    break;


                case 'members':

                    await Promise.all([
                        this.loadMembers(),
                        this.loadDepartments()
                    ]);

                    break;


                case 'posts':

                    await this.loadPosts();

                    break;


                case 'departments':

                    await this.loadDepartments();

                    break;


                case 'media':

                    await this.loadMedia();

                    break;


                case 'dashboard':

                    break;


                case 'centers':

                    break;


                case 'publications':

                    break;


                case 'journal':

                    break;


                case 'pages':

                    break;


                case 'redirects':

                    break;


                case 'settings':

                    break;

            }

        } catch (error) {

            console.error(
                'Admin initialization error:',
                error
            );
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