/* ========================================================================
   0. BACKGROUND BINTANG JATUH, SCROLL PROGRESS, SPOTLIGHT & CONFETTI
   ======================================================================== */
const shootingStarsBg = document.getElementById('shootingStarsBg');
const scrollProgressBar = document.getElementById('scrollProgressBar');
const confettiLayer = document.getElementById('confettiLayer');

function initShootingStars(count = 16) {
  if (!shootingStarsBg) return;
  shootingStarsBg.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'shooting-star';

    const startTop = Math.random() * 85 - 15; // -15% sampai 70%
    const startLeft = Math.random() * 115 + 5; // 5% sampai 120%
    const duration = 2.6 + Math.random() * 3.4; // 2.6s - 6s
    const delay = Math.random() * 6; // 0s - 6s
    const length = 90 + Math.random() * 90; // 90px - 180px

    star.style.top = `${startTop}%`;
    star.style.left = `${startLeft}%`;
    star.style.setProperty('--duration', `${duration}s`);
    star.style.setProperty('--delay', `${delay}s`);
    star.style.setProperty('--star-length', `${length}px`);

    shootingStarsBg.appendChild(star);
  }
}

function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
  scrollProgressBar.style.width = `${percent}%`;
}

function bindSpotlightCards() {
  document.querySelectorAll('.spotlight-card').forEach(card => {
    if (card.dataset.spotlightBound) return;
    card.dataset.spotlightBound = 'true';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

let revealObserver = null;
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item:not(.visible)');
  if (!items.length) return;

  if (!revealObserver && 'IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }

  items.forEach(el => {
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add('visible');
    }
  });
}

function launchCheckoutConfetti() {
  if (!confettiLayer) return;
  const colors = ['#c86d2d', '#f59e0b', '#fbbf24', '#22c55e', '#fb7185'];
  confettiLayer.innerHTML = '';

  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    piece.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
    confettiLayer.appendChild(piece);
  }

  setTimeout(() => {
    if (confettiLayer) confettiLayer.innerHTML = '';
  }, 2200);
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ========================================================================
   1. AUDIO ENGINE (SFX INTERAKSI & SUARA SUASANA KAFE - WEB AUDIO API)
   ======================================================================== */
let audioCtx = null;
let sfxEnabled = true;
let ambienceActive = false;
let ambienceNodes = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playSFX(type = 'pop') {
  if (!sfxEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  if (type === 'pop') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } else if (type === 'click') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (type === 'success') {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const noteOsc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, now + idx * 0.09);
      noteGain.gain.setValueAtTime(0.09, now + idx * 0.09);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.25);
      noteOsc.connect(noteGain);
      noteGain.connect(ctx.destination);
      noteOsc.start(now + idx * 0.09);
      noteOsc.stop(now + idx * 0.09 + 0.26);
    });
  }
}

function toggleCafeAmbience() {
  const ctx = getAudioContext();
  const diAmbBtn = document.getElementById('diToggleAmbienceBtn');

  if (!ambienceActive && ctx) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;

    const ambGain = ctx.createGain();
    ambGain.gain.value = 0.04;

    whiteNoise.connect(filter);
    filter.connect(ambGain);
    ambGain.connect(ctx.destination);
    whiteNoise.start(0);

    ambienceNodes = { source: whiteNoise, gain: ambGain };
    ambienceActive = true;
    if (diAmbBtn) diAmbBtn.textContent = '☕ Suara On';
    notifyDynamicIsland('🌧️ Suasana Kafe Aktif');
  } else {
    if (ambienceNodes?.source) {
      try { ambienceNodes.source.stop(); } catch (_) {}
    }
    ambienceNodes = null;
    ambienceActive = false;
    if (diAmbBtn) diAmbBtn.textContent = '🌧️ Suara';
    notifyDynamicIsland('🔇 Suasana Kafe Mati');
  }
}

/* ========================================================================
   2. STATE & FUNGSI UTILITAS UTAMA
   ======================================================================== */
