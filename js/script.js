/* --- Генерація товарів --- */

function generateProducts() {
    const productsContainer = document.getElementById('products-container');

    if (!productsContainer) return;

    productsContainer.innerHTML = '';

    const productsToShow = productsDatabase.slice(0, 8);

    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product';

        const badgeHTML = product.badge
            ? `<span class="product__badge ${product.badgeClass || ''}">${product.badge}</span>`
            : '';

        productCard.innerHTML = `
            ${badgeHTML}
            <a href="product.html?id=${product.id}" class="product__link">
                <div class="product__image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <h3 class="product__title">${product.name}</h3>
                <p class="product__price">${product.price} ₴</p>
            </a>
            <button class="btn btn--small" data-product-id="${product.id}">Купити</button>
        `;

        productsContainer.appendChild(productCard);
    });

    attachBuyButtonHandlers();
}

function attachBuyButtonHandlers() {
    const buyButtons = document.querySelectorAll('.btn--small[data-product-id]');

    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const productId = parseInt(button.getAttribute('data-product-id'));
            const product = productsDatabase.find(p => p.id === productId);

            if (product) {
                addToCart(product.name, `${product.price} ₴`);
                showModal();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    generateProducts();
    initializeFilters();
});

/* --- Фільтри --- */

function initializeFilters() {
    const searchInput = document.getElementById('search-input');
    const filterVegan = document.getElementById('filter-vegan');
    const filterSugarFree = document.getElementById('filter-sugar-free');
    const filterLactoseFree = document.getElementById('filter-lactose-free');
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const resetBtn = document.getElementById('reset-filters');

    if (!searchInput) return;

    searchInput.addEventListener('input', applyFilters);

    filterVegan.addEventListener('change', applyFilters);
    filterSugarFree.addEventListener('change', applyFilters);
    filterLactoseFree.addEventListener('change', applyFilters);

    priceMin.addEventListener('input', applyFilters);
    priceMax.addEventListener('input', applyFilters);

    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterVegan.checked = false;
        filterSugarFree.checked = false;
        filterLactoseFree.checked = false;
        priceMin.value = '';
        priceMax.value = '';
        applyFilters();
    });
}

function applyFilters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const filterVegan = document.getElementById('filter-vegan').checked;
    const filterSugarFree = document.getElementById('filter-sugar-free').checked;
    const filterLactoseFree = document.getElementById('filter-lactose-free').checked;
    const priceMin = parseFloat(document.getElementById('price-min').value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max').value) || Infinity;

    const filteredProducts = productsDatabase.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);
        const matchesVegan = !filterVegan || product.tags.includes('vegan');
        const matchesSugarFree = !filterSugarFree || product.tags.includes('sugar-free');
        const matchesLactoseFree = !filterLactoseFree || product.tags.includes('lactose-free');
        const matchesPrice = product.price >= priceMin && product.price <= priceMax;

        return matchesSearch && matchesVegan && matchesSugarFree && matchesLactoseFree && matchesPrice;
    });

    displayFilteredProducts(filteredProducts);
}

function displayFilteredProducts(products) {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';

    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="no-products">😔 На жаль, товарів за вашими критеріями не знайдено. Спробуйте змінити фільтри.</p>';
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product';

        productCard.innerHTML = `
            ${product.badge ? `<span class="product__badge ${product.badgeClass}">${product.badge}</span>` : ''}
            <a href="product.html?id=${product.id}" class="product__link">
                <div class="product__image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <h3 class="product__title">${product.name}</h3>
                <p class="product__price">${product.price} ₴</p>
            </a>
            <button class="btn btn--small" onclick="addToCart('${product.name}', '${product.price} ₴')">Купити</button>
        `;

        productsContainer.appendChild(productCard);
    });
}


/* --- Кошик --- */

let cartCount = 0;
let cartItems = [];

const cartBadge = document.getElementById('cart-badge');

function loadCart() {
    const savedCart = localStorage.getItem('sweetboxCart');
    const savedCount = localStorage.getItem('sweetboxCartCount');

    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        cartCount = parseInt(savedCount) || 0;
        cartBadge.textContent = cartCount;
    }
}

function saveCart() {
    localStorage.setItem('sweetboxCart', JSON.stringify(cartItems));
    localStorage.setItem('sweetboxCartCount', cartCount.toString());
}

function updateCartCount() {
    cartCount++;
    cartBadge.textContent = cartCount;

    cartBadge.classList.remove('pulse');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('pulse');
}

function recalculateCartCount() {
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartBadge.textContent = cartCount;
    saveCart();
}

function addToCart(productName, productPrice) {
    const existingItem = cartItems.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    updateCartCount();
    saveCart();
}

