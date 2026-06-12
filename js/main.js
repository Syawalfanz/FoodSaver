/* ============================================================
   FOODSAVER — MAIN JS  (fully functional, no map)
   ============================================================ */

'use strict';

/* ---------- DATA STORE ---------- */
const PRODUCTS = [
  { id: 'p1', name: 'Nasi Lemak Family Set',        emoji: '🍱', seller: 'Restoran Mak Cik',  price: 3.00,  original: 8.00,  stock: 5,  ends: 2, category: 'rice',    points: 15 },
  { id: 'p2', name: 'Assorted Croissant Bundle',    emoji: '🥐', seller: 'Sunrise Bakery',    price: 6.00,  original: 15.00, stock: 3,  ends: 3, category: 'bakery',  points: 20 },
  { id: 'p3', name: 'Char Kuey Teow (Large)',       emoji: '🍜', seller: "Uncle Lim's Stall", price: 4.00,  original: 10.00, stock: 8,  ends: 4, category: 'noodles', points: 12 },
  { id: 'p4', name: 'Slice Cake Box (4 varieties)', emoji: '🍰', seller: 'Sweetly Café',      price: 9.00,  original: 22.00, stock: 6,  ends: 5, category: 'dessert', points: 25 },
  { id: 'p5', name: 'Chicken Rice Set w/ Soup',     emoji: '🍛', seller: 'Kopitiam Sejati',   price: 3.50,  original: 9.00,  stock: 1,  ends: 1, category: 'rice',    points: 10 },
  { id: 'p6', name: 'Salad Combo (Vegan)',          emoji: '🥗', seller: 'Green Bowl',        price: 7.00,  original: 18.00, stock: 10, ends: 5, category: 'salad',   points: 22 },
  { id: 'p7', name: 'Roti Canai Set (3pcs)',        emoji: '🫓', seller: 'Mamak Corner',      price: 2.50,  original: 6.00,  stock: 12, ends: 2, category: 'rice',    points: 8  },
  { id: 'p8', name: 'Fruit Tart Box (6pcs)',        emoji: '🥧', seller: 'La Patisserie',     price: 11.00, original: 28.00, stock: 4,  ends: 3, category: 'dessert', points: 30 },
];

/* ---------- CART HELPERS ---------- */
function getCart() { return JSON.parse(localStorage.getItem('fs_cart') || '[]'); }
function saveCart(cart) { localStorage.setItem('fs_cart', JSON.stringify(cart)); }

function addToCart(id, qty = 1) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  let cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock);
  } else {
    cart.push({ id, name: product.name, emoji: product.emoji, price: product.price,
                seller: product.seller, points: product.points, qty });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`${product.emoji} ${product.name} added to cart!`);
}

function removeFromCart(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

function updateQtyInCart(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  renderCart();
}

function clearCart() { saveCart([]); updateCartBadge(); }

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

/* ---------- CART BADGE ---------- */
function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

/* ---------- TOAST ---------- */
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.fs-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'fs-toast';
  t.innerHTML = msg;
  t.style.cssText = `
    position:fixed;bottom:28px;right:24px;z-index:9999;
    background:${type === 'success' ? '#2d6a4f' : type === 'error' ? '#e63946' : '#f4a261'};
    color:white;padding:13px 20px;border-radius:12px;
    font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;
    box-shadow:0 8px 32px rgba(0,0,0,0.22);max-width:320px;
    opacity:0;transform:translateY(12px);transition:all 0.25s ease;
  `;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateY(12px)';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

/* ---------- NAVBAR ---------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  // Scroll effect
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger
  hamburger?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close menu when clicking a link on mobile
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // Active link highlight
  const page = location.pathname.split('/').pop() || 'index.html';
  navLinks?.querySelectorAll('a[href]').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('nav-active');
  });
}

/* ---------- COUNTER ANIMATION ---------- */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    let current = 0;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current).toLocaleString() : current.toFixed(1)) + suffix;
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  });
}

function initCounters() {
  const section = document.querySelector('.impact');
  if (!section) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe(section);
}