let cart = [];
let appliedPromo = null;
let orderHistory = JSON.parse(localStorage.getItem('kopiRasaHistory') || '[]');
let activeCategory = 'all';
let searchKeyword = '';
let selectedProductForVariant = null;
let diTimer = null;

function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(angka || 0);
}

function calculateTotals(silent = false) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discount = 0;

  if (appliedPromo === 'HEMAT10') {
    discount = subtotal * 0.10;
  } else if (appliedPromo === 'RASA20') {
    if (subtotal >= 50000) {
      discount = subtotal * 0.20;
    } else {
      appliedPromo = null;
      const promoFeedbackEl = document.getElementById('promoFeedback');
      if (!silent && promoFeedbackEl) {
        promoFeedbackEl.textContent = 'Kode RASA20 butuh minimal belanja Rp 50.000.';
      }
    }
  }

  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = afterDiscount * 0.10;
  const grandTotal = afterDiscount + tax;

  return { subtotal, discount, tax, grandTotal };
}

/* ========================================================================
   3. DYNAMIC ISLAND & STATUS OPERASIONAL REAL-TIME
   ======================================================================== */
const dynamicIsland = document.getElementById('dynamicIsland');
const diText = document.getElementById('diText');
const diBadge = document.getElementById('diBadge');
const diTotal = document.getElementById('diTotal');
const diDot = document.getElementById('diDot');
const diStoreStatus = document.getElementById('diStoreStatus');

function checkStoreOpenStatus() {
  const hour = new Date().getHours();
  const isOpen = hour >= 8 && hour < 22;
  if (diDot) {
    diDot.style.background = isOpen ? '#22c55e' : '#ef4444';
    diDot.style.boxShadow = isOpen ? '0 0 8px #22c55e' : '0 0 8px #ef4444';
  }
  if (diStoreStatus) {
    diStoreStatus.textContent = isOpen ? 'Buka (08:00 - 22:00)' : 'Tutup • Pre-Order';
  }
  return isOpen ? 'SenAjaIn Cafe • Buka' : 'SenAjaIn Cafe • Pre-Order';
}

function syncDynamicIslandIdle(grandTotal = 0, totalItems = 0) {
  if (!dynamicIsland) return;
  if (diTotal) diTotal.textContent = formatRupiah(grandTotal);

  if (totalItems > 0) {
    if (diText) diText.textContent = '🛒 Keranjang Aktif';
    if (diBadge) {
      diBadge.style.display = 'inline-block';
      diBadge.textContent = `${totalItems} Item • ${formatRupiah(grandTotal)}`;
    }
  } else {
    if (diText) diText.textContent = checkStoreOpenStatus();
    if (diBadge) diBadge.style.display = 'none';
  }
}

function notifyDynamicIsland(message) {
  if (!dynamicIsland) return;
  clearTimeout(diTimer);
  if (diText) diText.textContent = message;
  dynamicIsland.classList.add('pulse');
  setTimeout(() => dynamicIsland.classList.remove('pulse'), 320);

  diTimer = setTimeout(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const grandTotal = calculateTotals(true).grandTotal;
    syncDynamicIslandIdle(grandTotal, totalItems);
  }, 2400);
}

if (dynamicIsland) {
  dynamicIsland.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    playSFX('click');
    dynamicIsland.classList.toggle('expanded');
  });

  document.getElementById('diOpenCartBtn')?.addEventListener('click', () => {
    playSFX('click');
    dynamicIsland.classList.remove('expanded');
    document.getElementById('cartOverlay')?.classList.add('open');
  });

  document.getElementById('diOpenHistoryBtn')?.addEventListener('click', () => {
    playSFX('click');
    dynamicIsland.classList.remove('expanded');
    if (typeof openHistoryModal === 'function') openHistoryModal();
  });

  document.getElementById('diToggleAmbienceBtn')?.addEventListener('click', () => {
    toggleCafeAmbience();
  });

  document.getElementById('diCloseExpandBtn')?.addEventListener('click', () => {
    playSFX('click');
    dynamicIsland.classList.remove('expanded');
  });
}

