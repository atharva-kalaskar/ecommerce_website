






import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

export default function Register() {
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'username', type: 'text',     label: 'Username', placeholder: 'johndoe' },
    { name: 'email',    type: 'email',    label: 'Email',    placeholder: 'you@email.com' },
    { name: 'password', type: 'password', label: 'Password', placeholder: '••••••••' },
  ];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🛍</div>
        <h1 style={s.title}>Create account</h1>
        <p style={s.subtitle}>Join ShopEasy and start shopping</p>

        {error   && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          {fields.map(({ name, type, label, placeholder }) => (
            <div key={name} style={s.field}>
              <label style={s.label}>{label}</label>
              <input
                style={{ ...s.input, ...(focused === name ? s.inputFocused : {}) }}
                type={type} name={name} placeholder={placeholder}
                value={form[name]} onChange={handleChange}
                onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
                required
              />
            </div>
          ))}
          <button style={{ ...s.btn, opacity: loading ? 0.75 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={s.switch}>
          Already have an account? <Link to="/login" style={s.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#F5F6FA', padding: '20px',
  },
  card: {
    background: 'white', borderRadius: '14px', padding: '48px 44px',
    width: '100%', maxWidth: '420px', textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06)',
    animation: 'fadeUp 0.4s ease',
  },
  logo:    { fontSize: '36px', marginBottom: '16px' },
  title:   { fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '6px' },
  subtitle:{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' },
  error: {
    background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
    padding: '11px 14px', borderRadius: '8px', fontSize: '13px',
    marginBottom: '20px', textAlign: 'left',
  },
  success: {
    background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#059669',
    padding: '11px 14px', borderRadius: '8px', fontSize: '13px',
    marginBottom: '20px', textAlign: 'left',
  },
  form:  { display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '11px 14px', border: '1.5px solid #E4E7EC', borderRadius: '8px',
    fontSize: '14px', outline: 'none', fontFamily: 'Outfit, sans-serif',
    color: '#111827', background: '#FAFAFA', transition: 'all 0.15s',
  },
  inputFocused: { borderColor: '#4F46E5', background: 'white', boxShadow: '0 0 0 3px rgba(79,70,229,0.1)' },
  btn: {
    marginTop: '6px', padding: '12px', background: '#4F46E5', border: 'none',
    borderRadius: '8px', color: 'white', fontSize: '14px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
  },
  switch:     { marginTop: '24px', fontSize: '13px', color: '#6B7280' },
  switchLink: { color: '#4F46E5', fontWeight: '600', textDecoration: 'none' },
};




// // import { useState } from 'react';
// // import { useNavigate, Link } from 'react-router-dom';
// // import API from '../api/axios';

// // function Register() {
// //   const [form, setForm]       = useState({ username: '', email: '', password: '' });
// //   const [error, setError]     = useState('');
// //   const [success, setSuccess] = useState('');
// //   const navigate = useNavigate();

// //   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError('');
// //     try {
// //       await API.post('/auth/register', form);
// //       setSuccess('Registered successfully! Redirecting to login...');
// //       setTimeout(() => navigate('/login'), 2000);
// //     } catch (err) {
// //       setError(err.response?.data?.error || 'Registration failed');
// //     }
// //   };

// //   return (
// //     <div style={styles.container}>
// //       <div style={styles.card}>
// //         <h2 style={styles.title}>📝 Create Account</h2>
// //         {error   && <p style={styles.error}>{error}</p>}
// //         {success && <p style={styles.success}>{success}</p>}
// //         <form onSubmit={handleSubmit}>
// //           <input
// //             style={styles.input} type="text" name="username"
// //             placeholder="Username" value={form.username} onChange={handleChange} required
// //           />
// //           <input
// //             style={styles.input} type="email" name="email"
// //             placeholder="Email" value={form.email} onChange={handleChange} required
// //           />
// //           <input
// //             style={styles.input} type="password" name="password"
// //             placeholder="Password (min 6 chars)" value={form.password}
// //             onChange={handleChange} minLength={6} required
// //           />
// //           <button style={styles.btn} type="submit">Register</button>
// //         </form>
// //         <p style={styles.linkText}>
// //           Already have an account? <Link to="/login">Login here</Link>
// //         </p>
// //       </div>
// //     </div>
// //   );
// // }

// // const styles = {
// //   container: { display: 'flex', justifyContent: 'center', paddingTop: '60px' },
// //   card:      { background: '#fff', padding: '40px', borderRadius: '8px',
// //                boxShadow: '0 2px 15px rgba(0,0,0,0.1)', width: '360px' },
// //   title:     { textAlign: 'center', marginBottom: '24px', color: '#1a1a2e' },
// //   input:     { display: 'block', width: '100%', padding: '10px', marginBottom: '16px',
// //                border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
// //   btn:       { width: '100%', padding: '12px', background: '#27ae60', color: 'white',
// //                border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' },
// //   error:     { color: 'red', marginBottom: '12px', textAlign: 'center' },
// //   success:   { color: 'green', marginBottom: '12px', textAlign: 'center' },
// //   linkText:  { textAlign: 'center', marginTop: '16px', fontSize: '14px' },
// // };

// // export default Register;


// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import API from '../api/axios';

// function Register() {
//   const [form, setForm]       = useState({ username: '', email: '', password: '' });
//   const [error, setError]     = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [focused, setFocused] = useState(null);
//   const navigate = useNavigate();

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       await API.post('/auth/register', form);
//       setSuccess('Account created! Redirecting to login...');
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fields = [
//     { name: 'username', label: 'Username',       type: 'text',     placeholder: 'johndoe' },
//     { name: 'email',    label: 'Email Address',  type: 'email',    placeholder: 'you@example.com' },
//     { name: 'password', label: 'Password',       type: 'password', placeholder: '••••••••' },
//   ];

//   return (
//     <div style={styles.page}>
//       {/* Left Panel */}
//       <div style={styles.left}>
//         <div style={styles.leftContent}>
//           <div style={styles.bigEmoji}>✨</div>
//           <h1 style={styles.heroTitle}>Join<br /><span style={styles.heroAccent}>ShopEasy</span><br />Today</h1>
//           <p style={styles.heroSub}>Create your account and start shopping thousands of products.</p>
//           <div style={styles.stats}>
//             {[['500+', 'Products'], ['10k+', 'Happy Users'], ['99%', 'Satisfaction']].map(([val, label]) => (
//               <div key={label} style={styles.statItem}>
//                 <span style={styles.statVal}>{val}</span>
//                 <span style={styles.statLabel}>{label}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Right Panel */}
//       <div style={styles.right}>
//         <div style={styles.card}>
//           <div style={styles.cardHeader}>
//             <h2 style={styles.title}>Create Account</h2>
//             <p style={styles.subtitle}>Fill in the details to get started</p>
//           </div>

//           {error && (
//             <div style={styles.errorBox}><span>⚠️</span> {error}</div>
//           )}
//           {success && (
//             <div style={styles.successBox}><span>✅</span> {success}</div>
//           )}

//           <form onSubmit={handleSubmit} style={styles.form}>
//             {fields.map(({ name, label, type, placeholder }) => (
//               <div key={name} style={styles.fieldGroup}>
//                 <label style={styles.label}>{label}</label>
//                 <input
//                   style={{ ...styles.input, ...(focused === name ? styles.inputFocused : {}) }}
//                   type={type} name={name} placeholder={placeholder}
//                   value={form[name]} onChange={handleChange}
//                   onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
//                   required
//                 />
//               </div>
//             ))}
//             <button style={{ ...styles.btn, opacity: loading ? 0.8 : 1 }} type="submit" disabled={loading}>
//               {loading ? '⏳ Creating account...' : 'Create Account →'}
//             </button>
//           </form>

//           <p style={styles.switchText}>
//             Already have an account? <Link to="/login" style={styles.switchLink}>Sign in</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page:      { display: 'flex', minHeight: '100vh' },
//   left: {
//     flex: 1, background: 'linear-gradient(135deg, #06D6A0 0%, #6C3EF4 100%)',
//     display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px',
//   },
//   leftContent: { maxWidth: '400px' },
//   bigEmoji:    { fontSize: '56px', marginBottom: '24px' },
//   heroTitle: {
//     fontFamily: 'Syne, sans-serif', fontSize: '48px', fontWeight: '800',
//     color: 'white', lineHeight: 1.1, marginBottom: '16px',
//   },
//   heroAccent:  { color: '#FFD93D' },
//   heroSub:     { color: 'rgba(255,255,255,0.85)', fontSize: '16px', marginBottom: '40px', lineHeight: 1.6 },
//   stats:       { display: 'flex', gap: '24px' },
//   statItem: {
//     display: 'flex', flexDirection: 'column', gap: '2px',
//     background: 'rgba(255,255,255,0.15)', padding: '16px 20px', borderRadius: '14px',
//     backdropFilter: 'blur(8px)',
//   },
//   statVal:     { fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '800', color: '#FFD93D' },
//   statLabel:   { fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
//   right: {
//     flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
//     padding: '40px', background: '#F7F6FF',
//   },
//   card: {
//     background: 'white', borderRadius: '24px', padding: '48px',
//     width: '100%', maxWidth: '440px',
//     boxShadow: '0 16px 48px rgba(108,62,244,0.12)',
//   },
//   cardHeader:  { marginBottom: '32px' },
//   title: {
//     fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: '800',
//     color: '#0F0E17', marginBottom: '8px',
//   },
//   subtitle:    { color: '#6b7280', fontSize: '14px' },
//   errorBox: {
//     background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626',
//     padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
//     marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
//   },
//   successBox: {
//     background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
//     padding: '12px 16px', borderRadius: '10px', fontSize: '14px',
//     marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
//   },
//   form:       { display: 'flex', flexDirection: 'column', gap: '20px' },
//   fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
//   label:      { fontSize: '13px', fontWeight: '600', color: '#374151' },
//   input: {
//     padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '12px',
//     fontSize: '14px', outline: 'none', transition: 'all 0.2s',
//     fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#fafafa',
//   },
//   inputFocused: { borderColor: '#6C3EF4', background: 'white', boxShadow: '0 0 0 4px rgba(108,62,244,0.08)' },
//   btn: {
//     padding: '14px', borderRadius: '12px', border: 'none',
//     background: 'linear-gradient(135deg, #06D6A0, #6C3EF4)',
//     color: 'white', fontSize: '15px', fontWeight: '700',
//     cursor: 'pointer', marginTop: '8px',
//     fontFamily: 'Plus Jakarta Sans, sans-serif',
//     boxShadow: '0 8px 24px rgba(6,214,160,0.3)',
//   },
//   switchText:  { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' },
//   switchLink:  { color: '#6C3EF4', fontWeight: '600', textDecoration: 'none' },
// };

// export default Register;



