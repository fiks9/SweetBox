// ===========================
//  ФІЛЬТРИ ТА ПОШУК
//  Fix 2.1: єдиний підхід — data-product-id + addEventListener
//  Fix 3.6: debounce для пошуку
// ===========================

/** @type {number|null} */
let searchDebounceTimer = null;

/**
 * Генерує картки товарів на головній сторінці
 */
function generateProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    displayProducts(productsDatabase);
}

/**
 * Уніфікована функція відображення товарів (fix 2.1)
 * @param {Array} products
 */
function displayProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">😔 На жаль, товарів за вашими критеріями не знайдено. Спробуйте змінити фільтри.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product animate-on-scroll';

        const badgeHTML = product.badge
            ? `<span class="product__badge ${product.badgeClass || ''}">${product.badge}</span>`
            : '';

        card.innerHTML = `
            ${badgeHTML}
            <a href="product.html?id=${product.id}" class="product__link">
                <div class="product__image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <h3 class="product__title">${product.name}</h3>
                <p class="product__price">${product.price} ₴</p>
            </a>
            <button class="btn btn--small" data-product-id="${product.id}">Купити</button>`;

        container.appendChild(card);
    });

    attachBuyButtonHandlers();
}

/**
 * Прив'язує обробники до ВСІХ кнопок "Купити" з data-product-id
 * Уніфікований підхід (fix 2.1) — замість inline onclick
 */
function attachBuyButtonHandlers() {
    document.querySelectorAll('.btn--small[data-product-id]').forEach(button => {
        if (button.dataset.listenerAttached) return;
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(button.getAttribute('data-product-id'));
            const product = productsDatabase.find(p => p.id === productId);
            if (product) {
                addToCart(product.name, `${product.price} ₴`);
                showModal();
            }
        });
        button.dataset.listenerAttached = 'true';
    });
}

/**
 * Ініціалізує панель фільтрів з debounce для пошуку (fix 3.6)
 */
function initializeFilters() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const filterVegan = document.getElementById('filter-vegan');
    const filterSugarFree = document.getElementById('filter-sugar-free');
    const filterLactoseFree = document.getElementById('filter-lactose-free');
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const resetBtn = document.getElementById('reset-filters');

    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(applyFilters, 300);
    });

    if (filterVegan) filterVegan.addEventListener('change', applyFilters);
    if (filterSugarFree) filterSugarFree.addEventListener('change', applyFilters);
    if (filterLactoseFree) filterLactoseFree.addEventListener('change', applyFilters);

    if (priceMin) priceMin.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(applyFilters, 300);
    });
    if (priceMax) priceMax.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(applyFilters, 300);
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            searchInput.value = '';
            if (filterVegan) filterVegan.checked = false;
            if (filterSugarFree) filterSugarFree.checked = false;
            if (filterLactoseFree) filterLactoseFree.checked = false;
            if (priceMin) priceMin.value = '';
            if (priceMax) priceMax.value = '';
            applyFilters();
        });
    }
}

/** Застосовує всі фільтри та перерендерює товари */
function applyFilters() {
    const searchQuery = (document.getElementById('search-input')?.value || '').toLowerCase();
    const isVegan = document.getElementById('filter-vegan')?.checked || false;
    const isSugarFree = document.getElementById('filter-sugar-free')?.checked || false;
    const isLactoseFree = document.getElementById('filter-lactose-free')?.checked || false;
    const minPrice = parseFloat(document.getElementById('price-min')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('price-max')?.value) || Infinity;

    const filtered = productsDatabase.filter(p => {
        return p.name.toLowerCase().includes(searchQuery)
            && (!isVegan || p.tags.includes('vegan'))
            && (!isSugarFree || p.tags.includes('sugar-free'))
            && (!isLactoseFree || p.tags.includes('lactose-free'))
            && p.price >= minPrice && p.price <= maxPrice;
    });

    displayProducts(filtered);
}