document.querySelectorAll('.promo-code[data-promo]').forEach(el => {
  el.addEventListener('click', () => {
    const code = el.dataset.promo;
    navigator.clipboard?.writeText(code).catch(() => {});
    const input = document.getElementById('promoInput');
    if (input) input.value = code;
    playSFX('pop');
    notifyDynamicIsland(`📋 Kode ${code} disalin!`);
  });
});

/* ========================================================================
   4. BAGIAN TSAQIF: NAVBAR HAMBURGER & DARK/LIGHT MODE SLIDE BUTTON
   ======================================================================== */
const htmlEl = document.documentElement;
const themeSwitchInput = document.getElementById('themeSwitchInput');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');

function applyTheme(theme, showToast = true) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('kopiRasaTheme', theme);
  if (themeSwitchInput) {
    themeSwitchInput.checked = theme === 'dark';
  }
  if (showToast) {
    playSFX('click');
    notifyDynamicIsland(theme === 'dark' ? '🌙 Dark Mode Aktif' : '☀️ Light Mode Aktif');
  }
}

const savedTheme = localStorage.getItem('kopiRasaTheme') || 'light';
applyTheme(savedTheme, false);

themeSwitchInput?.addEventListener('change', (e) => {
  applyTheme(e.target.checked ? 'dark' : 'light', true);
});

hamburgerBtn?.addEventListener('click', () => {
  playSFX('click');
  navLinks?.classList.toggle('active');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('active'));
});

/* ========================================================================
   5. BAGIAN RAFIF: DATA MENU (15 ITEM), KATALOG, SEARCH, FILTER & VARIAN
   ======================================================================== */
const menuData = [
  {
    id: 1,
    name: "Kopi Susu Gula Aren",
    category: "kopi",
    price: 22000,
    bestSeller: true,
    desc: "Espresso arabika dengan susu segar dan gula aren organik.",
    img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Caramel Macchiato",
    category: "kopi",
    price: 28000,
    bestSeller: false,
    desc: "Perpaduan espresso, steamed milk, dan saus karamel lembut.",
    img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Iced Americano",
    category: "kopi",
    price: 18000,
    bestSeller: false,
    desc: "Double shot espresso disajikan dingin menyegarkan.",
    img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Spanish Latte",
    category: "kopi",
    price: 27000,
    bestSeller: true,
    desc: "Espresso creamy dengan campuran susu kental manis gurih.",
    img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Kyoto Matcha Latte",
    category: "non-kopi",
    price: 26000,
    bestSeller: true,
    desc: "Bubuk matcha murni Jepang dengan susu creamy.",
    img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Belgian Dark Chocolate",
    category: "non-kopi",
    price: 25000,
    bestSeller: false,
    desc: "Cokelat pekat premium hangat maupun dingin.",
    img: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    name: "Strawberry Milk Berry",
    category: "non-kopi",
    price: 24000,
    bestSeller: false,
    desc: "Susu segar dingin dipadu selai stroberi asam manis.",
    img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    name: "Nasi Goreng Kampung",
    category: "makanan",
    price: 34000,
    bestSeller: true,
    desc: "Nasi goreng bumbu rempah dengan telur mata sapi dan sate ayam.",
    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    name: "Chicken Katsu Curry",
    category: "makanan",
    price: 38000,
    bestSeller: false,
    desc: "Ayam katsu renyah disiram saus kari Jepang gurih.",
    img: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10,
    name: "Spaghetti Carbonara",
    category: "makanan",
    price: 36000,
    bestSeller: false,
    desc: "Pasta lembut dengan saus krim keju parmesan dan smoked beef.",
    img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    name: "Butter Croissant",
    category: "camilan",
    price: 20000,
    bestSeller: false,
    desc: "Pastry berlapis renyah dengan aroma mentega Prancis.",
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    name: "Truffle French Fries",
    category: "camilan",
    price: 23000,
    bestSeller: false,
    desc: "Kentang goreng renyah dengan minyak truffle dan keju parmesan.",
    img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 13,
    name: "Cinnamon Roll Glaze",
    category: "camilan",
    price: 22000,
    bestSeller: true,
    desc: "Roti gulung kayu manis hangat dengan siraman cream cheese glaze.",
    img: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 14,
    name: "Crispy Chicken Wings",
    category: "camilan",
    price: 26000,
    bestSeller: false,
    desc: "Sayap ayam goreng tepung gurih dengan pilihan saus cocolan.",
    img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 15,
    name: "Lemon Tea Fresh",
    category: "non-kopi",
    price: 17000,
    bestSeller: false,
    desc: "Teh pilihan diseduh segar dengan perasan lemon asli.",
    img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80"
  }
];