function updateCartItemQuantity(index, delta) {
    if (cartItems[index]) {
        cartItems[index].quantity += delta;

        if (cartItems[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            recalculateCartCount();
            updateCartDisplay();
        }
    }
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    recalculateCartCount();
    updateCartDisplay();
}

/* --- Модалки --- */

const cartBtn = document.querySelector('.btn--cart');
const cartModal = document.getElementById('view-cart-modal');
const cartModalClose = document.getElementById('cart-modal-close');
const cartItemsList = document.getElementById('cart-items-list');

const confirmModal = document.getElementById('confirm-modal');
const confirmModalClose = document.getElementById('confirm-modal-close');
const overlay = document.getElementById('overlay');

function showCartModal() {
    updateCartDisplay();
    cartModal.classList.add('show');
    overlay.classList.add('show');
}

function hideCartModal() {
    cartModal.classList.remove('show');
    overlay.classList.remove('show');
}

function showModal() {
    confirmModal.classList.add('show');
    overlay.classList.add('show');
}

function hideModal() {
    confirmModal.classList.remove('show');
    overlay.classList.remove('show');
}

if (cartBtn) {
    cartBtn.addEventListener('click', showCartModal);
}

if (cartModalClose) {
    cartModalClose.addEventListener('click', hideCartModal);
}

if (confirmModalClose) {
    confirmModalClose.addEventListener('click', hideModal);
}

if (overlay) {
    overlay.addEventListener('click', () => {
        hideCartModal();
        hideModal();
    });
}

function updateCartDisplay() {
    if (!cartItemsList) return;

    cartItemsList.innerHTML = '';

    if (cartItems.length === 0) {
        cartItemsList.innerHTML = '<p class="cart-empty">Кошик порожній</p>';
        return;
    }

    let total = 0;

    cartItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';

        const price = parseFloat(item.price.replace(/[^\d.]/g, ''));
        const totalPrice = (price * item.quantity).toFixed(0);

        itemDiv.innerHTML = `
            <div class="cart-item__info">
                <span class="cart-item__name">${item.name}</span>
                <div class="cart-item__controls">
                    <button class="cart-item__qty-btn" onclick="updateCartItemQuantity(${index}, -1)">−</button>
                    <span class="cart-item__quantity">${item.quantity}</span>
                    <button class="cart-item__qty-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item__price-block">
                <span class="cart-item__price">${totalPrice} ₴</span>
                <button class="cart-item__remove" onclick="removeFromCart(${index})" title="Видалити">
                    <img src="img/x.svg" alt="X">
                </button>
            </div>
        `;

        cartItemsList.appendChild(itemDiv);
        total += parseFloat(totalPrice);
    });

    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.innerHTML = `
        <span class="cart-total__label">Всього:</span>
        <span class="cart-total__value">${total.toFixed(0)} ₴</span>
    `;

    cartItemsList.appendChild(totalDiv);
}

/* --- Мобільне меню --- */

const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
    });

    const navLinks = nav.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

/* --- Загрузка --- */

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

/* --- Розумна навігація для посилання "Головна" --- */

document.addEventListener('DOMContentLoaded', () => {
    const homeLinks = document.querySelectorAll('.nav__link[href="index.html"]');

    homeLinks.forEach(homeLink => {
        homeLink.addEventListener('click', (e) => {
            // Перевіряємо, чи ми на головній сторінці
            const currentPage = window.location.pathname;
            const isOnHomePage = currentPage.endsWith('index.html') || currentPage === '/' || currentPage.endsWith('/');

            if (isOnHomePage) {
                // Якщо на головній - скролимо вгору
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
            // Якщо на іншій сторінці - дозволяємо звичайний перехід (не preventDefault)
        });
    });
});

/* --- Універсальний обробник для кнопок "Купити" --- */

document.addEventListener('DOMContentLoaded', () => {
    // Обробка всіх кнопок "Купити" з атрибутами data-product-name та data-product-price
    function initializeBuyButtons() {
        const buyButtons = document.querySelectorAll('.btn--small[data-product-name][data-product-price]');

        buyButtons.forEach(button => {
            // Перевіряємо, чи вже додано обробник (щоб не дублювати)
            if (!button.dataset.listenerAttached) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();

                    const productName = button.getAttribute('data-product-name');
                    const productPrice = button.getAttribute('data-product-price');

                    if (productName && productPrice) {
                        addToCart(productName, productPrice);
                        showModal();
                    }
                });

                button.dataset.listenerAttached = 'true';
            }
        });
    }

    // Ініціалізуємо кнопки при завантаженні
    initializeBuyButtons();

    // Також викликаємо після динамічної генерації товарів (для index.html)
    // Це спрацює автоматично після виклику generateProducts()
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        // Для головної сторінки обробка відбувається через attachBuyButtonHandlers()
        // тому тут нічого додаткового не потрібно
    }
});
