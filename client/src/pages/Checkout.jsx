


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const PAYMENT_OPTIONS = [
  { value: 'upi',         label: 'UPI',              desc: 'GPay, PhonePe, Paytm',   icon: '📲', color: '#7C3AED' },
  { value: 'credit_card', label: 'Credit Card',      desc: 'Visa, Mastercard, Amex', icon: '💳', color: '#0284C7' },
  { value: 'debit_card',  label: 'Debit Card',       desc: 'All major banks',        icon: '🏦', color: '#059669' },
  { value: 'cash',        label: 'Cash on Delivery', desc: 'Pay when it arrives',    icon: '💵', color: '#D97706' },
];

export default function Checkout() {
  const [addresses, setAddresses]         = useState([]);
  const [selectedAddr, setSelectedAddr]   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [newAddr, setNewAddr]             = useState({ flat_no: '', building_name: '', city: '', state: '', pincode: '' });
  const [showAddrForm, setShowAddrForm]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [step, setStep]                   = useState(1);

  const navigate    = useNavigate();
  const getUserData = () => JSON.parse(localStorage.getItem('user') || '{}');
  const cart        = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal    = cart.reduce((s, i) => s + i.product_price * i.quantity, 0);
  const delivery    = subtotal > 500 ? 0 : 49;
  const finalTotal  = subtotal + delivery;

  useEffect(() => {
    const u = getUserData();
    if (u.id) fetchAddresses(u.id);
  }, []); // eslint-disable-line

  const fetchAddresses = async (userId) => {
    try {
      const { data } = await API.get(`/address/${userId}`);
      setAddresses(data);
      if (data.length > 0) setSelectedAddr(data[0].address_id);
    } catch (err) { console.error(err); }
  };

  const addAddress = async () => {
    const u = getUserData();
    if (!newAddr.city || !newAddr.state || !newAddr.pincode)
      return alert('City, State and Pincode are required!');
    try {
      await API.post('/address', { user_id: u.id, ...newAddr });
      setShowAddrForm(false);
      setNewAddr({ flat_no: '', building_name: '', city: '', state: '', pincode: '' });
      fetchAddresses(u.id);
    } catch (err) { alert(err.response?.data?.error || 'Failed to add address'); }
  };

  const handleCheckout = async () => {
    const u = getUserData();
    if (!selectedAddr) return alert('Please select a delivery address!');
    setLoading(true);
    try {
      const items = cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.product_price }));
      const { data: orderData } = await API.post('/orders', { user_id: u.id, items, final_amount: finalTotal });
      await API.post('/payment', { order_id: orderData.order_id, address_id: selectedAddr, payment_method: paymentMethod });
      localStorage.removeItem('cart');
      alert('🎉 Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.error || 'Checkout failed');
    } finally { setLoading(false); }
  };

  const STEPS = [
    { label: 'Address', icon: '📍' },
    { label: 'Payment', icon: '💳' },
    { label: 'Review',  icon: '✅' },
  ];

  const selectedPayment = PAYMENT_OPTIONS.find(p => p.value === paymentMethod);

  return (
    <div style={s.page}>
      <h1 style={s.title}>🛒 Checkout</h1>

      {/* Steps */}
      <div style={s.steps}>
        {STEPS.map(({ label, icon }, i) => (
          <div key={label} style={s.stepItem}>
            <div style={{ ...s.stepCircle, ...(step > i + 1 ? s.stepDone : step === i + 1 ? s.stepActive : s.stepInactive) }}>
              {step > i + 1 ? '✓' : icon}
            </div>
            <span style={{ ...s.stepLabel, color: step === i + 1 ? '#4F46E5' : step > i + 1 ? '#059669' : '#9CA3AF' }}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div style={{ ...s.stepLine, background: step > i + 1 ? '#4F46E5' : '#E4E7EC' }} />}
          </div>
        ))}
      </div>

      <div style={s.layout}>
        <div style={s.main}>

          {/* STEP 1 — Address */}
          {step === 1 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>📍 Delivery Address</h2>
              {addresses.length === 0 && !showAddrForm && (
                <p style={s.noAddr}>🏠 No saved addresses. Add one below.</p>
              )}
              <div style={s.addrList}>
                {addresses.map((a, i) => (
                  <label key={a.address_id} style={{ ...s.addrCard, ...(selectedAddr === a.address_id ? s.addrActive : {}) }}>
                    <input type="radio" name="addr" checked={selectedAddr === a.address_id}
                      onChange={() => setSelectedAddr(a.address_id)} style={{ accentColor: '#4F46E5' }} />
                    <span style={s.addrIcon}>🏠</span>
                    <div>
                      <p style={s.addrLine1}>
                        {a.flat_no && `${a.flat_no}, `}{a.building_name && `${a.building_name}, `}{a.city}
                      </p>
                      <p style={s.addrLine2}>📌 {a.state} — {a.pincode}</p>
                    </div>
                    {selectedAddr === a.address_id && <span style={s.addrCheck}>✓</span>}
                  </label>
                ))}
              </div>

              <button style={s.addAddrBtn} onClick={() => setShowAddrForm(!showAddrForm)}>
                {showAddrForm ? '✕ Cancel' : '➕ Add new address'}
              </button>

              {showAddrForm && (
                <div style={s.addrForm}>
                  {[
                    { k: 'flat_no',       ph: '🏢 Flat No (optional)' },
                    { k: 'building_name', ph: '🏗️ Building Name (optional)' },
                    { k: 'city',          ph: '🌆 City *' },
                    { k: 'state',         ph: '📍 State *' },
                    { k: 'pincode',       ph: '📮 Pincode *' },
                  ].map(({ k, ph }) => (
                    <input key={k} style={s.addrInput} placeholder={ph}
                      value={newAddr[k]} onChange={e => setNewAddr({ ...newAddr, [k]: e.target.value })} />
                  ))}
                  <button style={s.saveAddrBtn} onClick={addAddress}>💾 Save Address</button>
                </div>
              )}
              <button style={{ ...s.nextBtn, opacity: !selectedAddr ? 0.6 : 1 }} onClick={() => setStep(2)} disabled={!selectedAddr}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 2 — Payment */}
          {step === 2 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>💳 Payment Method</h2>
              <div style={s.payList}>
                {PAYMENT_OPTIONS.map(({ value, label, desc, icon, color }) => (
                  <label key={value} style={{ ...s.payCard, ...(paymentMethod === value ? s.payActive : {}) }}>
                    <input type="radio" name="pay" value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value)} style={{ accentColor: '#4F46E5' }} />
                    <div style={{ ...s.payIconBox, background: color + '15', border: `1px solid ${color}30` }}>
                      <span style={{ fontSize: '22px' }}>{icon}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={s.payLabel}>{label}</p>
                      <p style={s.payDesc}>{desc}</p>
                    </div>
                    {paymentMethod === value && <span style={s.payCheck}>✓</span>}
                  </label>
                ))}
              </div>
              <div style={s.btnRow}>
                <button style={s.backBtn} onClick={() => setStep(1)}>← Back</button>
                <button style={s.nextBtn2} onClick={() => setStep(3)}>Review Order →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>✅ Review & Place Order</h2>

              {addresses.filter(a => a.address_id === selectedAddr).map(a => (
                <div key={a.address_id} style={s.reviewBox}>
                  <p style={s.reviewLabel}>📍 Delivering to</p>
                  <p style={s.reviewValue}>
                    {a.flat_no && `${a.flat_no}, `}{a.building_name && `${a.building_name}, `}
                    {a.city}, {a.state} — {a.pincode}
                  </p>
                </div>
              ))}

              <div style={s.reviewBox}>
                <p style={s.reviewLabel}>💳 Payment via</p>
                <div style={s.reviewPayRow}>
                  <span style={{ fontSize: '20px' }}>{selectedPayment?.icon}</span>
                  <p style={s.reviewValue}>{selectedPayment?.label}</p>
                  <span style={s.reviewPayDesc}>{selectedPayment?.desc}</span>
                </div>
              </div>

              <div style={{ ...s.reviewBox, background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                <p style={s.reviewLabel}>💰 Amount Payable</p>
                <p style={{ ...s.reviewValue, fontSize: '24px', fontWeight: '800', color: '#4F46E5' }}>
                  ₹{finalTotal.toLocaleString()}
                </p>
              </div>

              <div style={s.btnRow}>
                <button style={s.backBtn} onClick={() => setStep(2)}>← Back</button>
                <button style={{ ...s.placeBtn, opacity: loading ? 0.75 : 1 }} onClick={handleCheckout} disabled={loading}>
                  {loading ? '⏳ Placing order...' : '🎉 Place Order & Pay'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={s.sidebar}>
          <h3 style={s.sideTitle}>🧾 Order Summary</h3>
          {cart.map(i => (
            <div key={i.product_id} style={s.sideRow}>
              <span style={s.sideName}>{i.product_name} <span style={{ color: '#9CA3AF' }}>×{i.quantity}</span></span>
              <span style={s.sideAmt}>₹{(i.product_price * i.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div style={s.sideDivider} />
          <div style={s.sideRow}>
            <span style={s.sideMuted}>🏷️ Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div style={s.sideRow}>
            <span style={s.sideMuted}>🚚 Delivery</span>
            <span style={delivery === 0 ? { color: '#059669', fontWeight: '600' } : {}}>
              {delivery === 0 ? '🎉 Free' : `₹${delivery}`}
            </span>
          </div>
          <div style={s.sideDivider} />
          <div style={s.sideTotal}>
            <span style={{ fontWeight: '600' }}>💰 Total</span>
            <span style={s.sideTotalAmt}>₹{finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:     { padding: '36px 40px', maxWidth: '1100px', margin: '0 auto' },
  title:    { fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' },
  steps: {
    display: 'flex', alignItems: 'center', background: 'white',
    padding: '18px 24px', borderRadius: '10px', border: '1px solid #E4E7EC',
    marginBottom: '24px',
  },
  stepItem:     { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 },
  stepCircle: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', flexShrink: 0,
  },
  stepActive:   { background: '#4F46E5', color: 'white' },
  stepDone:     { background: '#059669', color: 'white' },
  stepInactive: { background: '#F3F4F6', color: '#9CA3AF' },
  stepLabel:    { fontSize: '13px', fontWeight: '600' },
  stepLine:     { flex: 1, height: '2px', margin: '0 8px', borderRadius: '2px' },
  layout:       { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' },
  section:      { background: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #E4E7EC' },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '20px' },
  noAddr: {
    background: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '8px',
    padding: '14px', textAlign: 'center', color: '#6B7280', fontSize: '13px', marginBottom: '14px',
  },
  addrList:   { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' },
  addrCard: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
    border: '1.5px solid #E4E7EC', borderRadius: '10px', cursor: 'pointer',
  },
  addrActive:  { borderColor: '#4F46E5', background: '#EEF2FF' },
  addrIcon:    { fontSize: '20px' },
  addrLine1:   { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '3px' },
  addrLine2:   { fontSize: '12px', color: '#6B7280' },
  addrCheck: {
    marginLeft: 'auto', width: '22px', height: '22px', borderRadius: '50%',
    background: '#4F46E5', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', flexShrink: 0,
  },
  addAddrBtn: {
    background: 'none', border: '1px dashed #D1D5DB', borderRadius: '8px',
    padding: '9px 14px', cursor: 'pointer', color: '#4F46E5',
    fontSize: '13px', fontWeight: '500', marginBottom: '16px',
    fontFamily: 'Outfit, sans-serif',
  },
  addrForm: {
    background: '#F9FAFB', borderRadius: '8px', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px',
  },
  addrInput: {
    padding: '10px 12px', border: '1.5px solid #E4E7EC', borderRadius: '8px',
    fontSize: '13px', outline: 'none', fontFamily: 'Outfit, sans-serif',
    background: 'white', color: '#111827',
  },
  saveAddrBtn: {
    padding: '10px', background: '#4F46E5', border: 'none', borderRadius: '8px',
    color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
  },
  nextBtn: {
    width: '100%', padding: '12px', background: '#4F46E5', border: 'none',
    borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', marginTop: '8px', fontFamily: 'Outfit, sans-serif',
  },
  payList:     { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  payCard: {
    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px',
    border: '1.5px solid #E4E7EC', borderRadius: '10px', cursor: 'pointer',
  },
  payActive:   { borderColor: '#4F46E5', background: '#EEF2FF' },
  payIconBox: {
    width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  payLabel:    { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px' },
  payDesc:     { fontSize: '12px', color: '#6B7280' },
  payCheck: {
    marginLeft: 'auto', width: '22px', height: '22px', borderRadius: '50%',
    background: '#4F46E5', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', flexShrink: 0,
  },
  btnRow:      { display: 'flex', gap: '10px' },
  backBtn: {
    flex: 1, padding: '11px', background: 'white', border: '1px solid #E4E7EC',
    borderRadius: '8px', color: '#6B7280', fontSize: '13px', cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
  },
  nextBtn2: {
    flex: 2, padding: '11px', background: '#4F46E5', border: 'none',
    borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
  },
  reviewBox:    { background: '#F9FAFB', borderRadius: '10px', padding: '16px', marginBottom: '12px' },
  reviewLabel:  { fontSize: '11px', fontWeight: '600', color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  reviewPayRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  reviewValue:  { fontSize: '15px', fontWeight: '600', color: '#111827' },
  reviewPayDesc:{ fontSize: '12px', color: '#9CA3AF', marginLeft: '4px' },
  placeBtn: {
    flex: 2, padding: '11px', background: '#4F46E5', border: 'none',
    borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
  },
  sidebar: {
    background: 'white', borderRadius: '12px', padding: '22px',
    border: '1px solid #E4E7EC', position: 'sticky', top: '80px',
  },
  sideTitle:    { fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px' },
  sideRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: '13px',
    color: '#374151', marginBottom: '10px',
  },
  sideName:     { color: '#6B7280', maxWidth: '160px', lineHeight: 1.4 },
  sideAmt:      { fontWeight: '600', color: '#111827' },
  sideMuted:    { color: '#6B7280' },
  sideDivider:  { height: '1px', background: '#F3F4F6', margin: '12px 0' },
  sideTotal:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sideTotalAmt: { fontSize: '20px', fontWeight: '700', color: '#111827' },
};













// // import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import API from '../api/axios';

// // function Checkout() {
// //   const [addresses, setAddresses]         = useState([]);
// //   const [selectedAddr, setSelectedAddr]   = useState('');
// //   const [paymentMethod, setPaymentMethod] = useState('upi');
// //   const [newAddr, setNewAddr]             = useState({ flat_no: '', building_name: '', city: '', state: '', pincode: '' });
// //   const [showAddrForm, setShowAddrForm]   = useState(false);
// //   const [loading, setLoading]             = useState(false);

// //   const navigate = useNavigate();

// //   // Always read fresh from localStorage
// //   const getUserData = () => JSON.parse(localStorage.getItem('user') || '{}');
// //   const cart  = JSON.parse(localStorage.getItem('cart') || '[]');
// //   const total = cart.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

// //   useEffect(() => {
// //     const userData = getUserData();
// //     if (userData.id) fetchAddresses(userData.id);
// //   }, []); // eslint-disable-line

// //   const fetchAddresses = async (userId) => {
// //     try {
// //       const { data } = await API.get(`/address/${userId}`);
// //       setAddresses(data);
// //       if (data.length > 0) setSelectedAddr(data[0].address_id);
// //     } catch (err) {
// //       console.error('Failed to fetch addresses:', err);
// //     }
// //   };

// //   const addAddress = async () => {
// //     const userData = getUserData();

// //     if (!newAddr.city || !newAddr.state || !newAddr.pincode)
// //       return alert('City, State and Pincode are required!');

// //     try {
// //       await API.post('/address', {
// //         user_id:       userData.id,
// //         flat_no:       newAddr.flat_no,
// //         building_name: newAddr.building_name,
// //         city:          newAddr.city,
// //         state:         newAddr.state,
// //         pincode:       newAddr.pincode,
// //       });
// //       setShowAddrForm(false);
// //       setNewAddr({ flat_no: '', building_name: '', city: '', state: '', pincode: '' });
// //       fetchAddresses(userData.id);
// //     } catch (err) {
// //       alert(err.response?.data?.error || 'Failed to add address');
// //     }
// //   };

// //   const handleCheckout = async () => {
// //     const userData = getUserData();
// //     if (!selectedAddr) return alert('Please select a delivery address!');
// //     if (cart.length === 0) return alert('Your cart is empty!');
// //     setLoading(true);
// //     try {
// //       const items = cart.map(i => ({
// //         product_id: i.product_id,
// //         quantity:   i.quantity,
// //         unit_price: i.product_price,
// //       }));
// //       const { data: orderData } = await API.post('/orders', { user_id: userData.id, items });
// //       await API.post('/payment', {
// //         order_id:       orderData.order_id,
// //         address_id:     selectedAddr,
// //         payment_method: paymentMethod,
// //       });
// //       localStorage.removeItem('cart');
// //       alert('🎉 Order placed & payment successful!');
// //       navigate('/orders');
// //     } catch (err) {
// //       alert(err.response?.data?.error || 'Checkout failed');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div style={{ maxWidth: '600px', margin: '0 auto' }}>
// //       <h2 style={{ color: '#1a1a2e' }}>✅ Checkout</h2>

// //       <div style={styles.section}>
// //         <h3>🧾 Order Summary</h3>
// //         {cart.map(i => (
// //           <div key={i.product_id} style={styles.summaryRow}>
// //             <span>{i.product_name} × {i.quantity}</span>
// //             <span>₹{(i.product_price * i.quantity).toLocaleString()}</span>
// //           </div>
// //         ))}
// //         <div style={{ ...styles.summaryRow, fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
// //           <span>Total</span>
// //           <span style={{ color: '#e74c3c' }}>₹{total.toLocaleString()}</span>
// //         </div>
// //       </div>

// //       <div style={styles.section}>
// //         <h3>📍 Delivery Address</h3>
// //         {addresses.length === 0 && !showAddrForm && (
// //           <p style={{ color: '#999', fontSize: '14px' }}>No addresses found. Add one below.</p>
// //         )}
// //         {addresses.map(a => (
// //           <label key={a.address_id} style={styles.addrOption}>
// //             <input type="radio" name="address" value={a.address_id}
// //               checked={selectedAddr === a.address_id}
// //               onChange={() => setSelectedAddr(a.address_id)} />
// //             &nbsp; {a.flat_no && `${a.flat_no}, `}
// //             {a.building_name && `${a.building_name}, `}
// //             {a.city}, {a.state} - {a.pincode}
// //           </label>
// //         ))}
// //         <button style={styles.addAddrBtn} onClick={() => setShowAddrForm(!showAddrForm)}>
// //           {showAddrForm ? '✕ Cancel' : '+ Add New Address'}
// //         </button>
// //         {showAddrForm && (
// //           <div style={{ marginTop: '12px' }}>
// //             {[
// //               { key: 'flat_no',       placeholder: 'Flat No (optional)' },
// //               { key: 'building_name', placeholder: 'Building Name (optional)' },
// //               { key: 'city',          placeholder: 'City *' },
// //               { key: 'state',         placeholder: 'State *' },
// //               { key: 'pincode',       placeholder: 'Pincode *' },
// //             ].map(({ key, placeholder }) => (
// //               <input key={key} style={styles.input} placeholder={placeholder}
// //                 value={newAddr[key]}
// //                 onChange={e => setNewAddr({ ...newAddr, [key]: e.target.value })} />
// //             ))}
// //             <button style={styles.saveAddrBtn} onClick={addAddress}>Save Address</button>
// //           </div>
// //         )}
// //       </div>

// //       <div style={styles.section}>
// //         <h3>💳 Payment Method</h3>
// //         {[
// //           { value: 'upi',         label: '📱 UPI' },
// //           { value: 'credit_card', label: '💳 Credit Card' },
// //           { value: 'debit_card',  label: '💳 Debit Card' },
// //           { value: 'cash',        label: '💵 Cash on Delivery' },
// //         ].map(({ value, label }) => (
// //           <label key={value} style={styles.payOption}>
// //             <input type="radio" name="payment" value={value}
// //               checked={paymentMethod === value}
// //               onChange={() => setPaymentMethod(value)} />
// //             &nbsp; {label}
// //           </label>
// //         ))}
// //       </div>

// //       <button style={{ ...styles.placeBtn, opacity: loading ? 0.7 : 1 }}
// //         onClick={handleCheckout} disabled={loading}>
// //         {loading ? '⏳ Placing Order...' : '🛒 Place Order & Pay'}
// //       </button>
// //     </div>
// //   );
// // }

// // const styles = {
// //   section:     { background: '#fff', borderRadius: '8px', padding: '20px',
// //                  marginBottom: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)' },
// //   summaryRow:  { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '15px' },
// //   addrOption:  { display: 'block', padding: '8px 0', cursor: 'pointer', fontSize: '14px' },
// //   addAddrBtn:  { marginTop: '10px', background: 'none', border: '1px dashed #1a1a2e',
// //                  padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', color: '#1a1a2e' },
// //   saveAddrBtn: { background: '#27ae60', color: 'white', border: 'none', padding: '8px 16px',
// //                  borderRadius: '4px', cursor: 'pointer', marginTop: '8px' },
// //   input:       { display: 'block', width: '100%', padding: '8px', margin: '4px 0',
// //                  border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
// //   payOption:   { display: 'block', padding: '8px 0', cursor: 'pointer', fontSize: '14px' },
// //   placeBtn:    { width: '100%', padding: '14px', background: '#e74c3c', color: 'white',
// //                  border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' },
// // };

// // export default Checkout;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import API from '../api/axios';

// function Checkout() {
//   const [addresses, setAddresses]         = useState([]);
//   const [selectedAddr, setSelectedAddr]   = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('upi');
//   const [newAddr, setNewAddr]             = useState({ flat_no: '', building_name: '', city: '', state: '', pincode: '' });
//   const [showAddrForm, setShowAddrForm]   = useState(false);
//   const [loading, setLoading]             = useState(false);
//   const [step, setStep]                   = useState(1); // 1=address, 2=payment, 3=review

//   const navigate    = useNavigate();
//   const getUserData = () => JSON.parse(localStorage.getItem('user') || '{}');
//   const cart        = JSON.parse(localStorage.getItem('cart') || '[]');
//   const total       = cart.reduce((sum, i) => sum + i.product_price * i.quantity, 0);
//   const savings     = Math.floor(total * 0.05);
//   const delivery    = total > 500 ? 0 : 49;
//   const finalTotal  = total - savings + delivery;

//   useEffect(() => {
//     const userData = getUserData();
//     if (userData.id) fetchAddresses(userData.id);
//   }, []); // eslint-disable-line

//   const fetchAddresses = async (userId) => {
//     try {
//       const { data } = await API.get(`/address/${userId}`);
//       setAddresses(data);
//       if (data.length > 0) setSelectedAddr(data[0].address_id);
//     } catch (err) { console.error(err); }
//   };

//   const addAddress = async () => {
//     const userData = getUserData();
//     if (!newAddr.city || !newAddr.state || !newAddr.pincode)
//       return alert('City, State and Pincode are required!');
//     try {
//       await API.post('/address', { user_id: userData.id, ...newAddr });
//       setShowAddrForm(false);
//       setNewAddr({ flat_no: '', building_name: '', city: '', state: '', pincode: '' });
//       fetchAddresses(userData.id);
//     } catch (err) { alert(err.response?.data?.error || 'Failed to add address'); }
//   };

//   const handleCheckout = async () => {
//     const userData = getUserData();
//     if (!selectedAddr) return alert('Please select a delivery address!');
//     if (cart.length === 0) return alert('Your cart is empty!');
//     setLoading(true);
//     try {
//       const items = cart.map(i => ({
//         product_id: i.product_id, quantity: i.quantity, unit_price: i.product_price,
//       }));
//       const { data: orderData } = await API.post('/orders', { user_id: userData.id, items, final_amount: finalTotal });
//       await API.post('/payment', {
//         order_id: orderData.order_id, address_id: selectedAddr, payment_method: paymentMethod,
//       });
//       localStorage.removeItem('cart');
//       alert('🎉 Order placed & payment successful!');
//       navigate('/orders');
//     } catch (err) {
//       alert(err.response?.data?.error || 'Checkout failed');
//     } finally { setLoading(false); }
//   };

//   const PAYMENT_OPTIONS = [
//     { value: 'upi',         label: 'UPI',          icon: '📱', desc: 'Pay via any UPI app' },
//     { value: 'credit_card', label: 'Credit Card',  icon: '💳', desc: 'Visa, Mastercard, etc.' },
//     { value: 'debit_card',  label: 'Debit Card',   icon: '🏦', desc: 'All major banks' },
//     { value: 'cash',        label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
//   ];

//   const steps = ['Address', 'Payment', 'Review'];

//   return (
//     <div style={styles.page}>
//       <h1 style={styles.pageTitle}>Checkout</h1>

//       {/* Step Indicator */}
//       <div style={styles.steps}>
//         {steps.map((s, i) => (
//           <div key={s} style={styles.stepItem}>
//             <div style={{
//               ...styles.stepDot,
//               background: step > i + 1
//                 ? 'linear-gradient(135deg, #06D6A0, #6C3EF4)'
//                 : step === i + 1
//                 ? 'linear-gradient(135deg, #6C3EF4, #FF6B6B)' : '#e5e7eb',
//               color: step >= i + 1 ? 'white' : '#9ca3af',
//             }}>
//               {step > i + 1 ? '✓' : i + 1}
//             </div>
//             <span style={{ ...styles.stepLabel, color: step === i + 1 ? '#6C3EF4' : '#9ca3af', fontWeight: step === i + 1 ? '700' : '400' }}>
//               {s}
//             </span>
//             {i < steps.length - 1 && (
//               <div style={{ ...styles.stepLine, background: step > i + 1 ? '#6C3EF4' : '#e5e7eb' }} />
//             )}
//           </div>
//         ))}
//       </div>

//       <div style={styles.layout}>
//         <div style={styles.main}>
//           {/* Step 1 — Address */}
//           {step === 1 && (
//             <div style={styles.section}>
//               <h2 style={styles.sectionTitle}>📍 Delivery Address</h2>
//               {addresses.length === 0 && !showAddrForm && (
//                 <div style={styles.noAddrBox}>
//                   <p>No saved addresses. Add one to continue.</p>
//                 </div>
//               )}
//               <div style={styles.addrList}>
//                 {addresses.map(a => (
//                   <label key={a.address_id} style={{
//                     ...styles.addrCard,
//                     ...(selectedAddr === a.address_id ? styles.addrCardActive : {}),
//                   }}>
//                     <input type="radio" name="address" value={a.address_id}
//                       checked={selectedAddr === a.address_id}
//                       onChange={() => setSelectedAddr(a.address_id)}
//                       style={{ display: 'none' }} />
//                     <div style={styles.addrIcon}>📍</div>
//                     <div style={styles.addrText}>
//                       <p style={styles.addrLine1}>
//                         {a.flat_no && `${a.flat_no}, `}{a.building_name && `${a.building_name}, `}{a.city}
//                       </p>
//                       <p style={styles.addrLine2}>{a.state} — {a.pincode}</p>
//                     </div>
//                     {selectedAddr === a.address_id && <span style={styles.checkMark}>✓</span>}
//                   </label>
//                 ))}
//               </div>

//               <button style={styles.addAddrBtn} onClick={() => setShowAddrForm(!showAddrForm)}>
//                 {showAddrForm ? '✕ Cancel' : '+ Add New Address'}
//               </button>

//               {showAddrForm && (
//                 <div style={styles.addrForm}>
//                   {[
//                     { key: 'flat_no',       placeholder: 'Flat No (optional)' },
//                     { key: 'building_name', placeholder: 'Building Name (optional)' },
//                     { key: 'city',          placeholder: 'City *' },
//                     { key: 'state',         placeholder: 'State *' },
//                     { key: 'pincode',       placeholder: 'Pincode *' },
//                   ].map(({ key, placeholder }) => (
//                     <input key={key} style={styles.formInput} placeholder={placeholder}
//                       value={newAddr[key]}
//                       onChange={e => setNewAddr({ ...newAddr, [key]: e.target.value })} />
//                   ))}
//                   <button style={styles.saveAddrBtn} onClick={addAddress}>Save Address</button>
//                 </div>
//               )}

//               <button style={styles.nextBtn} onClick={() => setStep(2)} disabled={!selectedAddr}>
//                 Continue to Payment →
//               </button>
//             </div>
//           )}

//           {/* Step 2 — Payment */}
//           {step === 2 && (
//             <div style={styles.section}>
//               <h2 style={styles.sectionTitle}>💳 Payment Method</h2>
//               <div style={styles.payList}>
//                 {PAYMENT_OPTIONS.map(({ value, label, icon, desc }) => (
//                   <label key={value} style={{
//                     ...styles.payCard,
//                     ...(paymentMethod === value ? styles.payCardActive : {}),
//                   }}>
//                     <input type="radio" name="payment" value={value}
//                       checked={paymentMethod === value}
//                       onChange={() => setPaymentMethod(value)}
//                       style={{ display: 'none' }} />
//                     <span style={styles.payIcon}>{icon}</span>
//                     <div style={styles.payText}>
//                       <p style={styles.payLabel}>{label}</p>
//                       <p style={styles.payDesc}>{desc}</p>
//                     </div>
//                     {paymentMethod === value && <span style={styles.checkMark}>✓</span>}
//                   </label>
//                 ))}
//               </div>
//               <div style={styles.btnRow}>
//                 <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
//                 <button style={styles.nextBtn2} onClick={() => setStep(3)}>Review Order →</button>
//               </div>
//             </div>
//           )}

//           {/* Step 3 — Review */}
//           {step === 3 && (
//             <div style={styles.section}>
//               <h2 style={styles.sectionTitle}>🧾 Review Order</h2>

//               {/* Selected Address */}
//               {addresses.filter(a => a.address_id === selectedAddr).map(a => (
//                 <div key={a.address_id} style={styles.reviewBox}>
//                   <p style={styles.reviewLabel}>📍 Delivering to</p>
//                   <p style={styles.reviewValue}>
//                     {a.flat_no && `${a.flat_no}, `}{a.building_name && `${a.building_name}, `}
//                     {a.city}, {a.state} — {a.pincode}
//                   </p>
//                 </div>
//               ))}

//               {/* Selected Payment */}
//               <div style={styles.reviewBox}>
//                 <p style={styles.reviewLabel}>💳 Payment via</p>
//                 <p style={styles.reviewValue}>
//                   {PAYMENT_OPTIONS.find(p => p.value === paymentMethod)?.icon}&nbsp;
//                   {PAYMENT_OPTIONS.find(p => p.value === paymentMethod)?.label}
//                 </p>
//               </div>

//               <div style={styles.btnRow}>
//                 <button style={styles.backBtn} onClick={() => setStep(2)}>← Back</button>
//                 <button
//                   style={{ ...styles.placeBtn, opacity: loading ? 0.8 : 1 }}
//                   onClick={handleCheckout} disabled={loading}>
//                   {loading ? '⏳ Placing Order...' : '🛒 Place Order & Pay'}
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Order Summary Sidebar */}
//         <div style={styles.sidebar}>
//           <h3 style={styles.sidebarTitle}>Order Summary</h3>
//           {cart.map(i => (
//             <div key={i.product_id} style={styles.sideItem}>
//               <span style={styles.sideItemName}>{i.product_name} <span style={{ color: '#6b7280' }}>×{i.quantity}</span></span>
//               <span style={styles.sideItemPrice}>₹{(i.product_price * i.quantity).toLocaleString()}</span>
//             </div>
//           ))}
//           <div style={styles.sideDivider} />
//           <div style={styles.sideRow}><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
//           <div style={{ ...styles.sideRow, color: '#06D6A0' }}><span>Discount</span><span>−₹{savings}</span></div>
//           <div style={styles.sideRow}><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
//           <div style={styles.sideDivider} />
//           <div style={styles.sideTotal}>
//             <span>Total</span>
//             <span style={styles.sideTotalAmt}>₹{finalTotal.toLocaleString()}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page:       { padding: '32px', maxWidth: '1100px', margin: '0 auto' },
//   pageTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: '800',
//     color: '#0F0E17', marginBottom: '28px',
//   },
//   steps: {
//     display: 'flex', alignItems: 'center', marginBottom: '32px',
//     background: 'white', padding: '20px 28px', borderRadius: '16px',
//     boxShadow: '0 4px 16px rgba(108,62,244,0.07)',
//   },
//   stepItem:  { display: 'flex', alignItems: 'center', gap: '8px', flex: 1 },
//   stepDot: {
//     width: '32px', height: '32px', borderRadius: '50%',
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     fontSize: '13px', fontWeight: '700', flexShrink: 0,
//   },
//   stepLabel: { fontSize: '13px' },
//   stepLine:  { flex: 1, height: '2px', margin: '0 8px', borderRadius: '2px' },
//   layout:    { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' },
//   main:      {},
//   section: {
//     background: 'white', borderRadius: '20px', padding: '28px',
//     boxShadow: '0 4px 16px rgba(108,62,244,0.07)',
//   },
//   sectionTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800',
//     color: '#0F0E17', marginBottom: '20px',
//   },
//   noAddrBox: {
//     background: '#f7f6ff', border: '1px dashed #6C3EF4', borderRadius: '12px',
//     padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '14px', marginBottom: '16px',
//   },
//   addrList:   { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
//   addrCard: {
//     display: 'flex', alignItems: 'center', gap: '14px',
//     padding: '14px 16px', borderRadius: '14px', border: '2px solid #e5e7eb',
//     cursor: 'pointer', transition: 'all 0.2s',
//   },
//   addrCardActive: { border: '2px solid #6C3EF4', background: '#f7f6ff' },
//   addrIcon:   { fontSize: '24px' },
//   addrText:   { flex: 1 },
//   addrLine1:  { fontSize: '14px', fontWeight: '600', color: '#0F0E17' },
//   addrLine2:  { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
//   checkMark: {
//     width: '24px', height: '24px', borderRadius: '50%',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
//     fontSize: '12px', fontWeight: '700', flexShrink: 0,
//   },
//   addAddrBtn: {
//     background: 'none', border: '1.5px dashed #6C3EF4', color: '#6C3EF4',
//     padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
//     fontSize: '13px', fontWeight: '600', marginBottom: '16px',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//   },
//   addrForm: {
//     background: '#f7f6ff', borderRadius: '14px', padding: '16px',
//     display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px',
//   },
//   formInput: {
//     padding: '10px 14px', border: '2px solid #e5e7eb', borderRadius: '10px',
//     fontSize: '14px', outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif',
//     background: 'white',
//   },
//   saveAddrBtn: {
//     padding: '10px', borderRadius: '10px', border: 'none',
//     background: 'linear-gradient(135deg, #06D6A0, #6C3EF4)', color: 'white',
//     fontSize: '13px', fontWeight: '700', cursor: 'pointer',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//   },
//   nextBtn: {
//     width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)', color: 'white',
//     fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//     boxShadow: '0 8px 24px rgba(108,62,244,0.3)',
//   },
//   payList:    { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' },
//   payCard: {
//     display: 'flex', alignItems: 'center', gap: '14px',
//     padding: '14px 16px', borderRadius: '14px', border: '2px solid #e5e7eb',
//     cursor: 'pointer', transition: 'all 0.2s',
//   },
//   payCardActive: { border: '2px solid #6C3EF4', background: '#f7f6ff' },
//   payIcon:    { fontSize: '26px' },
//   payText:    { flex: 1 },
//   payLabel:   { fontSize: '14px', fontWeight: '600', color: '#0F0E17' },
//   payDesc:    { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
//   btnRow:     { display: 'flex', gap: '12px', marginTop: '8px' },
//   backBtn: {
//     flex: 1, padding: '13px', borderRadius: '12px', border: '2px solid #e5e7eb',
//     background: 'white', color: '#6b7280', fontSize: '14px', fontWeight: '600',
//     cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
//   },
//   nextBtn2: {
//     flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)', color: 'white',
//     fontSize: '14px', fontWeight: '700', cursor: 'pointer',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//     boxShadow: '0 8px 24px rgba(108,62,244,0.3)',
//   },
//   reviewBox: {
//     background: '#f7f6ff', borderRadius: '12px', padding: '16px', marginBottom: '12px',
//   },
//   reviewLabel: { fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontWeight: '600' },
//   reviewValue: { fontSize: '14px', fontWeight: '600', color: '#0F0E17' },
//   placeBtn: {
//     flex: 2, padding: '13px', borderRadius: '12px', border: 'none',
//     background: 'linear-gradient(135deg, #FF6B6B, #6C3EF4)', color: 'white',
//     fontSize: '14px', fontWeight: '700', cursor: 'pointer',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//     boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
//   },
//   sidebar: {
//     background: 'white', borderRadius: '20px', padding: '24px',
//     boxShadow: '0 4px 16px rgba(108,62,244,0.07)', position: 'sticky', top: '88px',
//   },
//   sidebarTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '800',
//     color: '#0F0E17', marginBottom: '16px',
//   },
//   sideItem: {
//     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//     padding: '8px 0', borderBottom: '1px solid #f3f4f6', fontSize: '13px',
//   },
//   sideItemName:  { color: '#374151', maxWidth: '160px' },
//   sideItemPrice: { fontWeight: '700', color: '#6C3EF4', fontSize: '13px' },
//   sideDivider:   { height: '1px', background: '#f3f4f6', margin: '12px 0' },
//   sideRow: {
//     display: 'flex', justifyContent: 'space-between', fontSize: '13px',
//     color: '#6b7280', marginBottom: '8px',
//   },
//   sideTotal: {
//     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//     fontWeight: '700', fontSize: '15px',
//   },
//   sideTotalAmt: {
//     fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '800',
//     background: 'linear-gradient(135deg, #6C3EF4, #FF6B6B)',
//     WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
//   },
// };

// export default Checkout;