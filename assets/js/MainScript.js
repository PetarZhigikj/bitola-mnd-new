const mainApp = Vue.createApp({

    data() {

        return {

            homeNews: [],


            /* =============================================
               GENERAL
            ============================================= */

            currentPage:
                document.body.dataset.page || '',

            loading: false,



            /* =============================================
               HEADER / MOBILE MENU
            ============================================= */

            mobileMenuOpen: false,

            searchOpen: false,

            searchQuery: '',



            /* =============================================
               HOMEPAGE
            ============================================= */

            homepageLoading: false,

            homepageLoaded: false,

            homepageData: {

                featuredPost: null,

                featuredJournalIssue: null,

                departments: [],

                latestPosts: [],

                featuredPosts: [],

                statistics: {
                    members: 0,
                    departments: 0,
                    publications: 0,
                    years: 0
                }

            },



            /* =============================================
               DEPARTMENT SLIDER
            ============================================= */


            departments: [

                {
                    name: 'Одделение за општествени науки',
            
                    slug: 'opstestveni-nauki',
            
                    icon: 'bx bx-group',
            
                    description:
                        'Ги обединува истражувањата од областа на општеството, економијата, образованието, психологијата и современите општествени процеси.',
            
                    url:
                        '/departments/opstestveni-nauki'
                },
            
            
                {
                    name: 'Одделение за правни науки',
            
                    slug: 'pravni-nauki',
            
                    icon: 'bx bx-book-open',
            
                    description:
                        'Посветено на проучување на правото, правните системи, институциите и нивната улога во развојот на современото општество.',
            
                    url:
                        '/departments/pravni-nauki'
                },
            
            
                {
                    name: 'Одделение за природни науки',
            
                    slug: 'prirodni-nauki',
            
                    icon: 'bx bx-leaf',
            
                    description:
                        'Ги опфаќа научните истражувања поврзани со природата, животната средина, биологијата и останатите природни дисциплини.',
            
                    url:
                        '/departments/prirodni-nauki'
                },
            
            
                {
                    name:
                        'Одделение за применети науки и медицина',
            
                    slug:
                        'primeneti-nauki-i-medicina',
            
                    icon:
                        'bx bx-plus-medical',
            
                    description:
                        'Ги поврзува научните сознанија со нивната практична примена во медицината, здравството и другите применети научни области.',
            
                    url:
                        '/departments/primeneti-nauki-i-medicina'
                },
            
            
                {
                    name: 'Одделение за технички науки',
            
                    slug: 'tehnicki-nauki',
            
                    icon: 'bx bx-cog',
            
                    description:
                        'Фокусирано на инженерството, технологијата, информатиката и развојот на современи технички и иновативни решенија.',
            
                    url:
                        '/departments/tehnicki-nauki'
                },
            
            
                {
                    name: 'Одделение за уметност',
            
                    slug: 'umetnost',
            
                    icon: 'bx bx-palette',
            
                    description:
                        'Го негува истражувањето и развојот на визуелната, музичката, сценската и другите форми на уметничко творештво.',
            
                    url:
                        '/departments/umetnost'
                },
            
            
                {
                    name:
                        'Одделение за лингвистика и литература',
            
                    slug:
                        'lingvistika-i-literatura',
            
                    icon:
                        'bx bx-book-reader',
            
                    description:
                        'Посветено на јазикот, книжевноста и нивното историско и современо значење во македонската и пошироката културна средина.',
            
                    url:
                        '/departments/lingvistika-i-literatura'
                },
            
            
                {
                    name:
                        'Одделение за историско-географски науки',
            
                    slug:
                        'istorisko-geografski-nauki',
            
                    icon:
                        'bx bx-map-alt',
            
                    description:
                        'Го проучува историското наследство, географските процеси и развојот на Битола, Македонија и поширокиот регион.',
            
                    url:
                        '/departments/istorisko-geografski-nauki'
                }
            
            ],
            
            
            departmentSlide: 0,
            
            departmentsPerSlide: 4,

            contactForm: {

                subject: '',
            
                name: '',
            
                contact: '',
            
                message: '',
            
                website: ''
            
            },
            
            
            sendingContactForm:
                false,
            
            
            contactFormError:
                '',
            
            
            contactFormSuccess:
                '',

        };

    },



    computed: {

        visibleDepartments() {

            const start =
                this.departmentSlide *
                this.departmentsPerSlide;
        
        
            return this.departments.slice(
                start,
                start + this.departmentsPerSlide
            );
        
        },
        
        
        departmentSlideCount() {
        
            return Math.ceil(
                this.departments.length /
                this.departmentsPerSlide
            );
        
        },

        /* =============================================
           HOMEPAGE DEPARTMENTS
        ============================================= */


    },



    methods: {

        formatNewsDate(value) {

            if (!value) {
                return '';
            }
        
        
            const date =
                new Date(value);
        
        
            return date.toLocaleDateString(
                'mk-MK',
                {
        
                    day:
                        '2-digit',
        
                    month:
                        '2-digit',
        
                    year:
                        'numeric'
        
                }
            );
        
        },

        

        nextDepartmentSlide() {

            if (
                this.departmentSlide <
                this.departmentSlideCount - 1
            ) {
        
                this.departmentSlide++;
        
            } else {
        
                this.departmentSlide = 0;
        
            }
        
        },
        
        
        previousDepartmentSlide() {
        
            if (this.departmentSlide > 0) {
        
                this.departmentSlide--;
        
            } else {
        
                this.departmentSlide =
                    this.departmentSlideCount - 1;
        
            }
        
        },
        
        
        setDepartmentSlide(index) {
        
            if (
                index < 0 ||
                index >= this.departmentSlideCount
            ) {
                return;
            }
        
            this.departmentSlide = index;
        
        },
        
        
        updateDepartmentsPerSlide() {
        
            const width =
                window.innerWidth;
        
        
            let perSlide = 4;
        
        
            if (width <= 768) {
        
                perSlide = 1;
        
            } else if (width <= 1200) {
        
                perSlide = 2;
        
            }
        
        
            if (
                this.departmentsPerSlide !==
                perSlide
            ) {
        
                this.departmentsPerSlide =
                    perSlide;
        
                this.departmentSlide = 0;
        
            }
        
        },

        /* =============================================
           GENERAL
        ============================================= */

        getErrorMessage(error) {

            return (
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong.'
            );

        },



        /* =============================================
           HEADER
        ============================================= */

        toggleMobileMenu() {

            this.mobileMenuOpen =
                !this.mobileMenuOpen;

        },


        closeMobileMenu() {

            this.mobileMenuOpen = false;

        },


        toggleSearch() {

            this.searchOpen =
                !this.searchOpen;

        },


        submitSearch() {

            const query =
                this.searchQuery.trim();

            if (!query) {
                return;
            }

            window.location.href =
                '/search?q=' +
                encodeURIComponent(query);

        },



        /* =============================================
           HOMEPAGE
        ============================================= */

        async loadHomepage() {

            if (this.homepageLoading) {
                return;
            }

            try {

                this.homepageLoading = true;


                const response =
                    await axios.get(
                        '/api/homepage'
                    );


                if (response.data?.success) {

                    this.homepageData = {
                        ...this.homepageData,
                        ...response.data.data
                    };

                }


                this.homepageLoaded = true;

            } catch (error) {

                console.error(
                    'Error loading homepage:',
                    this.getErrorMessage(error)
                );

            } finally {

                this.homepageLoading = false;

            }

        },



        /* =============================================
           DEPARTMENT SLIDER
        ============================================= */






        /* =============================================
           HELPERS
        ============================================= */

        getMediaUrl(media) {

            if (!media) {
                return '';
            }

            if (typeof media === 'string') {
                return media;
            }

            return media.url || '';

        },


        formatDate(date) {

            if (!date) {
                return '';
            }

            const parsed =
                new Date(date);

            if (
                Number.isNaN(
                    parsed.getTime()
                )
            ) {
                return '';
            }

            return new Intl.DateTimeFormat(
                'mk-MK',
                {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }
            ).format(parsed);

        },


        goTo(url) {

            if (!url) {
                return;
            }

            window.location.href = url;

        },
        
        async submitContactForm() {

            if (
                this.sendingContactForm
            ) {
        
                return;
        
            }
        
        
            this.contactFormError =
                '';
        
            this.contactFormSuccess =
                '';
        
        
            if (
                !this.contactForm.subject.trim() ||
                !this.contactForm.name.trim() ||
                !this.contactForm.contact.trim() ||
                !this.contactForm.message.trim()
            ) {
        
                this.contactFormError =
                    'Ве молиме пополнете ги сите полиња.';
        
                return;
        
            }
        
        
            try {
        
                this.sendingContactForm =
                    true;
        
        
                const response =
                    await axios.post(
                        '/api/contact',
                        this.contactForm
                    );
        
        
                if (
                    response.data?.success
                ) {
        
                    this.contactFormSuccess =
                        response.data.message ||
                        'Пораката е успешно испратена.';
        
        
                    this.contactForm = {
        
                        subject: '',
        
                        name: '',
        
                        contact: '',
        
                        message: '',
        
                        website: ''
        
                    };
        
                }
        
        
            } catch (error) {
        
                console.error(
                    'Contact form error:',
                    error
                );
        
        
                this.contactFormError =
                    error.response?.data?.message ||
                    'Пораката не може да се испрати.';
        
            } finally {
        
                this.sendingContactForm =
                    false;
        
            }
        
        },

        async loadHomeNews() {

            try {
        
                const response =
                    await axios.get(
                        '/api/home-news'
                    );
        
        
                if (
                    response.data?.success
                ) {
        
                    this.homeNews =
                        response.data.news || [];
        
                }
        
        
            } catch (error) {
        
                console.error(
                    'Error loading home news:',
                    error
                );
        
                this.homeNews =
                    [];
        
            }
        
        },

    },



    mounted() {

        console.log(
            'Main website Vue mounted:',
            this.currentPage
        );
    
    
        if (
            this.currentPage === 'home'
        ) {
    
            this.updateDepartmentsPerSlide();

            this.loadHomeNews()
    
    
            window.addEventListener(
                'resize',
                this.updateDepartmentsPerSlide
            );
    
        }
    
    },

    beforeUnmount() {

        window.removeEventListener(
            'resize',
            this.updateDepartmentsPerSlide
        );
    
    },
});


const mainMountElement =
    document.getElementById(
        'mainApp'
    );


if (mainMountElement) {

    mainApp.mount(
        '#mainApp'
    );

}