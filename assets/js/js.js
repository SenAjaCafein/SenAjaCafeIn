/* ========================================================================
       1. BAGIAN TSAQIF: NAVBAR HAMBURGER & DARK/LIGHT MODE
       ======================================================================== */
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');

    // Load tema tersimpan di localStorage
    const savedTheme = localStorage.getItem('kopiRasaTheme') || 'light';
    applyTheme(savedTheme);

    function applyTheme(theme) {
      htmlEl.setAttribute('data-theme', theme);
      localStorage.setItem('kopiRasaTheme', theme);
      if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
      } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark';
      }
    }

    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme');
      applyTheme(current === 'light' ? 'dark' : 'light');
    });

    hamburgerBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Tutup menu mobile saat link diklik
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });

    /* ========================================================================
       2. BAGIAN RAFIF: DATA ARRAY OF OBJECTS, RENDER KATALOG, SEARCH & FILTER
       ======================================================================== */
    const menuData = [
      {
        id: 1,
        name: "Kopi Susu Gula Aren",
        category: "kopi",
        price: 22000,
        desc: "Espresso arabika dengan susu segar dan gula aren organik.",
        img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 2,
        name: "Caramel Macchiato",
        category: "kopi",
        price: 28000,
        desc: "Perpaduan espresso, steamed milk, dan saus karamel lembut.",
        img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 3,
        name: "Iced Americano",
        category: "kopi",
        price: 18000,
        desc: "Double shot espresso disajikan dingin menyegarkan.",
        img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 4,
        name: "Kyoto Matcha Latte",
        category: "non-kopi",
        price: 26000,
        desc: "Bubuk matcha murni Jepang dengan susu creamy.",
        img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 5,
        name: "Belgian Dark Chocolate",
        category: "non-kopi",
        price: 25000,
        desc: "Cokelat pekat premium hangat maupun dingin.",
        img: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 6,
        name: "Nasi Goreng Kampung",
        category: "makanan",
        price: 34000,
        desc: "Nasi goreng bumbu rempah dengan telur mata sapi dan sate ayam.",
        img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 7,
        name: "Chicken Katsu Curry",
        category: "makanan",
        price: 38000,
        desc: "Ayam katsu renyah disiram saus kari Jepang gurih.",
        img: "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 8,
        name: "Butter Croissant",
        category: "camilan",
        price: 20000,
        desc: "Pastry berlapis renyah dengan aroma mentega Prancis.",
        img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: 9,
        name: "Truffle French Fries",
        category: "camilan",
        price: 23000,
        desc: "Kentang goreng renyah dengan minyak truffle dan keju parmesan.",
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80"
      }
    ];

    const menuGrid = document.getElementById('menuGrid');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let activeCategory = 'all';
    let searchKeyword = '';

    function formatRupiah(angka) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(angka);
    }

    function renderMenu() {
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
        <article class="menu-card">
          <div class="menu-img-wrap">
            <img src="${item.img}" alt="${item.name}" loading="lazy" />
            <span class="menu-cat-tag">${item.category}</span>
          </div>
          <div class="menu-body">
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <div class="menu-footer">
              <span class="menu-price">${formatRupiah(item.price)}</span>
              <button class="btn-add" onclick="addToCart(${item.id})">+ Tambah</button>
            </div>
          </div>
        </article>
      `).join('');
    }

    searchInput.addEventListener('input', (e) => {
      searchKeyword = e.target.value;
      renderMenu();
    });

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.category;
        renderMenu();
      });
    });

    // Render katalog awal
    renderMenu();

    /* ========================================================================
       3. BAGIAN NOVAL: KERANJANG PESANAN, KALKULATOR & VALIDASI FORM
       ======================================================================== */
    let cart = [];
    let appliedPromo = null;

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

    openCartBtn.addEventListener('click', () => cartOverlay.classList.add('open'));
    closeCartBtn.addEventListener('click', () => cartOverlay.classList.remove('open'));
    cartOverlay.addEventListener('click', (e) => {
      if (e.target === cartOverlay) cartOverlay.classList.remove('open');
    });

    window.addToCart = function(id) {
      const product = menuData.find(m => m.id === id);
      const existing = cart.find(c => c.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }
      updateCartUI();
    };

    window.changeQty = function(id, delta) {
      const index = cart.findIndex(c => c.id === id);
      if (index === -1) return;
      cart[index].qty += delta;
      if (cart[index].qty <= 0) {
        cart.splice(index, 1);
      }
      updateCartUI();
    };

    function calculateTotals() {
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      let discount = 0;

      if (appliedPromo === 'HEMAT10') {
        discount = subtotal * 0.10;
      } else if (appliedPromo === 'RASA20') {
        if (subtotal >= 50000) {
          discount = subtotal * 0.20;
        } else {
          appliedPromo = null;
          promoFeedback.textContent = 'Kode RASA20 butuh minimal belanja Rp 50.000.';
        }
      }

      const afterDiscount = Math.max(0, subtotal - discount);
      const tax = afterDiscount * 0.10; // PPN 10%
      const grandTotal = afterDiscount + tax;

      return { subtotal, discount, tax, grandTotal };
    }

    function updateCartUI() {
      const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
      cartCount.textContent = totalItems;

      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:24px 0;">Keranjang masih kosong. Pilih menu dulu yuk!</p>`;
      } else {
        cartItemsContainer.innerHTML = cart.map(item => `
          <div class="cart-item">
            <div>
              <strong style="font-size:0.92rem;">${item.name}</strong>
              <div style="font-size:0.82rem; color:var(--text-secondary);">${formatRupiah(item.price)} x ${item.qty}</div>
            </div>
            <div class="qty-controls">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            </div>
          </div>
        `).join('');
      }

      const { subtotal, discount, tax, grandTotal } = calculateTotals();
      subtotalText.textContent = formatRupiah(subtotal);
      discountText.textContent = `- ${formatRupiah(discount)}`;
      taxText.textContent = formatRupiah(tax);
      grandTotalText.textContent = formatRupiah(grandTotal);
    }

    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

      if (code === 'HEMAT10') {
        appliedPromo = 'HEMAT10';
        promoFeedback.textContent = '✅ Promo HEMAT10 (Diskon 10%) berhasil diterapkan!';
      } else if (code === 'RASA20') {
        if (subtotal >= 50000) {
          appliedPromo = 'RASA20';
          promoFeedback.textContent = '✅ Promo RASA20 (Diskon 20%) berhasil diterapkan!';
        } else {
          promoFeedback.textContent = '⚠️ Minimal subtotal Rp 50.000 untuk kode RASA20.';
        }
      } else {
        appliedPromo = null;
        promoFeedback.textContent = '❌ Kode promo tidak valid.';
      }
      updateCartUI();
    });

    // Generate opsi Meja 1 sampai 15 & logika tampil/sembunyi
    const tableSelectGroup = document.getElementById('tableSelectGroup');
    const tableNumberSelect = document.getElementById('tableNumber');
    const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');

    for (let i = 1; i <= 15; i++) {
      const option = document.createElement('option');
      option.value = `Meja ${i}`;
      option.textContent = `Meja ${i}`;
      tableNumberSelect.appendChild(option);
    }

    orderTypeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        document.getElementById('orderTypeError').textContent = '';
        if (e.target.value === 'Di Tempat') {
          tableSelectGroup.style.display = 'block';
        } else {
          tableSelectGroup.style.display = 'none';
          tableNumberSelect.value = '';
          document.getElementById('tableError').textContent = '';
        }
      });
    });

    // Validasi Form Pemesanan & Tampilkan Struk
    const checkoutForm = document.getElementById('checkoutForm');
    const receiptModal = document.getElementById('receiptModal');
    const receiptContent = document.getElementById('receiptContent');
    const closeReceiptBtn = document.getElementById('closeReceiptBtn');

    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('customerName').value.trim();
      const selectedOrderType = document.querySelector('input[name="orderType"]:checked');
      const orderTypeVal = selectedOrderType ? selectedOrderType.value : '';
      const tableVal = tableNumberSelect.value;
      const paymentVal = document.getElementById('paymentMethod').value;

      let isValid = true;
      document.getElementById('nameError').textContent = '';
      document.getElementById('orderTypeError').textContent = '';
      document.getElementById('tableError').textContent = '';
      document.getElementById('paymentError').textContent = '';

      if (cart.length === 0) {
        alert('Keranjang pesanan masih kosong!');
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
      }

      if (!isValid) return;

      const finalOrderInfo = orderTypeVal === 'Di Tempat' ? `${orderTypeVal} (${tableVal})` : orderTypeVal;
      const { subtotal, discount, tax, grandTotal } = calculateTotals();
      const itemsListHTML = cart.map(i => `<div>${i.name} (${i.qty}x) — ${formatRupiah(i.price * i.qty)}</div>`).join('');

      receiptContent.innerHTML = `
        <p><strong>Pemesan:</strong> ${nameVal}</p>
        <p><strong>Tipe / Meja:</strong> ${finalOrderInfo}</p>
        <p><strong>Pembayaran:</strong> ${paymentVal}</p>
        <div style="margin:10px 0;">${itemsListHTML}</div>
        <p>Subtotal: ${formatRupiah(subtotal)}</p>
        <p>Diskon: -${formatRupiah(discount)}</p>
        <p>PPN (10%): ${formatRupiah(tax)}</p>
        <p style="font-size:1.05rem; margin-top:6px;"><strong>Total Lunas: ${formatRupiah(grandTotal)}</strong></p>
      `;

      cartOverlay.classList.remove('open');
      receiptModal.classList.add('open');

      // Reset keranjang, form, & sembunyikan pilihan meja kembali
      cart = [];
      appliedPromo = null;
      promoInput.value = '';
      promoFeedback.textContent = '';
      checkoutForm.reset();
      tableSelectGroup.style.display = 'none';
      updateCartUI();
    });

    closeReceiptBtn.addEventListener('click', () => {
      receiptModal.classList.remove('open');
    });

    // Inisialisasi tampilan keranjang awal
    updateCartUI();