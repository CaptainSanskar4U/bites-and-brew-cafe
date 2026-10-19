/* ═══════════════════════════════════════════════════════════════════
   BITES & BREW — THE FUSION CAFÉ
   Motion Architecture, GSAP Systems & Dynamic Interactions
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. GSAP REGISTRATION & ACCESSIBILITY ────────────────────────
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── 2. PRELOADER & COUNTER ──────────────────────────────────────
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        const counter = document.getElementById('preloader-counter');
        const bar = document.getElementById('preloader-bar');

        if (!preloader) return;

        if (prefersReducedMotion) {
            preloader.style.display = 'none';
            document.body.classList.remove('is-loading');
            document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-inview'));
            initHeroElements();
            return;
        }

        document.body.classList.add('is-loading');

        // Robust Failsafe: Automatically dismiss preloader if script hangs or network lags
        const failsafeTimer = setTimeout(() => {
            if (preloader && preloader.style.display !== 'none') {
                preloader.style.display = 'none';
                document.body.classList.remove('is-loading');
                document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-inview'));
                initHeroEntrance();
                initScrollAnimations();
            }
        }, 2200);

        let count = { val: 0 };
        const tl = gsap.timeline({
            onComplete: () => {
                clearTimeout(failsafeTimer);
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 0.9,
                    ease: 'expo.inOut',
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.classList.remove('is-loading');
                        initHeroEntrance();
                        initScrollAnimations();
                    }
                });
            }
        });

        tl.to(count, {
            val: 100,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
                const current = Math.floor(count.val);
                if (counter) counter.textContent = (current < 10 ? '0' : '') + current + '%';
                if (bar) bar.style.width = current + '%';
            }
        });
    }

    // ─── 3. HERO ENTRANCE & PARALLAX ────────────────────────────────
    function initHeroEntrance() {
        const words = document.querySelectorAll('.word-split');
        const heroElems = document.querySelectorAll('[data-hero-elem]');
        const heroImg = document.getElementById('hero-img-scale');
        const floatingCard = document.getElementById('hero-floating-card');

        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

        // Background zoom out smoothly
        if (heroImg) {
            tl.to(heroImg, {
                scale: 1,
                duration: 2.2,
                ease: 'expo.out'
            }, 0);
        }

        // Split words staggered reveal
        if (words.length) {
            tl.from(words, {
                y: 100,
                opacity: 0,
                rotateZ: 2,
                duration: 1.3,
                stagger: 0.05,
                ease: 'expo.out'
            }, 0.2);
        }

        // Subtitle, buttons and meta strip
        if (heroElems.length) {
            tl.from(heroElems, {
                y: 35,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: 'expo.out'
            }, 0.6);
        }

        // Floating specialty card
        if (floatingCard) {
            tl.from(floatingCard, {
                x: 60,
                opacity: 0,
                duration: 1.2,
                ease: 'expo.out'
            }, 0.8);
        }

        // ScrollTrigger Parallax on Hero elements
        if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
            gsap.to(heroImg, {
                yPercent: 18,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });

            gsap.to('.hero_inner', {
                yPercent: -15,
                opacity: 0.1,
                ease: 'none',
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: '75% top',
                    scrub: true
                }
            });
        }
    }

    function initHeroElements() {
        const heroImg = document.getElementById('hero-img-scale');
        if (heroImg) heroImg.style.transform = 'scale(1)';
    }

    // ─── 4. CUSTOM FLUID CURSOR & MAGNETIC PULL ─────────────────────
    function initCustomCursor() {
        if (prefersReducedMotion) return;

        const cursor = document.getElementById('custom-cursor');
        const follower = document.getElementById('cursor-follower');
        const label = document.getElementById('cursor-label');

        if (!cursor || !follower) return;

        // Turn off custom cursor on touch screens, coarse pointers, trackpads & mobile screens
        const isTouchOrMobile = window.matchMedia('(pointer: coarse)').matches ||
                                window.matchMedia('(hover: none)').matches ||
                                ('ontouchstart' in window) ||
                                (navigator.maxTouchPoints > 0) ||
                                (window.innerWidth <= 992);

        if (isTouchOrMobile) {
            cursor.style.display = 'none';
            follower.style.display = 'none';
            return;
        }

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        let followerX = mouseX;
        let followerY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        function renderCursor() {
            // Smooth lerp
            cursorX += (mouseX - cursorX) * 0.45;
            cursorY += (mouseY - cursorY) * 0.45;
            followerX += (mouseX - followerX) * 0.16;
            followerY += (mouseY - followerY) * 0.16;

            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
            follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;

            requestAnimationFrame(renderCursor);
        }
        renderCursor();

        // Cursor interactive targets
        document.querySelectorAll('[data-cursor]').forEach(elem => {
            const mode = elem.getAttribute('data-cursor');
            elem.addEventListener('mouseenter', () => {
                if (mode === 'hover') {
                    document.body.classList.add('cursor-hover');
                } else if (mode === 'explore') {
                    document.body.classList.add('cursor-explore');
                    if (label) label.textContent = 'TASTE';
                } else if (mode === 'view') {
                    document.body.classList.add('cursor-view');
                    if (label) label.textContent = 'EXPAND';
                }
            });
            elem.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover', 'cursor-explore', 'cursor-view');
                if (label) label.textContent = '';
            });
        });

        // Magnetic Pull on Buttons
        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, {
                    x: x * 0.28,
                    y: y * 0.28,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.4)'
                });
            });
        });
    }

    // ─── 5. SCROLL TRIGGER REVEALS & NUMBER ROLLUPS ─────────────────
    function initScrollAnimations() {
        if (prefersReducedMotion || typeof ScrollTrigger === 'undefined') {
            document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-inview'));
            document.querySelectorAll('.stat-number').forEach(stat => {
                stat.textContent = stat.getAttribute('data-target') || stat.textContent;
            });
            return;
        }

        // Reveal elements when in view
        const revealElements = document.querySelectorAll('[data-reveal]');
        revealElements.forEach(el => {
            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                    el.classList.add('is-inview');
                }
            });
        });

        // Story Image Parallax
        const storyImg = document.querySelector('.story_showcase-img');
        if (storyImg) {
            gsap.to(storyImg, {
                yPercent: -12,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.frame--primary',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // Stats Rollup Numbers
        const statsStrip = document.getElementById('stats-strip');
        if (statsStrip) {
            ScrollTrigger.create({
                trigger: statsStrip,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    document.querySelectorAll('.stat-number').forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-target'), 10) || 0;
                        const obj = { val: 0 };
                        gsap.to(obj, {
                            val: target,
                            duration: 1.8,
                            ease: 'power2.out',
                            onUpdate: () => {
                                stat.textContent = Math.floor(obj.val);
                            }
                        });
                    });
                }
            });
        }
    }

    // ─── 6. MENU CATEGORY FILTERING & 3D TILT ───────────────────────
    function initMenuInteractions() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        const menuCards = document.querySelectorAll('.menu-card');

        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.getAttribute('data-filter');

                filterTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');

                menuCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (category === 'all' || cardCategory === category) {
                        gsap.to(card, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.45,
                            ease: 'power2.out',
                            onStart: () => { card.style.display = 'flex'; }
                        });
                    } else {
                        gsap.to(card, {
                            opacity: 0,
                            scale: 0.94,
                            duration: 0.35,
                            ease: 'power2.in',
                            onComplete: () => { card.style.display = 'none'; }
                        });
                    }
                });
            });
        });

        // 3D Tilt on Hover for Cards
        if (!prefersReducedMotion && window.innerWidth > 992) {
            menuCards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const rotateX = ((y - centerY) / centerY) * -7;
                    const rotateY = ((x - centerX) / centerX) * 7;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
                });
            });
        }
    }

    // ─── 7. DAY & NIGHT TEMPO / AMBIANCE SWITCHER ───────────────────
    function initVibeSwitcher() {
        const phaseBtns = document.querySelectorAll('.phase-btn');
        const vibeImg = document.getElementById('vibe-img');
        const vibeTitle = document.getElementById('vibe-title');
        const vibeQuote = document.getElementById('vibe-quote');
        const traitLight = document.getElementById('trait-light');
        const traitSound = document.getElementById('trait-sound');
        const traitSpecial = document.getElementById('trait-special');

        const vibeData = {
            morning: {
                title: 'Chapter I: Morning Clarity',
                img: 'MOreCafePhtos/fmaous.jpg',
                quote: '“A chalkboard greeting reminds you that coffee is always a good idea. Sunlight filters across bamboo finishes as single-origin espresso beans are ground to perfection for the day\'s first pour.”',
                light: 'Soft Morning Natural + Low Edison',
                sound: 'Acoustic Lo-fi & Espresso Grinds',
                special: 'Hand-Poured Cortado & Fresh Paninis'
            },
            afternoon: {
                title: 'Chapter II: Fusion Rush',
                img: 'MOreCafePhtos/dfsdhgjk.jpg',
                quote: '“The café hums with creative energy. Sizzling loaded mozzarella fries, bubbling stone skillet pizzas, and chilled 48-hour cold brew tonics fuel spontaneous gatherings and lively discussions.”',
                light: 'Warm Ambient Glow & High Energy',
                sound: 'Downtempo Beats & Café Chatter',
                special: 'Stone Skillet Pizza & Loaded Fries'
            },
            evening: {
                title: 'Chapter III: Golden Twilight',
                img: 'MOreCafePhtos/c1.jpg',
                quote: '“Filament Edison bulbs dim to an intimate amber. Vintage jazz murmurs across maroon velvet armchairs as Belgian chocolate tarts and Lotus Biscoff cheesecakes are served on gold pedestals.”',
                light: 'Candlelight & Deep Amber Edison',
                sound: 'Vintage Jazz & Ambient Resonance',
                special: 'Lotus Biscoff & Gold Ganache Platter'
            }
        };

        phaseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const phase = btn.getAttribute('data-phase');
                const data = vibeData[phase];
                if (!data) return;

                phaseBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Smooth fade transition
                const card = document.getElementById('vibe-card');
                if (card) {
                    gsap.to(card, {
                        opacity: 0.6,
                        duration: 0.25,
                        onComplete: () => {
                            if (vibeImg) vibeImg.src = data.img;
                            if (vibeTitle) vibeTitle.textContent = data.title;
                            if (vibeQuote) vibeQuote.textContent = data.quote;
                            if (traitLight) traitLight.textContent = data.light;
                            if (traitSound) traitSound.textContent = data.sound;
                            if (traitSpecial) traitSpecial.textContent = data.special;

                            gsap.to(card, { opacity: 1, duration: 0.35 });
                        }
                    });
                }
            });
        });
    }

    // ─── 8. CURATED MOSAIC GALLERY & MENU LIGHTBOX ───────────────────
    function initGalleryLightbox() {
        const tiles = document.querySelectorAll('.gallery_mosaic-layout .tile, .gallery-tile');
        const menuCards = document.querySelectorAll('.menu-card');
        const modal = document.getElementById('lightbox-modal');
        const modalImg = document.getElementById('lightbox-img');
        const modalCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.getElementById('lightbox-close');
        const backdrop = document.getElementById('lightbox-backdrop');

        if (!modal) return;

        function openLightbox(imgSrc, caption) {
            if (modalImg) modalImg.src = imgSrc;
            if (modalCaption) modalCaption.textContent = caption || '';
            modal.classList.add('is-active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            modal.classList.remove('is-active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        tiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const imgSrc = tile.getAttribute('data-img') || tile.querySelector('img')?.src;
                const caption = tile.getAttribute('data-caption') || tile.querySelector('.tile_name')?.textContent;
                if (imgSrc) openLightbox(imgSrc, caption);
            });
        });

        // Click any menu card to open high-definition view
        menuCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('button')) return;
                const img = card.querySelector('.menu-card_img');
                const title = card.querySelector('.menu-card_title')?.textContent?.trim() || '';
                const price = card.querySelector('.menu-card_price')?.textContent?.trim() || '';
                const desc = card.querySelector('.menu-card_desc')?.textContent?.trim() || '';
                const caption = `${title} ${price ? '— ' + price : ''}${desc ? ' • ' + desc : ''}`;
                if (img && img.src) openLightbox(img.src, caption);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (backdrop) backdrop.addEventListener('click', closeLightbox);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                closeLightbox();
            }
        });
    }

    // ─── 9. TOAST NOTIFICATIONS & COPY ADDRESS ──────────────────────
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        const toastMsg = document.getElementById('toast-message');
        if (!toast) return;

        if (toastMsg) toastMsg.textContent = message;
        toast.classList.add('is-show');

        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove('is-show');
        }, 3200);
    }

    function initAddressCopy() {
        const copyBtn = document.getElementById('copy-address-btn');
        if (!copyBtn) return;

        copyBtn.addEventListener('click', () => {
            const address = "Shop 4/5/6, Everest Heights, Parsik Hill, Sector 26, CBD Belapur, Navi Mumbai, Maharashtra 400614";
            navigator.clipboard.writeText(address).then(() => {
                showToast("Address copied to clipboard! See you soon.");
            }).catch(() => {
                showToast("Address: Everest Heights, Parsik Hill, CBD Belapur");
            });
        });
    }

    // ─── 10. RESERVATION MODAL & FORMS ──────────────────────────────
    function initReservationModal() {
        const modal = document.getElementById('reservation-modal');
        const openBtns = [
            document.getElementById('open-reserve-btn'),
            document.getElementById('mobile-reserve-trigger'),
            document.getElementById('grand-reserve-btn')
        ];
        const closeBtn = document.getElementById('reserve-modal-close');
        const backdrop = document.getElementById('reserve-modal-backdrop');
        const modalForm = document.getElementById('modal-reserve-form');
        const rsvpForm = document.getElementById('rsvp-form');

        // Restrict reservation date to today or future
        const todayIso = new Date().toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.min = todayIso;
            if (!input.value) input.value = todayIso;
        });

        function openModal() {
            if (!modal) return;
            modal.classList.add('is-active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            if (!modal) return;
            modal.classList.remove('is-active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        openBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', openModal);
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
                closeModal();
            }
        });

        // Handle inline RSVP form
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                showToast("✦ Table requested! Confirmation sent to your phone.");
                rsvpForm.reset();
            });
        }

        // Handle modal reservation form
        if (modalForm) {
            modalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                closeModal();
                showToast("✦ Reservation confirmed! We have prepared your table.");
                modalForm.reset();
            });
        }

        // Newsletter form
        const newsForm = document.getElementById('newsletter-form');
        const newsMsg = document.getElementById('newsletter-msg');
        if (newsForm) {
            newsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (newsMsg) newsMsg.textContent = "Welcome to the Tasting Circle ✦ Private invite sent.";
                newsForm.reset();
            });
        }
    }

    // ─── 10B. AUTHENTIC MENU BOARD MODAL ────────────────────────────
    function initMenuBoardModal() {
        const modal = document.getElementById('menu-board-modal');
        const trigger = document.getElementById('view-menu-board-btn');
        const closeBtn = document.getElementById('menu-board-close');
        const backdrop = document.getElementById('menu-board-backdrop');

        if (!modal) return;

        function openModal() {
            modal.classList.add('is-active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('is-active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        if (trigger) trigger.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                closeModal();
            }
        });
    }

    // ─── 11. STICKY HEADER, SCROLLSPY & MOBILE DRAWER ─────────────
    function initHeaderAndNav() {
        const header = document.getElementById('site-header');
        const burger = document.getElementById('burger-btn');
        const drawer = document.getElementById('mobile-drawer');
        const drawerClose = document.getElementById('drawer-close');
        const drawerBackdrop = document.getElementById('drawer-backdrop');
        const mobileLinks = document.querySelectorAll('[data-mobile-item]');
        const navLinks = document.querySelectorAll('.nav_link');

        // Header auto hide on scroll down, show on scroll up
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (currentScroll > 120 && currentScroll > lastScroll) {
                header?.classList.add('is-hidden');
            } else {
                header?.classList.remove('is-hidden');
            }
            lastScroll = currentScroll;
        }, { passive: true });

        // Drawer open/close
        function openDrawer() {
            drawer?.classList.add('is-open');
            drawer?.setAttribute('aria-hidden', 'false');
            burger?.classList.add('is-active');
            burger?.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            drawer?.classList.remove('is-open');
            drawer?.setAttribute('aria-hidden', 'true');
            burger?.classList.remove('is-active');
            burger?.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        if (burger) burger.addEventListener('click', openDrawer);
        if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
        if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

        mobileLinks.forEach(link => {
            link.addEventListener('click', closeDrawer);
        });

        // Smooth scrolling for internal anchor links with fixed header offset
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const targetElem = document.querySelector(targetId);
                if (targetElem) {
                    e.preventDefault();
                    closeDrawer();
                    const headerOffset = 78;
                    const elemPosition = targetElem.getBoundingClientRect().top;
                    const offsetPosition = elemPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: prefersReducedMotion ? 'auto' : 'smooth'
                    });
                }
            });
        });

        // Dynamic ScrollSpy
        const sections = [
            document.getElementById('hero'),
            document.getElementById('story'),
            document.getElementById('menu'),
            document.getElementById('vibe'),
            document.getElementById('gallery'),
            document.getElementById('visit')
        ].filter(Boolean);

        function updateScrollSpy() {
            const scrollY = window.scrollY;
            let currentActiveId = '';

            sections.forEach(sec => {
                const top = sec.offsetTop - 150;
                const height = sec.offsetHeight;
                if (scrollY >= top && scrollY < top + height) {
                    currentActiveId = sec.getAttribute('id');
                }
            });

            if (currentActiveId) {
                navLinks.forEach(link => {
                    const href = link.getAttribute('href')?.replace('#', '');
                    if (href === currentActiveId) {
                        link.classList.add('is-active');
                    } else {
                        link.classList.remove('is-active');
                    }
                });
            }
        }

        window.addEventListener('scroll', updateScrollSpy, { passive: true });
        updateScrollSpy();
    }

    // ─── 12. BACK TO TOP & CIRCULAR SCROLL PROGRESS ─────────────────
    function initBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        const ring = document.getElementById('scroll-progress-ring');
        const circumference = 2 * Math.PI * 15; // r = 15 => 94.25

        if (!backToTopBtn || !ring) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollFraction = docHeight > 0 ? scrollTop / docHeight : 0;
            const offset = circumference - (scrollFraction * circumference);

            ring.style.strokeDashoffset = offset;

            // Toggle visibility of floating button
            if (scrollTop > 350) {
                backToTopBtn.classList.add('is-visible');
            } else {
                backToTopBtn.classList.remove('is-visible');
            }
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    // ─── 13. REALTIME OPENING STATUS ────────────────────────────────
    function updateOpeningStatus() {
        const statusElem = document.getElementById('live-hours-status');
        if (!statusElem) return;

        const now = new Date();
        const hour = now.getHours();

        // 10:00 to 23:30 is open
        if (hour >= 10 && hour < 23) {
            statusElem.textContent = "OPEN NOW • VIBES HIGH • UNTIL 11:30 PM";
        } else if (hour === 23 && now.getMinutes() <= 30) {
            statusElem.textContent = "OPEN NOW • CLOSING SOON AT 11:30 PM";
        } else {
            statusElem.textContent = "OPENS DAILY AT 10:00 AM • RESERVATIONS ACTIVE";
        }
    }

    // ─── EXECUTE ALL MODULES ────────────────────────────────────────
    initPreloader();
    initCustomCursor();
    initHeaderAndNav();
    initMenuInteractions();
    initVibeSwitcher();
    initGalleryLightbox();
    initAddressCopy();
    initReservationModal();
    initMenuBoardModal();
    initBackToTop();
    updateOpeningStatus();

});
