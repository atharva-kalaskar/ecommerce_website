
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const PRODUCT_ICONS = ['🎧','⌨️','🔌','💻','📷','🖥️','🖱️','📱','🎮','⌚'];

const CATEGORIES = [
  { label: 'All',         icon: '🛍️' },
  { label: 'Electronics', icon: '💻' },
  { label: 'Audio',       icon: '🎧' },
  { label: 'Accessories', icon: '🖱️' },
  { label: 'Cameras',     icon: '📷' },
];

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [search, setSearch]         = useState('');
  const [activeCategory, setActive] = useState('All');
  const [loading, setLoading]       = useState(true);
  const [cartCount, setCartCount]   = useState(0);
  const [added, setAdded]           = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/products');
      setProducts(data);
      setFiltered(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (!q.trim()) return fetchProducts();
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const { data } = await API.post('/products/search', { query: q });
        setFiltered(data);
      } else {
        setFiltered(products.filter(p => p.product_name.toLowerCase().includes(q.toLowerCase())));
      }
    } catch (err) { console.error(err); }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find(i => i.product_id === product.product_id);
    if (ex) ex.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    setAdded(product.product_id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div style={s.page}>
      {/* Hero Banner */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <p style={s.heroTag}>🛍️ Welcome to ShopEasy</p>
          <h1 style={s.heroTitle}>Find Everything<br />You Need</h1>
          <p style={s.heroSub}>Browse our curated collection of top products</p>
          {/* Search Bar inside hero */}
          <div style={s.heroSearch}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              type="text"
              placeholder="Search for products..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>
        {/* Floating emoji decorations */}
        <div style={{ ...s.floatEmoji, top: '20%', right: '10%', fontSize: '48px', opacity: 0.15 }}>💻</div>
        <div style={{ ...s.floatEmoji, top: '55%', right: '20%', fontSize: '36px', opacity: 0.12 }}>🎧</div>
        <div style={{ ...s.floatEmoji, top: '25%', right: '30%', fontSize: '28px', opacity: 0.10 }}>📱</div>
      </div>

      <div style={s.body}>
        {/* Category Filter */}
        <div style={s.catRow}>
          {CATEGORIES.map(({ label, icon }) => (
            <button
              key={label}
              style={{ ...s.catBtn, ...(activeCategory === label ? s.catBtnActive : {}) }}
              onClick={() => setActive(label)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>
            {activeCategory === 'All' ? '📋 All Products' : `${CATEGORIES.find(c => c.label === activeCategory)?.icon} ${activeCategory}`}
          </h2>
          <span style={s.countTag}>{filtered.length} items</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={s.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} style={s.skeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: '48px' }}>🔍</p>
            <p style={s.emptyText}>No products found</p>
            <p style={s.emptySub}>Try a different search or category</p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((p, idx) => (
              <div key={p.product_id} style={s.card}>
                <div style={s.iconBox}>
                  <span style={s.icon}>{PRODUCT_ICONS[idx % PRODUCT_ICONS.length]}</span>
                  {p.stock === 0 && <span style={s.oosBadge}>Out of stock</span>}
                  {p.stock > 0 && p.stock <= 10 && <span style={s.lowBadge}>⚡ Low stock</span>}
                </div>
                <div style={s.cardBody}>
                  <p style={s.name}>{p.product_name}</p>
                  <div style={s.priceRow}>
                    <p style={s.price}>₹{parseFloat(p.product_price).toLocaleString()}</p>
                    <span style={{ ...s.stockDot, background: p.stock > 0 ? '#059669' : '#DC2626' }} />
                  </div>
                  <p style={s.stockText}>{p.stock > 0 ? `✅ ${p.stock} in stock` : '❌ Unavailable'}</p>
                </div>
                <button
                  style={{
                    ...s.addBtn,
                    ...(p.stock === 0 ? s.addBtnDisabled : {}),
                    ...(added === p.product_id ? s.addBtnAdded : {}),
                  }}
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                >
                  {added === p.product_id ? '✅ Added to cart!' : p.stock === 0 ? '❌ Out of stock' : '🛒 Add to cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <button style={s.floatCart} onClick={() => navigate('/cart')}>
          🛒 View Cart
          <span style={s.floatBadge}>{cartCount}</span>
        </button>
      )}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#F5F6FA' },

  /* Hero */
  hero: {
    position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #4338CA 100%)',
    padding: '60px 40px 70px',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: '600px' },
  heroTag: {
    fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)',
    marginBottom: '12px', letterSpacing: '0.3px',
  },
  heroTitle: {
    fontFamily: 'Outfit, sans-serif', fontSize: '42px', fontWeight: '800',
    color: 'white', lineHeight: 1.2, marginBottom: '10px',
  },
  heroSub: { fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '28px' },
  heroSearch: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'white', borderRadius: '12px', padding: '4px 16px',
    maxWidth: '480px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  searchIcon:  { fontSize: '16px' },
  searchInput: {
    flex: 1, padding: '12px 0', border: 'none', outline: 'none',
    fontSize: '15px', fontFamily: 'Outfit, sans-serif', color: '#111827',
    background: 'transparent',
  },
  floatEmoji:  { position: 'absolute', pointerEvents: 'none', userSelect: 'none' },

  /* Body */
  body:       { padding: '32px 40px', maxWidth: '1200px', margin: '0 auto' },
  catRow:     { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  catBtn: {
    padding: '8px 16px', borderRadius: '50px', border: '1.5px solid #E4E7EC',
    background: 'white', color: '#6B7280', fontSize: '13px', fontWeight: '500',
    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
  },
  catBtnActive: { background: '#4F46E5', borderColor: '#4F46E5', color: 'white', fontWeight: '600' },
  sectionHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#111827' },
  countTag: {
    background: '#EEF2FF', color: '#4F46E5', fontSize: '12px',
    fontWeight: '600', padding: '4px 12px', borderRadius: '20px',
  },

  /* Product Grid */
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px',
  },
  card: {
    background: 'white', borderRadius: '14px', overflow: 'hidden',
    border: '1px solid #E4E7EC', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s',
  },
  iconBox: {
    height: '130px', background: '#F5F6FA',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  icon:      { fontSize: '46px' },
  lowBadge: {
    position: 'absolute', top: '10px', right: '10px',
    background: '#FEF3C7', color: '#D97706',
    fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
  },
  oosBadge: {
    position: 'absolute', top: '10px', right: '10px',
    background: '#FEF2F2', color: '#DC2626',
    fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
  },
  cardBody:   { padding: '16px 16px 10px', flex: 1 },
  name:       { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px', lineHeight: 1.4 },
  priceRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  price:      { fontSize: '19px', fontWeight: '700', color: '#4F46E5' },
  stockDot:   { width: '8px', height: '8px', borderRadius: '50%' },
  stockText:  { fontSize: '12px', color: '#9CA3AF' },
  addBtn: {
    margin: '0 16px 16px', padding: '10px', border: 'none', borderRadius: '8px',
    background: '#4F46E5', color: 'white', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
  },
  addBtnDisabled: { background: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed' },
  addBtnAdded:    { background: '#059669' },

  /* Floating Cart */
  floatCart: {
    position: 'fixed', bottom: '28px', right: '28px',
    background: '#4F46E5', color: 'white', border: 'none',
    padding: '13px 22px', borderRadius: '50px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
    boxShadow: '0 4px 16px rgba(79,70,229,0.4)',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  floatBadge: {
    background: 'white', color: '#4F46E5', width: '22px', height: '22px',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '11px', fontWeight: '700',
  },

  skeleton: {
    height: '270px', borderRadius: '14px', border: '1px solid #E4E7EC',
    background: 'linear-gradient(90deg, #F5F6FA 25%, #ECEEF2 50%, #F5F6FA 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
  },
  empty:     { textAlign: 'center', padding: '80px', color: '#9CA3AF' },
  emptyText: { marginTop: '12px', fontSize: '17px', fontWeight: '600', color: '#374151' },
  emptySub:  { fontSize: '13px', marginTop: '6px' },
};



// // import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import API from '../api/axios';

// // function Products() {
// //   const [products, setProducts] = useState([]);
// //   const [search, setSearch]     = useState('');
// //   const [loading, setLoading]   = useState(true);
// //   const [cartCount, setCartCount] = useState(0); // ← NEW
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     fetchProducts();
// //     updateCartCount(); // ← NEW
// //   }, []);

// //   const updateCartCount = () => {
// //     const cart = JSON.parse(localStorage.getItem('cart') || '[]');
// //     setCartCount(cart.length);
// //   };

// //   const fetchProducts = async () => {
// //     try {
// //       const { data } = await API.get('/products');
// //       setProducts(data);
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleSearch = async (e) => {
// //     const q = e.target.value;
// //     setSearch(q);
// //     if (q.trim() === '') return fetchProducts();
// //     try {
// //       const token = localStorage.getItem('token');
// //       if (token) {
// //         const { data } = await API.post('/products/search', { query: q });
// //         setProducts(data);
// //       } else {
// //         const { data } = await API.get('/products');
// //         setProducts(data.filter(p => p.product_name.toLowerCase().includes(q.toLowerCase())));
// //       }
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   const addToCart = (product) => {
// //     const cart = JSON.parse(localStorage.getItem('cart') || '[]');
// //     const existing = cart.find(i => i.product_id === product.product_id);
// //     if (existing) {
// //       existing.quantity += 1;
// //     } else {
// //       cart.push({ ...product, quantity: 1 });
// //     }
// //     localStorage.setItem('cart', JSON.stringify(cart));
// //     updateCartCount(); // ← UPDATE COUNT after adding
// //     alert(`✅ "${product.product_name}" added to cart!`);
// //   };

// //   return (
// //     <div>
// //       <h2 style={{ color: '#1a1a2e' }}>🛍️ Products</h2>
// //       <input
// //         style={styles.searchBox}
// //         type="text"
// //         placeholder="🔍 Search products..."
// //         value={search}
// //         onChange={handleSearch}
// //       />
// //       {loading ? (
// //         <p>Loading products...</p>
// //       ) : products.length === 0 ? (
// //         <p>No products found.</p>
// //       ) : (
// //         <div style={styles.grid}>
// //           {products.map(p => (
// //             <div key={p.product_id} style={styles.card}>
// //               <div style={styles.emoji}>📦</div>
// //               <h3 style={styles.name}>{p.product_name}</h3>
// //               <p style={styles.price}>₹{parseFloat(p.product_price).toLocaleString()}</p>
// //               <p style={styles.stock}>
// //                 {p.stock > 0 ? `✅ In Stock (${p.stock})` : '❌ Out of Stock'}
// //               </p>
// //               <button
// //                 style={{ ...styles.btn, opacity: p.stock === 0 ? 0.5 : 1 }}
// //                 onClick={() => addToCart(p)}
// //                 disabled={p.stock === 0}
// //               >
// //                 Add to Cart
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* Floating Cart Button — only shows when cart has items */}
// //       {cartCount > 0 && (
// //         <button style={styles.cartBtn} onClick={() => navigate('/cart')}>
// //           🛒 View Cart ({cartCount})
// //         </button>
// //       )}
// //     </div>
// //   );
// // }

// // const styles = {
// //   searchBox: { padding: '10px 16px', width: '100%', maxWidth: '400px', fontSize: '15px',
// //                border: '1px solid #ddd', borderRadius: '6px', marginBottom: '24px', boxSizing: 'border-box' },
// //   grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
// //   card:      { background: '#fff', borderRadius: '10px', padding: '20px', textAlign: 'center',
// //                boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
// //   emoji:     { fontSize: '40px', marginBottom: '8px' },
// //   name:      { fontSize: '16px', fontWeight: '600', color: '#1a1a2e', margin: '8px 0' },
// //   price:     { fontSize: '20px', color: '#e74c3c', fontWeight: 'bold' },
// //   stock:     { fontSize: '13px', color: '#555', marginBottom: '12px' },
// //   btn:       { background: '#1a1a2e', color: 'white', border: 'none', padding: '8px 20px',
// //                borderRadius: '4px', cursor: 'pointer', width: '100%' },
// //   cartBtn:   { position: 'fixed', bottom: '30px', right: '30px', background: '#f0a500',
// //                color: 'white', border: 'none', padding: '14px 24px', borderRadius: '30px',
// //                fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
// // };

// // export default Products;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API from '../api/axios';

// const EMOJIS = ['🎧', '⌨️', '🔌', '💻', '📷', '🖥️', '🖱️', '📱', '🎮', '⌚'];
// const COLORS = [
//   'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//   'linear-gradient(135deg, #06D6A0, #6C3EF4)',
//   'linear-gradient(135deg, #FFD93D, #FF6B6B)',
//   'linear-gradient(135deg, #FF6B6B, #6C3EF4)',
//   'linear-gradient(135deg, #6C3EF4, #06D6A0)',
// ];

// function Products() {
//   const [products, setProducts]   = useState([]);
//   const [search, setSearch]       = useState('');
//   const [loading, setLoading]     = useState(true);
//   const [cartCount, setCartCount] = useState(0);
//   const [added, setAdded]         = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProducts();
//     const cart = JSON.parse(localStorage.getItem('cart') || '[]');
//     setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const { data } = await API.get('/products');
//       setProducts(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async (e) => {
//     const q = e.target.value;
//     setSearch(q);
//     if (q.trim() === '') return fetchProducts();
//     try {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const { data } = await API.post('/products/search', { query: q });
//         setProducts(data);
//       } else {
//         const { data } = await API.get('/products');
//         setProducts(data.filter(p => p.product_name.toLowerCase().includes(q.toLowerCase())));
//       }
//     } catch (err) { console.error(err); }
//   };

//   const addToCart = (product) => {
//     const cart = JSON.parse(localStorage.getItem('cart') || '[]');
//     const existing = cart.find(i => i.product_id === product.product_id);
//     if (existing) existing.quantity += 1;
//     else cart.push({ ...product, quantity: 1 });
//     localStorage.setItem('cart', JSON.stringify(cart));
//     setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
//     setAdded(product.product_id);
//     setTimeout(() => setAdded(null), 1500);
//   };

//   return (
//     <div style={styles.page}>
//       {/* Header */}
//       <div style={styles.header}>
//         <div>
//           <h1 style={styles.title}>Discover Products</h1>
//           <p style={styles.subtitle}>{products.length} items available for you</p>
//         </div>
//         {/* Search */}
//         <div style={styles.searchWrap}>
//           <span style={styles.searchIcon}>🔍</span>
//           <input
//             style={styles.search}
//             type="text" placeholder="Search products..."
//             value={search} onChange={handleSearch}
//           />
//         </div>
//       </div>

//       {/* Grid */}
//       {loading ? (
//         <div style={styles.loadingWrap}>
//           {[1,2,3,4,5,6].map(i => <div key={i} style={styles.skeleton} />)}
//         </div>
//       ) : products.length === 0 ? (
//         <div style={styles.empty}>
//           <div style={{ fontSize: '64px' }}>🔍</div>
//           <h3 style={{ fontFamily: 'Syne, sans-serif', marginTop: '16px' }}>No products found</h3>
//           <p style={{ color: '#6b7280' }}>Try a different search term</p>
//         </div>
//       ) : (
//         <div style={styles.grid}>
//           {products.map((p, idx) => (
//             <div key={p.product_id} style={styles.card}>
//               {/* Card Top */}
//               <div style={{ ...styles.cardTop, background: COLORS[idx % COLORS.length] }}>
//                 <span style={styles.cardEmoji}>{EMOJIS[idx % EMOJIS.length]}</span>
//                 {p.stock === 0 && <span style={styles.outBadge}>Out of Stock</span>}
//                 {p.stock > 0 && p.stock <= 10 && (
//                   <span style={styles.lowBadge}>Only {p.stock} left!</span>
//                 )}
//               </div>
//               {/* Card Body */}
//               <div style={styles.cardBody}>
//                 <h3 style={styles.productName}>{p.product_name}</h3>
//                 <div style={styles.priceRow}>
//                   <span style={styles.price}>₹{parseFloat(p.product_price).toLocaleString()}</span>
//                   <span style={styles.stock}>{p.stock > 0 ? `✅ ${p.stock} in stock` : '❌ Sold out'}</span>
//                 </div>
//                 <button
//                   style={{
//                     ...styles.addBtn,
//                     ...(p.stock === 0 ? styles.addBtnDisabled : {}),
//                     ...(added === p.product_id ? styles.addBtnSuccess : {}),
//                   }}
//                   onClick={() => addToCart(p)}
//                   disabled={p.stock === 0}
//                 >
//                   {added === p.product_id ? '✅ Added!' : p.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Floating Cart */}
//       {cartCount > 0 && (
//         <button style={styles.floatCart} onClick={() => navigate('/cart')}>
//           🛒 View Cart
//           <span style={styles.floatBadge}>{cartCount}</span>
//         </button>
//       )}
//     </div>
//   );
// }

// const styles = {
//   page:       { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
//   header: {
//     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//     marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
//   },
//   title: {
//     fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '800', color: '#0F0E17',
//   },
//   subtitle:   { color: '#6b7280', fontSize: '14px', marginTop: '4px' },
//   searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
//   searchIcon: { position: 'absolute', left: '14px', fontSize: '16px' },
//   search: {
//     padding: '12px 16px 12px 42px', border: '2px solid #e5e7eb', borderRadius: '14px',
//     fontSize: '14px', outline: 'none', width: '280px', background: 'white',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//     boxShadow: '0 4px 12px rgba(108,62,244,0.06)',
//     transition: 'border-color 0.2s',
//   },
//   grid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
//     gap: '24px',
//   },
//   card: {
//     background: 'white', borderRadius: '20px', overflow: 'hidden',
//     boxShadow: '0 4px 16px rgba(108,62,244,0.08)',
//     transition: 'transform 0.2s, box-shadow 0.2s',
//     cursor: 'default',
//   },
//   cardTop: {
//     height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center',
//     position: 'relative',
//   },
//   cardEmoji:  { fontSize: '52px' },
//   outBadge: {
//     position: 'absolute', top: '12px', right: '12px',
//     background: 'rgba(0,0,0,0.5)', color: 'white',
//     fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
//   },
//   lowBadge: {
//     position: 'absolute', top: '12px', right: '12px',
//     background: '#FFD93D', color: '#0F0E17',
//     fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
//   },
//   cardBody:    { padding: '20px' },
//   productName: {
//     fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700',
//     color: '#0F0E17', marginBottom: '10px', lineHeight: 1.3,
//   },
//   priceRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
//   price: {
//     fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
//   },
//   stock:       { fontSize: '11px', color: '#6b7280' },
//   addBtn: {
//     width: '100%', padding: '11px', borderRadius: '12px', border: 'none',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
//     fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s',
//     boxShadow: '0 4px 12px rgba(108,62,244,0.25)',
//   },
//   addBtnDisabled: { background: '#e5e7eb', color: '#9ca3af', boxShadow: 'none', cursor: 'not-allowed' },
//   addBtnSuccess:  { background: 'linear-gradient(135deg, #06D6A0, #6C3EF4)' },
//   floatCart: {
//     position: 'fixed', bottom: '32px', right: '32px',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     color: 'white', border: 'none', padding: '14px 24px',
//     borderRadius: '50px', fontSize: '15px', fontWeight: '700',
//     cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
//     boxShadow: '0 8px 24px rgba(108,62,244,0.4)',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//     animation: 'pulse 2s infinite',
//   },
//   floatBadge: {
//     background: '#FFD93D', color: '#0F0E17', width: '24px', height: '24px',
//     borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
//     fontSize: '12px', fontWeight: '800',
//   },
//   loadingWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' },
//   skeleton: {
//     height: '320px', borderRadius: '20px',
//     background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
//     backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
//   },
//   empty: { textAlign: 'center', padding: '80px 20px' },
// };

// export default Products;