const menuGrid = document.getElementById('menuGrid');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');

function renderMenu() {
  if (!menuGrid) return;
  const filtered = menuData.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                        item.desc.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    menuGrid.innerHTML = `<div class="empty-state"><h3>Menu tidak ditemukan</h3><p>Coba kata kunci atau kategori lain.</p></div>`;
    return;
  }

  menuGrid.innerHTML = filtered.map(item => `
    <article class="menu-card spotlight-card reveal-item">
      <div class="menu-img-wrap">
        <img src="${item.img}" alt="${item.name}" loading="lazy" />
        <span class="menu-cat-tag">${item.category}</span>
        ${item.bestSeller ? '<span class="menu-best-tag">🔥 Best Seller</span>' : ''}
      </div>
      <div class="menu-body">
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="menu-footer">
          <span class="menu-price">${formatRupiah(item.price)}</span>
          <button class="btn-add" onclick="openVariantModal(${item.id})">+ Pilih</button>
        </div>
      </div>
    </article>
  `).join('');

  bindSpotlightCards();
  initScrollReveal();
}

const variantModal = document.getElementById('variantModal');
const drinkOptionsGroup = document.getElementById('drinkOptionsGroup');

window.openVariantModal = function(id) {
  const product = menuData.find(m => m.id === id);
  if (!product || !variantModal) return;
  playSFX('click');
  selectedProductForVariant = product;

  document.getElementById('varMenuName').textContent = product.name;
  document.getElementById('varMenuDesc').textContent = `${product.desc} (${formatRupiah(product.price)})`;
  document.getElementById('varNote').value = '';

  const isDrink = product.category === 'kopi' || product.category === 'non-kopi';
  if (drinkOptionsGroup) drinkOptionsGroup.style.display = isDrink ? 'block' : 'none';

  variantModal.classList.add('open');
};

document.getElementById('closeVariantBtn')?.addEventListener('click', () => {
  playSFX('click');
  variantModal?.classList.remove('open');
});

document.getElementById('confirmVariantBtn')?.addEventListener('click', () => {
  if (!selectedProductForVariant) return;
  const isDrink = selectedProductForVariant.category === 'kopi' || selectedProductForVariant.category === 'non-kopi';
  const temp = isDrink ? (document.querySelector('input[name="varTemp"]:checked')?.value || 'Iced') : '';
  const sugar = isDrink ? (document.querySelector('input[name="varSugar"]:checked')?.value || 'Normal Sugar') : '';
  const note = document.getElementById('varNote')?.value.trim() || '';

  const variantLabel = [temp, sugar, note].filter(Boolean).join(' • ');

  addToCartWithVariant(selectedProductForVariant, variantLabel);
  variantModal?.classList.remove('open');
});

searchInput?.addEventListener('input', (e) => {
  searchKeyword = e.target.value;
  renderMenu();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    playSFX('click');
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    renderMenu();
  });
});

/* ========================================================================
   6. BAGIAN NOVAL: KERANJANG, QRIS/TUNAI, VALIDASI & RIWAYAT TRANSAKSI
   ======================================================================== */
const cartOverlay = document.getElementById('cartOverlay');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCount = document.getElementById('cartCount');

const subtotalText = document.getElementById('subtotalText');
const discountText = document.getElementById('discountText');
const taxText = document.getElementById('taxText');
const grandTotalText = document.getElementById('grandTotalText');