/* ---------- BROWSE PAGE ---------- */
function renderListings(products) {
  const grid = document.getElementById('listings-grid');
  if (!grid) return;
  if (products.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:40px 0;">No listings match your filters.</p>';
    return;
  }
  grid.innerHTML = products.map(p => {
    const discount = Math.round((1 - p.price / p.original) * 100);
    const badgeClass = p.stock <= 2 ? 'listing-badge sold-soon' : 'listing-badge';
    const badgeText = p.stock <= 2 ? `${p.stock} left!` : `Ends in ${p.ends}h`;
    return `
      <div class="listing-card" data-id="${p.id}">
        <div class="listing-img">${p.emoji}</div>
        <div class="${badgeClass}">${badgeText}</div>
        <div class="listing-body">
          <h4>${p.name}</h4>
          <p class="listing-seller">${p.seller}</p>
          <div class="listing-footer">
            <div class="listing-price">
              <del>RM${p.original.toFixed(2)}</del>
              <strong>RM${p.price.toFixed(2)}</strong>
              <span class="discount-pill">-${discount}%</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="addToCart('${p.id}'); this.textContent='✓ Added'; this.style.background='var(--green-dark)'; setTimeout(()=>{this.textContent='Reserve';this.style.background='';},2000);">Reserve</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function initBrowse() {
  if (!document.getElementById('listings-grid')) return;

  let filtered = [...PRODUCTS];

  // Search
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  function doSearch() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    applyFilters(q);
  }
  searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  searchBtn?.addEventListener('click', doSearch);

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', function() {
    applyFilters(searchInput?.value?.toLowerCase().trim() || '');
  });

  // Category filters
  document.querySelectorAll('.filter-cat').forEach(cb => {
    cb.addEventListener('change', () => applyFilters(searchInput?.value?.toLowerCase().trim() || ''));
  });

  // Price filters
  document.getElementById('filter-btn')?.addEventListener('click', () => {
    applyFilters(searchInput?.value?.toLowerCase().trim() || '');
  });

  function applyFilters(q = '') {
    let list = PRODUCTS.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) && !p.seller.toLowerCase().includes(q)) return false;

      // Category checkboxes
      const activeCats = [...document.querySelectorAll('.filter-cat:checked')].map(c => c.value);
      if (activeCats.length > 0 && !activeCats.includes(p.category)) return false;

      // Price range
      const minEl = document.getElementById('price-min');
      const maxEl = document.getElementById('price-max');
      const min = parseFloat(minEl?.value) || 0;
      const max = parseFloat(maxEl?.value) || Infinity;
      if (p.price < min || p.price > max) return false;

      return true;
    });

    // Sort
    const sort = document.getElementById('sort-select')?.value;
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'discount') list.sort((a, b) => (b.original - b.price) / b.original - (a.original - a.price) / a.original);
    else list.sort((a, b) => a.ends - b.ends); // soonest first

    const countEl = document.getElementById('listing-count');
    if (countEl) countEl.textContent = `${list.length} listing${list.length !== 1 ? 's' : ''} found`;

    renderListings(list);
  }

  applyFilters();
}

/* ---------- PRODUCT PAGE ---------- */
function initProduct() {
  if (!document.getElementById('product-area')) return;

  // Read product id from URL ?id=p1, default p1
  const params = new URLSearchParams(location.search);
  const id = params.get('id') || 'p1';
  const p = PRODUCTS.find(x => x.id === id) || PRODUCTS[0];

  const discount = Math.round((1 - p.price / p.original) * 100);

  document.getElementById('prod-emoji').textContent = p.emoji;
  document.getElementById('prod-name').textContent = p.name;
  document.getElementById('prod-seller').textContent = `🍽️ ${p.seller}`;
  document.getElementById('prod-original').textContent = `RM${p.original.toFixed(2)}`;
  document.getElementById('prod-price').textContent = `RM${p.price.toFixed(2)}`;
  document.getElementById('prod-discount').textContent = `SAVE ${discount}%`;
  document.getElementById('prod-stock').textContent = `${p.stock} remaining`;
  document.getElementById('prod-ends').textContent = `${p.ends} hour${p.ends !== 1 ? 's' : ''} left`;
  document.getElementById('prod-points').textContent = `+${p.points} pts`;
  document.getElementById('prod-saved').textContent = `${(p.original - p.price).toFixed(2)}`;

  // Qty stepper
  let qty = 1;
  const qtyEl = document.getElementById('qty-num');
  document.getElementById('qty-down')?.addEventListener('click', () => {
    qty = Math.max(1, qty - 1); qtyEl.textContent = qty;
  });
  document.getElementById('qty-up')?.addEventListener('click', () => {
    qty = Math.min(p.stock, qty + 1); qtyEl.textContent = qty;
  });

  // Add to cart
  document.getElementById('btn-add-cart')?.addEventListener('click', () => {
    addToCart(p.id, qty);
  });

  // Buy now
  document.getElementById('btn-buy-now')?.addEventListener('click', () => {
    addToCart(p.id, qty);
    setTimeout(() => { window.location.href = 'cart.html'; }, 600);
  });

  // Related products (other items, excluding current)
  const relGrid = document.getElementById('related-grid');
  if (relGrid) {
    const others = PRODUCTS.filter(x => x.id !== p.id).slice(0, 3);
    relGrid.innerHTML = others.map(o => {
      const d = Math.round((1 - o.price / o.original) * 100);
      return `<div class="listing-card">
        <div class="listing-img">${o.emoji}</div>
        <div class="listing-badge">Ends in ${o.ends}h</div>
        <div class="listing-body">
          <h4>${o.name}</h4>
          <p class="listing-seller">${o.seller}</p>
          <div class="listing-footer">
            <div class="listing-price"><del>RM${o.original.toFixed(2)}</del><strong>RM${o.price.toFixed(2)}</strong><span class="discount-pill">-${d}%</span></div>
            <a href="product.html?id=${o.id}" class="btn btn-sm btn-primary">View</a>
          </div>
        </div>
      </div>`;
    }).join('');
  }
}

/* ---------- CART PAGE ---------- */
function renderCart() {
  const cartList = document.getElementById('cart-list');
  if (!cartList) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align:center;padding:60px 0;">
        <div style="font-size:56px;margin-bottom:16px;">🛒</div>
        <h3 style="font-family:var(--font-display);color:var(--green-dark);margin-bottom:8px;">Your cart is empty</h3>
        <p style="color:var(--text-muted);margin-bottom:24px;">Find surplus food near you and start saving!</p>
        <a href="browse.html" class="btn btn-primary">Browse Food →</a>
      </div>`;
    updateSummary(0);
    return;
  }

  cartList.innerHTML = cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.seller}</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="qty-mini">
          <button class="qty-mini-btn" onclick="updateQtyInCart('${item.id}',-1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-mini-btn" onclick="updateQtyInCart('${item.id}',1)">+</button>
        </div>
        <div class="cart-item-price"><strong>RM${(item.price * item.qty).toFixed(2)}</strong></div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Remove">✕</button>
      </div>
    </div>`).join('');

  const total = getCartTotal();
  updateSummary(total);
}

function updateSummary(total) {
  const fee = total > 0 ? 1.50 : 0;
  const grand = total + fee;
  const pts = getCart().reduce((s, i) => s + (PRODUCTS.find(p => p.id === i.id)?.points || 0) * i.qty, 0);
  const el = id => document.getElementById(id);
  if (el('cart-subtotal')) el('cart-subtotal').textContent = `RM${total.toFixed(2)}`;
  if (el('cart-fee'))      el('cart-fee').textContent      = `RM${fee.toFixed(2)}`;
  if (el('cart-grand'))    el('cart-grand').textContent    = `RM${grand.toFixed(2)}`;
  if (el('cart-pts'))      el('cart-pts').textContent      = `+${pts} pts`;
  if (el('checkout-total')) el('checkout-total').textContent = `RM${grand.toFixed(2)}`;
  const checkoutBtn = el('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = total === 0;
    checkoutBtn.style.opacity = total === 0 ? '0.5' : '1';
    checkoutBtn.style.cursor  = total === 0 ? 'not-allowed' : 'pointer';
  }
}

function initCart() {
  if (!document.getElementById('cart-list')) return;
  renderCart();
}

/* ---------- CHECKOUT PAGE ---------- */
function initCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  // Populate order items
  const itemsEl = document.getElementById('checkout-items');
  const cart = getCart();

  if (cart.length === 0) {
    window.location.href = 'browse.html';
    return;
  }

  if (itemsEl) {
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-item" style="padding:10px 0;">
        <div class="cart-item-img" style="width:44px;height:44px;font-size:22px;">${i.emoji}</div>
        <div class="cart-item-info"><h4 style="font-size:13px;">${i.name} ×${i.qty}</h4></div>
        <div class="cart-item-price"><strong style="font-size:13px;">RM${(i.price*i.qty).toFixed(2)}</strong></div>
      </div>`).join('');
  }

  const total = getCartTotal();
  const grand = total + 1.50;
  const el = id => document.getElementById(id);
  if (el('co-subtotal')) el('co-subtotal').textContent = `RM${total.toFixed(2)}`;
  if (el('co-fee'))      el('co-fee').textContent      = `RM1.50`;
  if (el('co-grand'))    el('co-grand').textContent    = `RM${grand.toFixed(2)}`;
  if (el('co-pay-btn'))  el('co-pay-btn').textContent  = `🔒 Pay RM${grand.toFixed(2)} Now`;

  // Card number auto-formatting
  const cardInput = document.getElementById('card-number');
  cardInput?.addEventListener('input', function() {
    let v = this.value.replace(/\D/g,'').slice(0,16);
    this.value = v.replace(/(.{4})/g,'$1 ').trim();
  });

  // Expiry formatting
  const expInput = document.getElementById('card-expiry');
  expInput?.addEventListener('input', function() {
    let v = this.value.replace(/\D/g,'').slice(0,4);
    if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2);
    this.value = v;
  });

  // CVV limit
  document.getElementById('card-cvv')?.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'').slice(0,3);
  });

  // Form submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = el('co-pay-btn');

    // Validate card (Stripe test card)
    const cardRaw = (cardInput?.value || '').replace(/\s/g,'');
    if (cardRaw.length < 16) { showToast('Please enter a valid 16-digit card number.', 'error'); return; }
    const expiry = expInput?.value || '';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) { showToast('Please enter expiry as MM/YY.', 'error'); return; }
    const cvv = document.getElementById('card-cvv')?.value || '';
    if (cvv.length < 3) { showToast('Please enter a 3-digit CVV.', 'error'); return; }

    // Loading state
    btn.textContent = '⏳ Processing...';
    btn.disabled = true;

    setTimeout(() => {
      clearCart();
      window.location.href = 'order-success.html';
    }, 1800);
  });
}

