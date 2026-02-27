// ===========================
//  СПІЛЬНІ КОМПОНЕНТИ
//  Header, Footer, Модальні вікна
//  Єдине джерело істини — без дублювання HTML
// ===========================

(function () {
    /**
     * Визначає активну сторінку з URL
     * @returns {string}
     */
    function detectActivePage() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('about')) return 'about';
        if (path.includes('contact')) return 'contacts';
        if (path.includes('product.html') || path.includes('product?')) return 'product';
        if (path.includes('order')) return 'order';
        if (path.includes('404')) return '404';
        return 'index';
    }

    /**
     * @param {string} activePage
     * @returns {string} HTML хедера
     */
    function renderHeader(activePage) {
        const isIndex = activePage === 'index';
        const catalogHref = isIndex ? '#catalog' : 'index.html#catalog';

        return `
        <div class="container">
            <div class="header__inner">
                <div class="logo">
                    <a href="index.html" class="logo__link">SweetBox</a>
                </div>
                <nav class="nav" id="nav">
                    <ul class="nav__list">
                        <li class="nav__item"><a href="index.html" class="nav__link ${activePage === 'index' ? 'active' : ''}">Головна</a></li>
                        <li class="nav__item"><a href="${catalogHref}" class="nav__link">Каталог</a></li>
                        <li class="nav__item"><a href="about.html" class="nav__link ${activePage === 'about' ? 'active' : ''}">Про нас</a></li>
                        <li class="nav__item"><a href="contacts.html" class="nav__link ${activePage === 'contacts' ? 'active' : ''}">Контакти</a></li>
                    </ul>
                </nav>
                <button class="btn btn--cart">
                    <img src="img/cart.svg" alt="Кошик" class="cart-icon">
                    Кошик
                    <span id="cart-badge" class="cart-badge">0</span>
                </button>
                <button class="burger" id="burger">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>`;
    }

    /** @returns {string} HTML футера (єдиний варіант, fix 1.5 — виправлена друкарська помилка) */
    function renderFooter() {
        return `
        <div class="container">
            <div class="footer__inner">
                <div class="footer__col">
                    <h3 class="footer__logo">SweetBox</h3>
                    <p class="footer__text">Створюємо щастя з 2015 року. Кожен десерт виготовляємо з любов'ю та найкращими інгредієнтами.</p>
                </div>
                <div class="footer__col">
                    <h4 class="footer__title">Меню</h4>
                    <ul class="footer__list">
                        <li><a href="index.html" class="footer__link">Головна</a></li>
                        <li><a href="index.html#catalog" class="footer__link">Каталог</a></li>
                        <li><a href="about.html#history" class="footer__link">Наша історія</a></li>
                        <li><a href="contacts.html" class="footer__link">Контакти</a></li>
                    </ul>
                </div>
                <div class="footer__col">
                    <h4 class="footer__title">Клієнтам</h4>
                    <ul class="footer__list">
                        <li><a href="about.html" class="footer__link">Про нас</a></li>
                        <li><a href="contacts.html#delivery" class="footer__link">Доставка та оплата</a></li>
                        <li><a href="contacts.html#returns" class="footer__link">Повернення</a></li>
                    </ul>
                </div>
                <div class="footer__col">
                    <h4 class="footer__title">Контакти</h4>
                    <ul class="footer__list">
                        <li><a href="tel:+380123456789" class="footer__link">+380 12 345 67 89</a></li>
                        <li><a href="mailto:info@sweetbox.ua" class="footer__link">info@sweetbox.ua</a></li>
                    </ul>
                </div>
            </div>
        </div>`;
    }

    /** @returns {string} HTML модалок (fix 1.2 — правильні ID: confirm-modal, modal-overlay) */
    function renderModals() {
        return `
        <div id="modal-overlay" class="modal-overlay"></div>
        <div id="confirm-modal" class="modal">
            <div class="modal__content">
                <h3 class="modal__title">✓ Товар додано до кошика!</h3>
                <p class="modal__text">Дякуємо за покупку. Ви можете продовжити вибирати смаколики.</p>
                <button id="confirm-modal-close" class="btn btn--primary">Продовжити покупки</button>
            </div>
        </div>
        <div id="view-cart-modal" class="modal modal--cart">
            <div class="modal__content">
                <h3 class="modal__title">Ваш Кошик</h3>
                <div id="cart-items-list" class="cart-items"></div>
                <div class="modal__actions">
                    <a href="order.html" class="btn btn--primary" id="checkout-btn">Оформити замовлення</a>
                    <button id="cart-modal-close" class="btn btn--secondary">Продовжити покупки</button>
                </div>
            </div>
        </div>`;
    }

    // --- Автоматична ініціалізація ---
    var activePage = detectActivePage();
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    var m = document.getElementById('site-modals');
    if (h) h.innerHTML = renderHeader(activePage);
    if (f) f.innerHTML = renderFooter();
    if (m) m.innerHTML = renderModals();
})();
