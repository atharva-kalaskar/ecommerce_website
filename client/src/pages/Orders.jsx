


import { useState, useEffect } from 'react';
import API from '../api/axios';

const STATUS = {
  pending:   { label: '⏳ Pending',   color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  confirmed: { label: '✅ Confirmed', color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
  shipped:   { label: '🚚 Shipped',   color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
  delivered: { label: '📦 Delivered', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
  cancelled: { label: '❌ Cancelled', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

const PROGRESS = ['pending', 'confirmed', 'shipped', 'delivered'];
const PROGRESS_ICONS = ['⏳', '✅', '🚚', '📦'];

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    API.get(`/orders/${user.id}`)
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading)
    return (
      <div style={s.page}>
        <h1 style={s.title}>📦 My Orders</h1>
        {[1,2,3].map(i => <div key={i} style={s.skeleton} />)}
      </div>
    );

  if (orders.length === 0)
    return (
      <div style={s.emptyPage}>
        <p style={{ fontSize: '56px' }}>📦</p>
        <h2 style={s.emptyTitle}>No orders yet</h2>
        <p style={s.emptySub}>Your order history will appear here</p>
      </div>
    );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>📦 My Orders</h1>
        <span style={s.count}>{orders.length} order{orders.length > 1 ? 's' : ''}</span>
      </div>

      <div style={s.list}>
        {orders.map(order => {
          const cfg = STATUS[order.status] || STATUS.pending;
          const progIdx = PROGRESS.indexOf(order.status);
          return (
            <div key={order.order_id} style={s.card}>
              {/* Header */}
              <div style={s.cardHead}>
                <div>
                  <p style={s.orderNum}>Order #{order.order_id}</p>
                  <p style={s.orderDate}>
                    🗓️ {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
                <span style={{ ...s.badge, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
              </div>

              {/* Progress Tracker */}
              {order.status !== 'cancelled' && (
                <div style={s.progress}>
                  {PROGRESS.map((step, i) => (
                    <div key={step} style={s.progStep}>
                      <div style={{ ...s.progDot, background: progIdx >= i ? '#4F46E5' : '#E4E7EC' }}>
                        <span style={{ fontSize: '12px' }}>{progIdx >= i ? PROGRESS_ICONS[i] : '○'}</span>
                      </div>
                      <span style={{ ...s.progLabel, color: progIdx >= i ? '#4F46E5' : '#9CA3AF', fontWeight: progIdx === i ? '700' : '400' }}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </span>
                      {i < PROGRESS.length - 1 && (
                        <div style={{ ...s.progLine, background: progIdx > i ? '#4F46E5' : '#E4E7EC' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Items */}
              <div style={s.items}>
                {order.items.map(item => (
                  <div key={item.item_id} style={s.item}>
                    <span style={s.itemName}>📦 {item.product_name}</span>
                    <span style={s.itemQty}>×{item.quantity}</span>
                    <span style={s.itemPrice}>₹{parseFloat(item.unit_price).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={s.cardFoot}>
                <span style={s.footNote}>🛍️ {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                <span style={s.footTotal}>
                  💰 Total: <strong style={{ color: '#111827' }}>₹{parseFloat(order.total_amount).toLocaleString()}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page:    { padding: '36px 40px', maxWidth: '860px', margin: '0 auto' },
  header:  { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  title:   { fontSize: '24px', fontWeight: '700', color: '#111827' },
  count: {
    background: '#EEF2FF', color: '#4F46E5', fontSize: '13px',
    fontWeight: '600', padding: '3px 12px', borderRadius: '20px',
  },
  list:    { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: {
    background: 'white', borderRadius: '14px', padding: '22px',
    border: '1px solid #E4E7EC', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  orderNum:  { fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '3px' },
  orderDate: { fontSize: '12px', color: '#9CA3AF' },
  badge:     { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  progress: {
    display: 'flex', alignItems: 'flex-start', background: '#F9FAFB',
    borderRadius: '10px', padding: '14px 16px', marginBottom: '16px',
  },
  progStep:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flex: 1, position: 'relative' },
  progDot: {
    width: '28px', height: '28px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  progLabel: { fontSize: '11px', textAlign: 'center' },
  progLine:  { position: 'absolute', top: '14px', left: '50%', width: '100%', height: '2px', zIndex: 0 },
  items:     { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  item: {
    display: 'flex', alignItems: 'center', padding: '9px 12px',
    background: '#F9FAFB', borderRadius: '8px', gap: '10px',
  },
  itemName:  { flex: 1, fontSize: '13px', color: '#374151', fontWeight: '500' },
  itemQty:   { fontSize: '12px', color: '#9CA3AF' },
  itemPrice: { fontSize: '13px', fontWeight: '600', color: '#4F46E5' },
  cardFoot: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '14px', borderTop: '1px solid #F3F4F6',
    fontSize: '13px', color: '#6B7280',
  },
  footNote:  {},
  footTotal: {},
  skeleton: {
    height: '180px', borderRadius: '14px', border: '1px solid #E4E7EC',
    background: 'linear-gradient(90deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%)',
    backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', marginBottom: '16px',
  },
  emptyPage:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '12px', textAlign: 'center' },
  emptyTitle: { fontSize: '22px', fontWeight: '700', color: '#111827' },
  emptySub:   { fontSize: '14px', color: '#6B7280' },
};












// // import { useState, useEffect } from 'react';
// // import API from '../api/axios';

// // const STATUS_COLORS = {
// //   pending:   '#f0a500',
// //   confirmed: '#3498db',
// //   shipped:   '#9b59b6',
// //   delivered: '#27ae60',
// //   cancelled: '#e74c3c',
// // };

// // function Orders() {
// //   const [orders, setOrders]   = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const user = JSON.parse(localStorage.getItem('user') || '{}');

// //   useEffect(() => {
// //     const fetchOrders = async () => {
// //       try {
// //         const { data } = await API.get(`/orders/${user.id}`);
// //         setOrders(data);
// //       } catch (err) {
// //         console.error(err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchOrders();
// //   }, [user.id]); 

// //   if (loading) return <p>Loading orders...</p>;

// //   if (orders.length === 0)
// //     return <div style={{ textAlign: 'center', paddingTop: '60px' }}>
// //       <h2>📦 No orders yet!</h2>
// //     </div>;

// //   return (
// //     <div style={{ maxWidth: '750px', margin: '0 auto' }}>
// //       <h2 style={{ color: '#1a1a2e' }}>📦 My Orders</h2>
// //       {orders.map(order => (
// //         <div key={order.order_id} style={styles.card}>
// //           <div style={styles.header}>
// //             <span><strong>Order #{order.order_id}</strong></span>
// //             <span style={{ ...styles.badge, background: STATUS_COLORS[order.status] || '#999' }}>
// //               {order.status.toUpperCase()}
// //             </span>
// //           </div>
// //           <p style={styles.date}>🗓️ {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
// //           <table style={styles.table}>
// //             <thead>
// //               <tr>
// //                 <th style={styles.th}>Product</th>
// //                 <th style={styles.th}>Qty</th>
// //                 <th style={styles.th}>Price</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {order.items.map(item => (
// //                 <tr key={item.item_id}>
// //                   <td style={styles.td}>{item.product_name}</td>
// //                   <td style={styles.td}>{item.quantity}</td>
// //                   <td style={styles.td}>₹{parseFloat(item.unit_price).toLocaleString()}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //           <div style={styles.total}>
// //             Total: <strong style={{ color: '#e74c3c' }}>₹{parseFloat(order.total_amount).toLocaleString()}</strong>
// //           </div>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }

// // const styles = {
// //   card:   { background: '#fff', borderRadius: '10px', padding: '20px',
// //             marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
// //   header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
// //   badge:  { color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
// //   date:   { color: '#666', fontSize: '13px', marginTop: '6px' },
// //   table:  { width: '100%', borderCollapse: 'collapse', marginTop: '12px' },
// //   th:     { textAlign: 'left', padding: '8px', background: '#f5f5f5', fontSize: '13px' },
// //   td:     { padding: '8px', borderBottom: '1px solid #f0f0f0', fontSize: '14px' },
// //   total:  { textAlign: 'right', marginTop: '12px', fontSize: '16px' },
// // };

// // export default Orders;

// import { useState, useEffect } from 'react';
// import API from '../api/axios';

// const STATUS_CONFIG = {
//   pending:   { color: '#FFD93D', bg: '#fffbeb', label: '⏳ Pending' },
//   confirmed: { color: '#6C3EF4', bg: '#f5f3ff', label: '✅ Confirmed' },
//   shipped:   { color: '#06D6A0', bg: '#f0fdf4', label: '🚚 Shipped' },
//   delivered: { color: '#06D6A0', bg: '#f0fdf4', label: '📦 Delivered' },
//   cancelled: { color: '#FF6B6B', bg: '#fff5f5', label: '❌ Cancelled' },
// };

// function Orders() {
//   const [orders, setOrders]   = useState([]);
//   const [loading, setLoading] = useState(true);
//   const user = JSON.parse(localStorage.getItem('user') || '{}');

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const { data } = await API.get(`/orders/${user.id}`);
//         setOrders(data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();
//   }, []); // eslint-disable-line

//   if (loading)
//     return (
//       <div style={styles.page}>
//         <h1 style={styles.pageTitle}>My Orders</h1>
//         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//           {[1,2,3].map(i => <div key={i} style={styles.skeleton} />)}
//         </div>
//       </div>
//     );

//   if (orders.length === 0)
//     return (
//       <div style={styles.emptyPage}>
//         <div style={styles.emptyBox}>
//           <div style={{ fontSize: '80px' }}>📦</div>
//           <h2 style={styles.emptyTitle}>No orders yet</h2>
//           <p style={styles.emptySub}>Place your first order and it'll appear here!</p>
//         </div>
//       </div>
//     );

//   return (
//     <div style={styles.page}>
//       <div style={styles.header}>
//         <h1 style={styles.pageTitle}>My Orders</h1>
//         <span style={styles.countChip}>{orders.length} orders</span>
//       </div>

//       <div style={styles.list}>
//         {orders.map((order, idx) => {
//           const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
//           return (
//             <div key={order.order_id} style={styles.card}>
//               {/* Card Header */}
//               <div style={styles.cardHead}>
//                 <div style={styles.orderMeta}>
//                   <span style={styles.orderNum}>Order #{order.order_id}</span>
//                   <span style={styles.orderDate}>
//                     🗓️ {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
//                   </span>
//                 </div>
//                 <div style={{ ...styles.statusBadge, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.color}33` }}>
//                   {cfg.label}
//                 </div>
//               </div>

//               {/* Progress Bar */}
//               <div style={styles.progressWrap}>
//                 {['pending','confirmed','shipped','delivered'].map((s, i) => (
//                   <div key={s} style={styles.progressStep}>
//                     <div style={{
//                       ...styles.progressDot,
//                       background: ['pending','confirmed','shipped','delivered'].indexOf(order.status) >= i
//                         ? 'linear-gradient(135deg, #6C3EF4, #FF6B6B)' : '#e5e7eb'
//                     }} />
//                     <span style={styles.progressLabel}>{s}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* Items */}
//               <div style={styles.itemsGrid}>
//                 {order.items.map(item => (
//                   <div key={item.item_id} style={styles.itemChip}>
//                     <span style={styles.itemChipName}>{item.product_name}</span>
//                     <span style={styles.itemChipQty}>×{item.quantity}</span>
//                     <span style={styles.itemChipPrice}>₹{parseFloat(item.unit_price).toLocaleString()}</span>
//                   </div>
//                 ))}
//               </div>

//               {/* Footer */}
//               <div style={styles.cardFoot}>
//                 <span style={styles.footLabel}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
//                 <div style={styles.totalWrap}>
//                   <span style={styles.totalLabel}>Order Total</span>
//                   <span style={styles.totalAmt}>₹{parseFloat(order.total_amount).toLocaleString()}</span>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page:        { padding: '32px', maxWidth: '900px', margin: '0 auto' },
//   header:      { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' },
//   pageTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: '800', color: '#0F0E17',
//   },
//   countChip: {
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)', color: 'white',
//     fontSize: '13px', fontWeight: '600', padding: '4px 14px', borderRadius: '20px',
//   },
//   list:        { display: 'flex', flexDirection: 'column', gap: '20px' },
//   card: {
//     background: 'white', borderRadius: '20px', padding: '24px',
//     boxShadow: '0 4px 16px rgba(108,62,244,0.07)', overflow: 'hidden',
//   },
//   cardHead:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
//   orderMeta:   { display: 'flex', flexDirection: 'column', gap: '4px' },
//   orderNum: {
//     fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '800', color: '#0F0E17',
//   },
//   orderDate:   { fontSize: '13px', color: '#6b7280' },
//   statusBadge: {
//     padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
//   },
//   progressWrap: {
//     display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
//     marginBottom: '20px', padding: '16px', background: '#fafafa', borderRadius: '12px',
//     position: 'relative',
//   },
//   progressStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 },
//   progressDot:  { width: '14px', height: '14px', borderRadius: '50%' },
//   progressLabel:{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' },
//   itemsGrid:   { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' },
//   itemChip: {
//     display: 'flex', alignItems: 'center', gap: '8px',
//     background: '#f7f6ff', border: '1px solid rgba(108,62,244,0.1)',
//     padding: '8px 14px', borderRadius: '10px',
//   },
//   itemChipName: { fontSize: '13px', fontWeight: '600', color: '#0F0E17' },
//   itemChipQty:  { fontSize: '12px', color: '#6b7280' },
//   itemChipPrice:{ fontSize: '13px', fontWeight: '700', color: '#6C3EF4' },
//   cardFoot: {
//     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//     paddingTop: '16px', borderTop: '1px solid #f3f4f6',
//   },
//   footLabel:   { fontSize: '13px', color: '#6b7280' },
//   totalWrap:   { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
//   totalLabel:  { fontSize: '12px', color: '#6b7280' },
//   totalAmt: {
//     fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
//   },
//   skeleton: {
//     height: '200px', borderRadius: '20px',
//     background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
//     backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
//   },
//   emptyPage:   { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' },
//   emptyBox:    { textAlign: 'center' },
//   emptyTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: '800',
//     marginBottom: '8px', marginTop: '16px',
//   },
//   emptySub:    { color: '#6b7280' },
// };

// export default Orders;