/* ---------- ORDER SUCCESS ---------- */
function initOrderSuccess() {
  if (!document.getElementById('success-area')) return;
  const orderNum = 'FS' + Date.now().toString().slice(-6);
  const el = document.getElementById('order-num');
  if (el) el.textContent = orderNum;
}

/* ---------- DASHBOARD ---------- */
function initDashboard() {
  if (!document.getElementById('dashboard-area')) return;

  // Sidebar tab switching
  document.querySelectorAll('.sidebar-menu a[data-tab]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const tab = this.dataset.tab;
      document.querySelectorAll('.dash-tab').forEach(t => t.style.display = 'none');
      document.getElementById(`tab-${tab}`)?.style.setProperty('display','block');
      document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
      this.closest('li').classList.add('active');
    });
  });

  // GreenPoints animate
  setTimeout(() => {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const steps = 50;
      const inc = target / steps;
      let s = 0;
      const t = setInterval(() => {
        s++; current = Math.min(current + inc, target);
        el.textContent = Math.floor(current).toLocaleString() + suffix;
        if (s >= steps) clearInterval(t);
      }, 20);
    });
  }, 200);
}

/* ---------- REGISTER PAGE ---------- */
function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;

  // Role param pre-select
  const params = new URLSearchParams(location.search);
  const role = params.get('role');
  if (role) {
    const radio = document.querySelector(`input[name="role"][value="${role}"]`);
    if (radio) radio.checked = true;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = true;
    const required = form.querySelectorAll('[required]');
    required.forEach(inp => {
      if (!inp.value.trim()) {
        inp.style.borderColor = 'var(--danger)'; valid = false;
      } else inp.style.borderColor = '';
    });
    if (!valid) { showToast('Please fill all required fields.', 'error'); return; }
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Creating account...';
    btn.disabled = true;
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
  });
}

