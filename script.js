// Particle System
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animFrame;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    canvas.parentElement.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.5 ? 190 : 30;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function createParticles() {
        const isMobile = window.innerWidth <= 768;
        const divisor = isMobile ? 26000 : 15000;
        const max = isMobile ? 35 : 80;
        const count = Math.min(max, Math.floor((canvas.width * canvas.height) / divisor));
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    createParticles();
    window.addEventListener('resize', createParticles);

    function connectParticles() {
        const isMobile = window.innerWidth <= 768;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < (isMobile ? 90 : 120)) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.12 * (1 - dist / (isMobile ? 90 : 120))})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connectParticles();
        animFrame = requestAnimationFrame(animate);
    }
    animate();

    const heroEl = document.querySelector('.hero');
    const heroObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                if (!animFrame) animate();
            } else {
                cancelAnimationFrame(animFrame);
                animFrame = null;
            }
        });
    });
    if (heroEl) heroObs.observe(heroEl);
})();

// Navbar scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Counter animation with easing
function animateCounters() {
    document.querySelectorAll('.stat-number').forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2200;
        const startTime = performance.now();

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            counter.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString();
            }
        }
        requestAnimationFrame(update);
    });
}

// Intersection Observer for scroll animations
const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.keunggulan-card, .kategori-card, .produk-card, .kontak-item, .faq-item').forEach(el => {
    el.classList.add('fade-in');
    fadeObserver.observe(el);
});

// Counter trigger
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

// Filter produk with smooth transition
const filterBtns = document.querySelectorAll('.filter-btn');
const produkCards = document.querySelectorAll('.produk-card');

function applyFilter(filter) {
    filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === filter));

    produkCards.forEach((card, i) => {
        const category = card.getAttribute('data-category');
        const show = filter === 'all' || category === filter;

        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (show) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 50 + i * 60);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.style.display = 'none', 300);
        }
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        applyFilter(btn.getAttribute('data-filter'));
    });
});

// Footer kategori link -> scroll ke produk & aktifkan filter
document.querySelectorAll('.footer-cat-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = link.getAttribute('data-filter');
        const target = document.querySelector('#produk');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => applyFilter(filter), 600);
        }
    });
});

// Testimonial carousel
const track = document.getElementById('testimoniTrack');
const cards = track.querySelectorAll('.testimoni-card');
const dotsContainer = document.getElementById('testimoniDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;
let cardsPerView = 3;

function updateCardsPerView() {
    if (window.innerWidth <= 768) cardsPerView = 1;
    else if (window.innerWidth <= 1024) cardsPerView = 2;
    else cardsPerView = 3;
}

function getMaxSlide() {
    return Math.max(0, cards.length - cardsPerView);
}

function createDots() {
    dotsContainer.innerHTML = '';
    const max = getMaxSlide();
    for (let i = 0; i <= max; i++) {
        const dot = document.createElement('div');
        dot.classList.add('testimoni-dot');
        if (i === currentSlide) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

function goToSlide(index) {
    const max = getMaxSlide();
    currentSlide = Math.max(0, Math.min(index, max));
    const cardWidth = cards[0].offsetWidth + 20;
    track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    document.querySelectorAll('.testimoni-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });
}

prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

updateCardsPerView();
createDots();

window.addEventListener('resize', () => {
    updateCardsPerView();
    createDots();
    goToSlide(Math.min(currentSlide, getMaxSlide()));
});

// Auto slide
let autoSlide = setInterval(() => {
    const max = getMaxSlide();
    goToSlide(currentSlide >= max ? 0 : currentSlide + 1);
}, 5000);

const wrapper = document.querySelector('.testimoni-wrapper');
if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(autoSlide));
    wrapper.addEventListener('mouseleave', () => {
        autoSlide = setInterval(() => {
            const max = getMaxSlide();
            goToSlide(currentSlide >= max ? 0 : currentSlide + 1);
        }, 5000);
    });
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
    });
});

// Back to top
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
});
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Smooth cursor glow on hero
(function cursorGlow() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const glow = document.createElement('div');
    glow.style.cssText = `
        position: absolute;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%);
        pointer-events: none;
        z-index: 1;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s;
        opacity: 0;
    `;
    hero.appendChild(glow);

    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left) + 'px';
        glow.style.top = (e.clientY - rect.top) + 'px';
        glow.style.opacity = '1';
    });

    hero.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });
})();

// Tilt effect on keunggulan cards
document.querySelectorAll('.keunggulan-card, .kategori-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
});
