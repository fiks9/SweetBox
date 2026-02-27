// ===========================
//  ГОЛОВНИЙ МОДУЛЬ
//  Ініціалізація, навігація, scroll-анімації
//  Fix 1.4: один DOMContentLoaded
//  Fix 4.10: IntersectionObserver анімації
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Кошик
    initCart();

    // 2. Товари та фільтри (тільки на головній)
    generateProducts();
    initializeFilters();

    // 3. Мобільне меню
    initBurgerMenu();

    // 4. Розумна навігація "Головна"
    initHomeNavigation();

    // 5. Кнопки "Купити" з data-product-name (для product.html)
    initBuyButtonsWithData();

    // 6. Scroll-анімації (fix 4.10)
    initScrollAnimations();
});

// ===========================
//  МОБІЛЬНЕ МЕНЮ
// ===========================

function initBurgerMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (!burger || !nav) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// ===========================
//  РОЗУМНА НАВІГАЦІЯ
// ===========================

function initHomeNavigation() {
    document.querySelectorAll('.nav__link[href="index.html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const path = window.location.pathname;
            if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// ===========================
//  КНОПКИ "КУПИТИ" З DATA-АТРИБУТАМИ
//  (для статичних кнопок на product.html — "схожі товари")
// ===========================

function initBuyButtonsWithData() {
    document.querySelectorAll('.btn--small[data-product-name][data-product-price]').forEach(btn => {
        if (btn.dataset.listenerAttached) return;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const name = btn.getAttribute('data-product-name');
            const price = btn.getAttribute('data-product-price');
            if (name && price) {
                addToCart(name, price);
                showModal();
            }
        });
        btn.dataset.listenerAttached = 'true';
    });
}

// ===========================
//  SCROLL-АНІМАЦІЇ (fix 4.10)
// ===========================

function initScrollAnimations() {
    const els = document.querySelectorAll('.animate-on-scroll');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => observer.observe(el));
}