/* ---------- LOGIN PAGE ---------- */
function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Signing in...';
    btn.disabled = true;
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
  });
}

/* ---------- CONTACT PAGE ---------- */
function initContact() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'var(--green-dark)';
    btn.disabled = true;
    form.reset();
    showToast('Your message has been sent! We will reply within 24 hours.');
  });
}

/* ---------- LISTING CARDS ON INDEX ---------- */
function initIndexListings() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const featured = PRODUCTS.slice(0, 6);
  grid.innerHTML = featured.map(p => {
    const discount = Math.round((1 - p.price / p.original) * 100);
    const badgeClass = p.stock <= 2 ? 'listing-badge sold-soon' : 'listing-badge';
    const badgeText = p.stock <= 2 ? `${p.stock} left!` : `Ends in ${p.ends}h`;
    return `
      <div class="listing-card">
        <div class="listing-img">${p.emoji}</div>
        <div class="${badgeClass}">${badgeText}</div>
        <div class="listing-body">
          <h4>${p.name}</h4>
          <p class="listing-seller">${p.seller}</p>
          <div class="listing-footer">
            <div class="listing-price">
              <del>RM${p.original.toFixed(2)}</del>
              <strong>RM${p.price.toFixed(2)}</strong>
              <span class="discount-pill">-${discount}%</span>
            </div>
            <a href="product.html?id=${p.id}" class="btn btn-sm btn-primary">Reserve</a>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ---------- ADMIN PAGE ---------- */
function initAdmin() {
  if (!document.getElementById('admin-area')) return;
  // Render user/listing tables from data
  const usersTable = document.getElementById('admin-users-body');
  const listingsTable = document.getElementById('admin-listings-body');
  if (listingsTable) {
    listingsTable.innerHTML = PRODUCTS.map(p => `
      <tr>
        <td>${p.emoji} ${p.name}</td>
        <td>${p.seller}</td>
        <td>RM${p.price.toFixed(2)}</td>
        <td>${p.stock}</td>
        <td><span class="status-badge ${p.stock > 0 ? 'completed' : 'pending'}">${p.stock > 0 ? 'Live' : 'Sold Out'}</span></td>
        <td><button class="btn btn-sm btn-outline" onclick="showToast('Listing updated!')">Edit</button></td>
      </tr>`).join('');
  }
}

/* ---------- SELLER DASHBOARD ---------- */
function initSellerDashboard() {
  const form = document.getElementById('new-listing-form');
  if (!form) return;

  const listingsBody = document.getElementById('my-listings-body');
  let myListings = JSON.parse(localStorage.getItem('fs_seller_listings') || '[]');

  function renderMyListings() {
    if (!listingsBody) return;
    if (myListings.length === 0) {
      listingsBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;">No listings yet. Create your first one above!</td></tr>';
      return;
    }
    listingsBody.innerHTML = myListings.map((l, i) => `
      <tr>
        <td>${l.emoji || '🍱'} ${l.name}</td>
        <td>RM${parseFloat(l.price).toFixed(2)}</td>
        <td>${l.stock}</td>
        <td><span class="status-badge completed">Live</span></td>
        <td><button class="btn btn-sm btn-outline" onclick="deleteMyListing(${i})">Remove</button></td>
      </tr>`).join('');
  }

  window.deleteMyListing = function(i) {
    myListings.splice(i, 1);
    localStorage.setItem('fs_seller_listings', JSON.stringify(myListings));
    renderMyListings();
    showToast('Listing removed.');
  };

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name  = document.getElementById('sl-name').value.trim();
    const price = document.getElementById('sl-price').value;
    const orig  = document.getElementById('sl-original').value;
    const stock = document.getElementById('sl-stock').value;
    const emoji = document.getElementById('sl-emoji').value || '🍱';
    if (!name || !price || !stock) { showToast('Please fill all required fields.', 'error'); return; }
    myListings.push({ name, price, original: orig, stock, emoji });
    localStorage.setItem('fs_seller_listings', JSON.stringify(myListings));
    form.reset();
    renderMyListings();
    showToast(`✅ "${name}" listed successfully!`);
  });

  renderMyListings();
}

/* ============================================================
   INIT — runs on every page
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  initCounters();
  initIndexListings();
  initBrowse();
  initProduct();
  initCart();
  initCheckout();
  initOrderSuccess();
  initDashboard();
  initRegister();
  initLogin();
  initContact();
  initAdmin();
  initSellerDashboard();
});
