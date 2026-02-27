// ===========================
//  КОШИК — управління станом, модалки
//  Fix 1.2: правильні ID модалок
//  Fix 1.8: try/catch для localStorage
// ===========================

/** @type {number} */
let cartCount = 0;
/** @type {Array<{name: string, price: string, quantity: number}>} */
let cartItems = [];

/**
 * Завантажує кошик з localStorage
 */
function loadCart() {
    try {
        const savedCart = localStorage.getItem('sweetboxCart');
        const savedCount = localStorage.getItem('sweetboxCartCount');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            cartCount = parseInt(savedCount) || 0;
        }
    } catch (e) {
        console.warn('Помилка завантаження кошика:', e);
        cartItems = [];
        cartCount = 0;
    }
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = cartCount;
}

/** Зберігає кошик в localStorage */
function saveCart() {
    localStorage.setItem('sweetboxCart', JSON.stringify(cartItems));
    localStorage.setItem('sweetboxCartCount', cartCount.toString());
}

/** Оновлює лічильник кошика з анімацією пульсації */
function updateCartCount() {
    cartCount++;
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = cartCount;
        badge.classList.remove('pulse');
        void badge.offsetWidth;
        badge.classList.add('pulse');
    }
}

/** Перераховує загальну кількість товарів */
function recalculateCartCount() {
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = cartCount;
    saveCart();
}

/**
 * Додає товар до кошика
 * @param {string} productName
 * @param {string} productPrice — рядок з валютою, напр. "450 ₴"
 */
function addToCart(productName, productPrice) {
    const existingItem = cartItems.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({ name: productName, price: productPrice, quantity: 1 });
    }
    updateCartCount();
    saveCart();
}

/**
 * Змінює кількість товару
 * @param {number} index
 * @param {number} delta — +1 або -1
 */
function updateCartItemQuantity(index, delta) {
    if (!cartItems[index]) return;
    cartItems[index].quantity += delta;
    if (cartItems[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        recalculateCartCount();
        updateCartDisplay();
    }
}

/**
 * Видаляє товар
 * @param {number} index
 */
function removeFromCart(index) {
    cartItems.splice(index, 1);
    recalculateCartCount();
    updateCartDisplay();
}

// ===========================
//  МОДАЛЬНІ ВІКНА (fix 1.2)
// ===========================

function showCartModal() {
    updateCartDisplay();
    var m = document.getElementById('view-cart-modal');
    var o = document.getElementById('modal-overlay');
    if (m) m.classList.add('show');
    if (o) o.classList.add('show');
}

function hideCartModal() {
    var m = document.getElementById('view-cart-modal');
    var o = document.getElementById('modal-overlay');
    if (m) m.classList.remove('show');
    if (o) o.classList.remove('show');
}

function showModal() {
    var m = document.getElementById('confirm-modal');
    var o = document.getElementById('modal-overlay');
    if (m) m.classList.add('show');
    if (o) o.classList.add('show');
}

function hideModal() {
    var m = document.getElementById('confirm-modal');
    var o = document.getElementById('modal-overlay');
    if (m) m.classList.remove('show');
    if (o) o.classList.remove('show');
}

/** Рендерить вміст кошика (fix 2.1: без inline onclick) */
function updateCartDisplay() {
    const cartItemsList = document.getElementById('cart-items-list');
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
                    <button class="cart-item__qty-btn" data-action="dec" data-idx="${index}">−</button>
                    <span class="cart-item__quantity">${item.quantity}</span>
                    <button class="cart-item__qty-btn" data-action="inc" data-idx="${index}">+</button>
                </div>
            </div>
            <div class="cart-item__price-block">
                <span class="cart-item__price">${totalPrice} ₴</span>
                <button class="cart-item__remove" data-idx="${index}" title="Видалити">
                    <img src="img/x.svg" alt="X">
                </button>
            </div>`;
        cartItemsList.appendChild(itemDiv);
        total += parseFloat(totalPrice);
    });

    // addEventListener замість onclick (fix 2.1)
    cartItemsList.querySelectorAll('.cart-item__qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            updateCartItemQuantity(idx, btn.dataset.action === 'inc' ? 1 : -1);
        });
    });
    cartItemsList.querySelectorAll('.cart-item__remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.idx)));
    });

    const totalDiv = document.createElement('div');
    totalDiv.className = 'cart-total';
    totalDiv.innerHTML = `
        <span class="cart-total__label">Всього:</span>
        <span class="cart-total__value">${total.toFixed(0)} ₴</span>`;
    cartItemsList.appendChild(totalDiv);
}

/** Ініціалізує кошик та обробники модалок */
function initCart() {
    loadCart();
    var cartBtn = document.querySelector('.btn--cart');
    if (cartBtn) cartBtn.addEventListener('click', showCartModal);
    var cmClose = document.getElementById('cart-modal-close');
    if (cmClose) cmClose.addEventListener('click', hideCartModal);
    var cfClose = document.getElementById('confirm-modal-close');
    if (cfClose) cfClose.addEventListener('click', hideModal);
    var overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.addEventListener('click', () => { hideCartModal(); hideModal(); });
}