const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoFeedback = document.getElementById('promoFeedback');

const tableSelectGroup = document.getElementById('tableSelectGroup');
const tableNumberSelect = document.getElementById('tableNumber');
const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');

const paymentMethodSelect = document.getElementById('paymentMethod');
const cashInputGroup = document.getElementById('cashInputGroup');
const qrisPreviewGroup = document.getElementById('qrisPreviewGroup');
const cashReceivedInput = document.getElementById('cashReceived');
const cashChangeText = document.getElementById('cashChangeText');

const checkoutForm = document.getElementById('checkoutForm');
const receiptModal = document.getElementById('receiptModal');
const receiptContent = document.getElementById('receiptContent');
const historyModal = document.getElementById('historyModal');
const historyListContainer = document.getElementById('historyListContainer');

function updateCashChange() {
  if (!cashChangeText || !cashReceivedInput) return;
  const { grandTotal } = calculateTotals(true);
  const received = Number(cashReceivedInput.value || 0);
  const change = Math.max(0, received - grandTotal);
  cashChangeText.textContent = formatRupiah(change);
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartCount) cartCount.textContent = totalItems;

  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:24px 0;">Keranjang masih kosong. Pilih menu dulu yuk!</p>`;
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div>
            <strong style="font-size:0.92rem;">${item.name}</strong>
            ${item.variant ? `<div style="font-size:0.76rem; color:var(--accent);">${item.variant}</div>` : ''}
            <div style="font-size:0.82rem; color:var(--text-secondary);">${formatRupiah(item.price)} x ${item.qty}</div>
          </div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="changeQtyByKey('${item.cartKey}', -1)">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="changeQtyByKey('${item.cartKey}', 1)">+</button>
          </div>
        </div>
      `).join('');
    }
  }

  const { subtotal, discount, tax, grandTotal } = calculateTotals(false);
  if (subtotalText) subtotalText.textContent = formatRupiah(subtotal);
  if (discountText) discountText.textContent = `- ${formatRupiah(discount)}`;
  if (taxText) taxText.textContent = formatRupiah(tax);
  if (grandTotalText) grandTotalText.textContent = formatRupiah(grandTotal);

  updateCashChange();
  syncDynamicIslandIdle(grandTotal, totalItems);
}

function addToCartWithVariant(product, variantLabel) {
  const cartKey = `${product.id}-${variantLabel}`;
  const existing = cart.find(c => c.cartKey === cartKey);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      ...product,
      cartKey,
      variant: variantLabel,
      qty: 1
    });
  }
  playSFX('pop');
  updateCartUI();
  notifyDynamicIsland(`✅ +1 ${product.name}`);
}

window.changeQtyByKey = function(cartKey, delta) {
  const index = cart.findIndex(c => c.cartKey === cartKey);
  if (index === -1) return;
  const itemName = cart[index].name;
  cart[index].qty += delta;
  playSFX('pop');
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
    notifyDynamicIsland(`🗑️ ${itemName} dihapus`);
  } else {
    notifyDynamicIsland(delta > 0 ? `➕ ${itemName}` : `➖ ${itemName}`);
  }
  updateCartUI();
};

openCartBtn?.addEventListener('click', () => {
  playSFX('click');
  cartOverlay?.classList.add('open');
});
closeCartBtn?.addEventListener('click', () => {
  playSFX('click');
  cartOverlay?.classList.remove('open');
});
cartOverlay?.addEventListener('click', (e) => {
  if (e.target === cartOverlay) cartOverlay.classList.remove('open');
});

applyPromoBtn?.addEventListener('click', () => {
  const code = (promoInput?.value || '').trim().toUpperCase();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (code === 'HEMAT10') {
    appliedPromo = 'HEMAT10';
    if (promoFeedback) promoFeedback.textContent = '✅ Promo HEMAT10 (Diskon 10%) berhasil diterapkan!';
    playSFX('pop');
    notifyDynamicIsland('🎉 Diskon 10% Aktif');
  } else if (code === 'RASA20') {
    if (subtotal >= 50000) {
      appliedPromo = 'RASA20';
      if (promoFeedback) promoFeedback.textContent = '✅ Promo RASA20 (Diskon 20%) berhasil diterapkan!';
      playSFX('pop');
      notifyDynamicIsland('🎉 Diskon 20% Aktif');
    } else {
      appliedPromo = null;
      if (promoFeedback) promoFeedback.textContent = '⚠️ Minimal subtotal Rp 50.000 untuk kode RASA20.';
      notifyDynamicIsland('⚠️ Min. Rp 50rb untuk RASA20');
    }
  } else {
    appliedPromo = null;
    if (promoFeedback) promoFeedback.textContent = '❌ Kode promo tidak valid.';
    notifyDynamicIsland('❌ Kode promo tidak valid');
  }
  updateCartUI();
});

if (tableNumberSelect) {
  for (let i = 1; i <= 15; i++) {
    const option = document.createElement('option');
    option.value = `Meja ${i}`;
    option.textContent = `Meja ${i}`;
    tableNumberSelect.appendChild(option);
  }
}

orderTypeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    playSFX('click');
    document.getElementById('orderTypeError').textContent = '';
    if (e.target.value === 'Di Tempat') {
      if (tableSelectGroup) tableSelectGroup.style.display = 'block';
    } else {
      if (tableSelectGroup) tableSelectGroup.style.display = 'none';
      if (tableNumberSelect) tableNumberSelect.value = '';
      document.getElementById('tableError').textContent = '';
    }
  });
});

paymentMethodSelect?.addEventListener('change', (e) => {
  playSFX('click');
  const val = e.target.value;
  if (cashInputGroup) cashInputGroup.style.display = val === 'Tunai' ? 'block' : 'none';
  if (qrisPreviewGroup) qrisPreviewGroup.style.display = val === 'QRIS' ? 'block' : 'none';
  document.getElementById('cashError').textContent = '';
  updateCashChange();
});

cashReceivedInput?.addEventListener('input', updateCashChange);

checkoutForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameVal = document.getElementById('customerName')?.value.trim() || '';
  const selectedOrderType = document.querySelector('input[name="orderType"]:checked');
  const orderTypeVal = selectedOrderType ? selectedOrderType.value : '';
  const tableVal = tableNumberSelect?.value || '';
  const paymentVal = paymentMethodSelect?.value || '';
  const { subtotal, discount, tax, grandTotal } = calculateTotals(true);
  const cashVal = Number(cashReceivedInput?.value || 0);

  let isValid = true;
  document.getElementById('nameError').textContent = '';
  document.getElementById('orderTypeError').textContent = '';
  document.getElementById('tableError').textContent = '';
  document.getElementById('paymentError').textContent = '';
  document.getElementById('cashError').textContent = '';

  if (cart.length === 0) {
    notifyDynamicIsland('⚠️ Keranjang masih kosong!');
    return;
  }
  if (nameVal.length < 3) {
    document.getElementById('nameError').textContent = 'Nama pemesan minimal 3 karakter.';
    isValid = false;
  }
  if (!orderTypeVal) {
    document.getElementById('orderTypeError').textContent = 'Silakan pilih tipe pesanan.';
    isValid = false;
  } else if (orderTypeVal === 'Di Tempat' && !tableVal) {
    document.getElementById('tableError').textContent = 'Silakan pilih nomor meja (1 - 15).';
    isValid = false;
  }
  if (!paymentVal) {
    document.getElementById('paymentError').textContent = 'Silakan pilih metode pembayaran.';
    isValid = false;
  } else if (paymentVal === 'Tunai' && cashVal < grandTotal) {
    document.getElementById('cashError').textContent = `Uang tunai kurang (minimal ${formatRupiah(grandTotal)}).`;
    isValid = false;
  }

  if (!isValid) return;

  const finalOrderInfo = orderTypeVal === 'Di Tempat' ? `${orderTypeVal} (${tableVal})` : orderTypeVal;
  const cashChange = paymentVal === 'Tunai' ? cashVal - grandTotal : 0;
  const itemsListHTML = cart.map(i => `
    <div>
      ${i.name} (${i.qty}x) — ${formatRupiah(i.price * i.qty)}
      ${i.variant ? `<br><small style="color:var(--text-secondary);">↳ ${i.variant}</small>` : ''}
    </div>
  `).join('');

  if (receiptContent) {
    receiptContent.innerHTML = `
      <p><strong>Pemesan:</strong> ${nameVal}</p>
      <p><strong>Tipe / Meja:</strong> ${finalOrderInfo}</p>
      <p><strong>Pembayaran:</strong> ${paymentVal}</p>
      <div style="margin:10px 0;">${itemsListHTML}</div>
      <p>Subtotal: ${formatRupiah(subtotal)}</p>
      <p>Diskon: -${formatRupiah(discount)}</p>
      <p>PPN (10%): ${formatRupiah(tax)}</p>
      <p style="font-size:1.05rem; margin-top:6px;"><strong>Total Lunas: ${formatRupiah(grandTotal)}</strong></p>
      ${paymentVal === 'Tunai' ? `<p>Tunai: ${formatRupiah(cashVal)} • <strong>Kembalian: ${formatRupiah(cashChange)}</strong></p>` : ''}
    `;
  }

  orderHistory.unshift({
    id: 'KR-' + Date.now().toString().slice(-5),
    date: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    customer: nameVal,
    orderType: finalOrderInfo,
    payment: paymentVal,
    total: grandTotal,
    items: cart.map(i => `${i.name} x${i.qty}`).join(', ')
  });
  localStorage.setItem('kopiRasaHistory', JSON.stringify(orderHistory));

  cartOverlay?.classList.remove('open');
  receiptModal?.classList.add('open');
  launchCheckoutConfetti();
  playSFX('success');
  notifyDynamicIsland('🧾 Transaksi Tersimpan!');

  cart = [];
  appliedPromo = null;
  if (promoInput) promoInput.value = '';
  if (promoFeedback) promoFeedback.textContent = '';
  checkoutForm.reset();
  if (tableSelectGroup) tableSelectGroup.style.display = 'none';
  if (cashInputGroup) cashInputGroup.style.display = 'none';
  if (qrisPreviewGroup) qrisPreviewGroup.style.display = 'none';
  updateCartUI();
});

document.getElementById('printReceiptBtn')?.addEventListener('click', () => {
  playSFX('click');
  window.print();
});
document.getElementById('closeReceiptBtn')?.addEventListener('click', () => {
  playSFX('click');
  receiptModal?.classList.remove('open');
});

function openHistoryModal() {
  if (!historyListContainer || !historyModal) return;
  if (orderHistory.length === 0) {
    historyListContainer.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:20px 0;">Belum ada riwayat transaksi hari ini.</p>`;
  } else {
    historyListContainer.innerHTML = orderHistory.map(h => `
      <div class="history-item">
        <div style="display:flex; justify-content:space-between; font-weight:700;">
          <span>#${h.id} • ${h.customer}</span>
          <span style="color:var(--accent);">${formatRupiah(h.total)}</span>
        </div>
        <div style="font-size:0.78rem; color:var(--text-secondary); margin:4px 0;">
          ${h.date} • ${h.orderType} • ${h.payment}
        </div>
        <div style="font-size:0.8rem;">${h.items}</div>
      </div>
    `).join('');
  }
  historyModal.classList.add('open');
}

document.getElementById('openHistoryBtn')?.addEventListener('click', () => {
  playSFX('click');
  openHistoryModal();
});
document.getElementById('closeHistoryBtn')?.addEventListener('click', () => {
  playSFX('click');
  historyModal?.classList.remove('open');
});
document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
  playSFX('click');
  orderHistory = [];
  localStorage.removeItem('kopiRasaHistory');
  openHistoryModal();
  notifyDynamicIsland('🗑️ Riwayat dibersihkan');
});

initShootingStars(16);
renderMenu();
bindSpotlightCards();
initScrollReveal();
updateScrollProgress();
updateCartUI();