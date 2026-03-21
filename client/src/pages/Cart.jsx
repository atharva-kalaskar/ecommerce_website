
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ICONS = ['🎧','⌨️','🔌','💻','📷','🖥️','🖱️','📱','🎮','⌚'];

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => setCart(JSON.parse(localStorage.getItem('cart') || '[]')), []);

  const updateQty = (id, delta) => {
    const updated = cart.map(i => i.product_id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const remove = (id) => {
    const updated = cart.filter(i => i.product_id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const subtotal = cart.reduce((s, i) => s + i.product_price * i.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 49;
  const total    = subtotal + delivery;

  if (cart.length === 0)
    return (
      <div style={s.emptyPage}>
        <p style={{ fontSize: '56px' }}>🛒</p>
        <h2 style={s.emptyTitle}>Your cart is empty</h2>
        <p style={s.emptySub}>Browse our products and add something you like</p>
        <button style={s.shopBtn} onClick={() => navigate('/products')}>🏪 Browse Products</button>
      </div>
    );

  return (
    <div style={s.page}>
      <h1 style={s.title}>🛒 Your Cart <span style={s.countTag}>{cart.length} items</span></h1>

      <div style={s.layout}>
        {/* Items */}
        <div style={s.items}>
          {cart.map((item, idx) => (
            <div key={item.product_id} style={s.row}>
              <div style={s.rowIcon}>{ICONS[idx % ICONS.length]}</div>
              <div style={s.rowInfo}>
                <p style={s.rowName}>{item.product_name}</p>
                <p style={s.rowPrice}>💰 ₹{parseFloat(item.product_price).toLocaleString()} each</p>
              </div>
              <div style={s.qtyWrap}>
                <button style={s.qtyBtn} onClick={() => updateQty(item.product_id, -1)}>−</button>
                <span style={s.qty}>{item.quantity}</span>
                <button style={s.qtyBtn} onClick={() => updateQty(item.product_id, +1)}>+</button>
              </div>
              <p style={s.lineTotal}>₹{(item.product_price * item.quantity).toLocaleString()}</p>
              <button style={s.removeBtn} onClick={() => remove(item.product_id)}>🗑️</button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={s.summary}>
          <h3 style={s.summaryTitle}>🧾 Order Summary</h3>
          <div style={s.summaryRows}>
            <div style={s.sRow}>
              <span>🏷️ Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div style={s.sRow}>
              <span>🚚 Delivery</span>
              <span>{delivery === 0 ? <span style={{ color: '#059669', fontWeight: '600' }}>🎉 Free</span> : `₹${delivery}`}</span>
            </div>
          </div>
          <div style={s.divider} />
          <div style={s.totalRow}>
            <span>💰 Total</span>
            <span style={s.totalAmt}>₹{total.toLocaleString()}</span>
          </div>
          {delivery === 0 && (
            <p style={s.freeMsg}>✅ You got free delivery!</p>
          )}
          <button style={s.checkoutBtn} onClick={() => navigate('/checkout')}>
            Proceed to Checkout →
          </button>
          <button style={s.continueBtn} onClick={() => navigate('/products')}>
            🏪 Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:     { padding: '36px 40px', maxWidth: '1100px', margin: '0 auto' },
  title: {
    fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  countTag: {
    background: '#EEF2FF', color: '#4F46E5', fontSize: '13px',
    fontWeight: '600', padding: '3px 12px', borderRadius: '20px',
  },
  layout:   { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' },
  items:    { display: 'flex', flexDirection: 'column', gap: '10px' },
  row: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: 'white', padding: '16px 20px', borderRadius: '12px',
    border: '1px solid #E4E7EC',
  },
  rowIcon:  { fontSize: '32px', width: '48px', textAlign: 'center' },
  rowInfo:  { flex: 1 },
  rowName:  { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' },
  rowPrice: { fontSize: '13px', color: '#6B7280' },
  qtyWrap:  { display: 'flex', alignItems: 'center', border: '1px solid #E4E7EC', borderRadius: '8px', overflow: 'hidden' },
  qtyBtn: {
    width: '32px', height: '32px', border: 'none', background: '#F9FAFB',
    fontSize: '16px', cursor: 'pointer', color: '#374151',
  },
  qty: {
    width: '36px', textAlign: 'center', fontSize: '14px', fontWeight: '600',
    color: '#111827', borderLeft: '1px solid #E4E7EC', borderRight: '1px solid #E4E7EC',
    lineHeight: '32px',
  },
  lineTotal:  { fontWeight: '700', color: '#4F46E5', fontSize: '16px', minWidth: '80px', textAlign: 'right' },
  removeBtn:  { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' },
  summary: {
    background: 'white', borderRadius: '12px', padding: '24px',
    border: '1px solid #E4E7EC', position: 'sticky', top: '80px',
  },
  summaryTitle: { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '18px' },
  summaryRows:  { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' },
  sRow:         { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6B7280' },
  divider:      { height: '1px', background: '#F3F4F6', marginBottom: '16px' },
  totalRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontWeight: '600', fontSize: '15px', color: '#111827' },
  totalAmt:     { fontSize: '22px', fontWeight: '700', color: '#111827' },
  freeMsg: {
    background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#059669',
    padding: '10px 12px', borderRadius: '8px', fontSize: '13px',
    textAlign: 'center', marginBottom: '14px', fontWeight: '500',
  },
  checkoutBtn: {
    width: '100%', padding: '12px', background: '#4F46E5', border: 'none',
    borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', marginBottom: '8px',
  },
  continueBtn: {
    width: '100%', padding: '11px', background: 'transparent',
    border: '1px solid #E4E7EC', borderRadius: '8px', color: '#6B7280',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
  },
  emptyPage:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '12px', textAlign: 'center' },
  emptyTitle:  { fontSize: '22px', fontWeight: '700', color: '#111827' },
  emptySub:    { fontSize: '14px', color: '#6B7280', maxWidth: '280px' },
  shopBtn: {
    marginTop: '8px', padding: '11px 24px', background: '#4F46E5', border: 'none',
    borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
  },
};










// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// function Cart() {
//   const [cart, setCart] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
//   }, []);

//   const updateQty = (productId, delta) => {
//     const updated = cart.map(item =>
//       item.product_id === productId
//         ? { ...item, quantity: Math.max(1, item.quantity + delta) }
//         : item
//     );
//     setCart(updated);
//     localStorage.setItem('cart', JSON.stringify(updated));
//   };

//   const removeItem = (productId) => {
//     const updated = cart.filter(i => i.product_id !== productId);
//     setCart(updated);
//     localStorage.setItem('cart', JSON.stringify(updated));
//   };

//   const total = cart.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

//   if (cart.length === 0)
//     return (
//       <div style={{ textAlign: 'center', paddingTop: '60px' }}>
//         <h2>🛒 Your cart is empty!</h2>
//         <button style={styles.shopBtn} onClick={() => navigate('/products')}>
//           Continue Shopping
//         </button>
//       </div>
//     );

//   return (
//     <div style={{ maxWidth: '700px', margin: '0 auto' }}>
//       <h2 style={{ color: '#1a1a2e' }}>🛒 Your Cart</h2>
//       {cart.map(item => (
//         <div key={item.product_id} style={styles.row}>
//           <div>
//             <p style={styles.name}>{item.product_name}</p>
//             <p style={styles.price}>₹{parseFloat(item.product_price).toLocaleString()}</p>
//           </div>
//           <div style={styles.qtyRow}>
//             <button style={styles.qtyBtn} onClick={() => updateQty(item.product_id, -1)}>−</button>
//             <span style={styles.qty}>{item.quantity}</span>
//             <button style={styles.qtyBtn} onClick={() => updateQty(item.product_id, +1)}>+</button>
//             <button style={styles.removeBtn} onClick={() => removeItem(item.product_id)}>🗑️</button>
//           </div>
//         </div>
//       ))}
//       <div style={styles.totalRow}>
//         <strong>Total:</strong>
//         <strong style={{ color: '#e74c3c' }}>₹{total.toLocaleString()}</strong>
//       </div>
//       <button style={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
//         Proceed to Checkout →
//       </button>
//     </div>
//   );
// }

// const styles = {
//   row:         { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                  background: '#fff', padding: '16px 20px', borderRadius: '8px',
//                  marginBottom: '12px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
//   name:        { fontWeight: '600', color: '#1a1a2e', margin: 0 },
//   price:       { color: '#e74c3c', margin: '4px 0 0' },
//   qtyRow:      { display: 'flex', alignItems: 'center', gap: '10px' },
//   qtyBtn:      { width: '30px', height: '30px', border: '1px solid #ddd',
//                  background: '#f5f5f5', cursor: 'pointer', borderRadius: '4px', fontSize: '18px' },
//   qty:         { fontSize: '16px', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' },
//   removeBtn:   { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
//   totalRow:    { display: 'flex', justifyContent: 'space-between', fontSize: '20px',
//                  padding: '16px 0', borderTop: '2px solid #eee', marginTop: '8px' },
//   checkoutBtn: { width: '100%', padding: '14px', background: '#27ae60', color: 'white',
//                  border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer',
//                  marginTop: '12px' },
//   shopBtn:     { padding: '10px 24px', background: '#1a1a2e', color: 'white', border: 'none',
//                  borderRadius: '6px', fontSize: '15px', cursor: 'pointer', marginTop: '16px' },
// };

// export default Cart;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// function Cart() {
//   const [cart, setCart] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
//   }, []);

//   const updateQty = (productId, delta) => {
//     const updated = cart.map(item =>
//       item.product_id === productId
//         ? { ...item, quantity: Math.max(1, item.quantity + delta) }
//         : item
//     );
//     setCart(updated);
//     localStorage.setItem('cart', JSON.stringify(updated));
//   };

//   const removeItem = (productId) => {
//     const updated = cart.filter(i => i.product_id !== productId);
//     setCart(updated);
//     localStorage.setItem('cart', JSON.stringify(updated));
//   };

//   const total    = cart.reduce((sum, i) => sum + i.product_price * i.quantity, 0);
//   const savings  = Math.floor(total * 0.05);
//   const delivery = total > 500 ? 0 : 49;

//   const EMOJIS = ['🎧','⌨️','🔌','💻','📷','🖥️','🖱️','📱','🎮','⌚'];

//   if (cart.length === 0)
//     return (
//       <div style={styles.emptyPage}>
//         <div style={styles.emptyBox}>
//           <div style={{ fontSize: '80px', marginBottom: '16px' }}>🛒</div>
//           <h2 style={styles.emptyTitle}>Your cart is empty</h2>
//           <p style={styles.emptySub}>Add some awesome products to get started!</p>
//           <button style={styles.shopBtn} onClick={() => navigate('/products')}>
//             Browse Products →
//           </button>
//         </div>
//       </div>
//     );

//   return (
//     <div style={styles.page}>
//       <h1 style={styles.pageTitle}>Your Cart <span style={styles.countBadge}>{cart.length} items</span></h1>

//       <div style={styles.layout}>
//         {/* Items */}
//         <div style={styles.items}>
//           {cart.map((item, idx) => (
//             <div key={item.product_id} style={styles.card}>
//               <div style={{ ...styles.imgBox, background: idx % 2 === 0
//                 ? 'linear-gradient(135deg, #6C3EF4, #FF6B6B)'
//                 : 'linear-gradient(135deg, #06D6A0, #6C3EF4)' }}>
//                 <span style={{ fontSize: '32px' }}>{EMOJIS[idx % EMOJIS.length]}</span>
//               </div>
//               <div style={styles.info}>
//                 <h3 style={styles.itemName}>{item.product_name}</h3>
//                 <p style={styles.itemPrice}>₹{parseFloat(item.product_price).toLocaleString()} each</p>
//               </div>
//               <div style={styles.controls}>
//                 <div style={styles.qtyBox}>
//                   <button style={styles.qtyBtn} onClick={() => updateQty(item.product_id, -1)}>−</button>
//                   <span style={styles.qty}>{item.quantity}</span>
//                   <button style={styles.qtyBtn} onClick={() => updateQty(item.product_id, +1)}>+</button>
//                 </div>
//                 <p style={styles.subtotal}>₹{(item.product_price * item.quantity).toLocaleString()}</p>
//                 <button style={styles.removeBtn} onClick={() => removeItem(item.product_id)}>🗑️ Remove</button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Summary */}
//         <div style={styles.summary}>
//           <h3 style={styles.summaryTitle}>Order Summary</h3>

//           <div style={styles.summaryLines}>
//             <div style={styles.summaryRow}>
//               <span>Subtotal ({cart.length} items)</span>
//               <span>₹{total.toLocaleString()}</span>
//             </div>
//             <div style={{ ...styles.summaryRow, color: '#06D6A0' }}>
//               <span>💚 Discount (5%)</span>
//               <span>−₹{savings.toLocaleString()}</span>
//             </div>
//             <div style={styles.summaryRow}>
//               <span>Delivery</span>
//               <span>{delivery === 0 ? <span style={{ color: '#06D6A0' }}>FREE</span> : `₹${delivery}`}</span>
//             </div>
//           </div>

//           <div style={styles.divider} />

//           <div style={styles.totalRow}>
//             <span>Total</span>
//             <span style={styles.totalAmt}>₹{(total - savings + delivery).toLocaleString()}</span>
//           </div>

//           {total > 500 && (
//             <div style={styles.freeShipBanner}>
//               🎉 You got free delivery!
//             </div>
//           )}

//           <button style={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
//             Proceed to Checkout →
//           </button>
//           <button style={styles.continueBtn} onClick={() => navigate('/products')}>
//             ← Continue Shopping
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page:       { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
//   pageTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: '800',
//     color: '#0F0E17', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px',
//   },
//   countBadge: {
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)', color: 'white',
//     fontSize: '14px', padding: '4px 14px', borderRadius: '20px', fontWeight: '600',
//   },
//   layout:     { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' },
//   items:      { display: 'flex', flexDirection: 'column', gap: '16px' },
//   card: {
//     background: 'white', borderRadius: '18px', padding: '20px',
//     display: 'flex', alignItems: 'center', gap: '16px',
//     boxShadow: '0 4px 16px rgba(108,62,244,0.07)',
//   },
//   imgBox: {
//     width: '80px', height: '80px', borderRadius: '14px', flexShrink: 0,
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//   },
//   info:       { flex: 1 },
//   itemName: {
//     fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: '700',
//     color: '#0F0E17', marginBottom: '4px',
//   },
//   itemPrice:  { fontSize: '13px', color: '#6b7280' },
//   controls:   { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
//   qtyBox: {
//     display: 'flex', alignItems: 'center', gap: '0',
//     border: '2px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden',
//   },
//   qtyBtn: {
//     width: '34px', height: '34px', border: 'none', background: '#f9fafb',
//     fontSize: '18px', cursor: 'pointer', color: '#6C3EF4', fontWeight: '700',
//   },
//   qty: {
//     width: '36px', textAlign: 'center', fontWeight: '700',
//     fontSize: '14px', color: '#0F0E17',
//   },
//   subtotal:   { fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '800', color: '#6C3EF4' },
//   removeBtn: {
//     background: 'none', border: 'none', cursor: 'pointer',
//     fontSize: '12px', color: '#FF6B6B', fontWeight: '600',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//   },
//   summary: {
//     background: 'white', borderRadius: '20px', padding: '28px',
//     boxShadow: '0 4px 16px rgba(108,62,244,0.07)', position: 'sticky', top: '88px',
//   },
//   summaryTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800',
//     color: '#0F0E17', marginBottom: '20px',
//   },
//   summaryLines: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' },
//   summaryRow: {
//     display: 'flex', justifyContent: 'space-between',
//     fontSize: '14px', color: '#6b7280',
//   },
//   divider:    { height: '1px', background: '#f3f4f6', margin: '16px 0' },
//   totalRow: {
//     display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
//     fontWeight: '700', fontSize: '16px', color: '#0F0E17',
//   },
//   totalAmt: {
//     fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
//   },
//   freeShipBanner: {
//     background: 'linear-gradient(135deg, rgba(6,214,160,0.1), rgba(108,62,244,0.1))',
//     border: '1px solid rgba(6,214,160,0.3)', borderRadius: '10px',
//     padding: '10px 14px', fontSize: '13px', fontWeight: '600',
//     color: '#06D6A0', textAlign: 'center', marginBottom: '16px',
//   },
//   checkoutBtn: {
//     width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     color: 'white', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//     boxShadow: '0 8px 24px rgba(108,62,244,0.3)', marginBottom: '10px',
//   },
//   continueBtn: {
//     width: '100%', padding: '12px', borderRadius: '12px',
//     border: '2px solid #e5e7eb', background: 'white',
//     color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//   },
//   emptyPage:  { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' },
//   emptyBox:   { textAlign: 'center', maxWidth: '360px' },
//   emptyTitle: { fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: '800', marginBottom: '8px' },
//   emptySub:   { color: '#6b7280', marginBottom: '28px' },
//   shopBtn: {
//     padding: '12px 28px', borderRadius: '12px', border: 'none',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//   },
// };

// export default Cart;