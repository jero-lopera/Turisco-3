// =============================================
//  TURISCO - auth.js
//  Sistema de Autenticación con Firebase
// =============================================

const DEFAULT_PLACEHOLDERS = {
  apiKey: 'REPLACE_WITH_YOUR_API_KEY',
  authDomain: 'REPLACE_WITH_YOUR_AUTH_DOMAIN',
  projectId: 'REPLACE_WITH_YOUR_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_YOUR_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_WITH_YOUR_MESSAGING_SENDER_ID',
  appId: 'REPLACE_WITH_YOUR_APP_ID'
};

const firebaseConfig = (typeof window !== 'undefined' && window.TURISCO_CONFIG?.firebaseConfig)
  ? window.TURISCO_CONFIG.firebaseConfig
  : DEFAULT_PLACEHOLDERS;

const firebaseConfigIsValid = Object.values(firebaseConfig).every(
  value => typeof value === 'string' && value.trim() && !value.startsWith('REPLACE_')
);

if (!firebaseConfigIsValid) {
  console.warn('⚠️ Firebase no está configurado. Añade window.TURISCO_CONFIG con firebaseConfig válida.');
}

let auth = null;
let currentUser = null;
let firebaseReady = Promise.resolve(null);

function mostrarErrorAuth(mensaje) {
  console.error(mensaje);
  if (typeof alert === 'function') alert(mensaje);
}

async function initializeFirebase() {
  if (!firebaseConfigIsValid) {
    console.warn('⚠️ Firebase config no válida - autenticación deshabilitada');
    actualizarUINoAutenticado();
    return null;
  }

  try {
    const [{ initializeApp }, { getAuth, onAuthStateChanged }] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js')
    ]);

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      user ? actualizarUIAutenticado(user) : actualizarUINoAutenticado();
    });
    
    return auth;
  } catch (error) {
    console.error('Error inicializando Firebase:', error);
    actualizarUINoAutenticado();
    return null;
  }
}

firebaseReady = initializeFirebase();

async function obtenerAuth() {
  const instancia = await firebaseReady;
  if (!instancia) {
    mostrarErrorAuth('⚠️ La autenticación no está configurada. Por favor, configura Firebase.');
    return null;
  }
  return instancia;
}

// =============================================
// REGISTRO
// =============================================
async function registrarse(email, password, nombre) {
  try {
    const instancia = await obtenerAuth();
    if (!instancia) return null;

    const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    
    const userCredential = await createUserWithEmailAndPassword(instancia, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, { displayName: nombre });
    
    console.log('✅ Usuario registrado:', user.email);
    alert(`¡Bienvenido ${nombre}! Tu cuenta ha sido creada.`);
    cerrarModalRegistro();
    
    return user;
  } catch (error) {
    console.error('Error en registro:', error);
    const mensajes = {
      'auth/email-already-in-use': '❌ Este email ya está registrado',
      'auth/weak-password': '❌ La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': '❌ Email inválido'
    };
    mostrarErrorAuth(mensajes[error.code] || `❌ Error: ${error.message}`);
    return null;
  }
}

// =============================================
// INICIAR SESIÓN
// =============================================
async function iniciarSesion(email, password) {
  try {
    const instancia = await obtenerAuth();
    if (!instancia) return null;

    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    
    const userCredential = await signInWithEmailAndPassword(instancia, email, password);
    const user = userCredential.user;
    
    console.log('✅ Sesión iniciada:', user.email);
    alert(`¡Bienvenido de vuelta, ${user.displayName || user.email}!`);
    cerrarModalLogin();
    
    return user;
  } catch (error) {
    console.error('Error en login:', error);
    const mensajes = {
      'auth/user-not-found': '❌ Usuario no encontrado',
      'auth/wrong-password': '❌ Contraseña incorrecta',
      'auth/invalid-credential': '❌ Correo o contraseña incorrectos',
      'auth/invalid-email': '❌ Email inválido'
    };
    mostrarErrorAuth(mensajes[error.code] || `❌ Error: ${error.message}`);
    return null;
  }
}

// =============================================
// CERRAR SESIÓN
// =============================================
async function cerrarSesion() {
  try {
    const instancia = await obtenerAuth();
    if (!instancia) return;

    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    
    await signOut(instancia);
    console.log('✅ Sesión cerrada');
    alert('Sesión cerrada correctamente');
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    mostrarErrorAuth('❌ Error al cerrar sesión.');
  }
}

// =============================================
// ACTUALIZAR UI
// =============================================
function actualizarUIAutenticado(user) {
  const userNameEl = document.getElementById('user-name');
  const authSection = document.getElementById('auth-user-section');
  const noAuthSection = document.getElementById('auth-login-section');
  
  if (userNameEl) userNameEl.textContent = user.displayName || user.email || 'Usuario';
  if (authSection) authSection.style.display = 'flex';
  if (noAuthSection) noAuthSection.style.display = 'none';
  
  localStorage.setItem('usuarioAutenticado', 'true');
  localStorage.setItem('usuarioEmail', user.email || '');
}

function actualizarUINoAutenticado() {
  const authSection = document.getElementById('auth-user-section');
  const noAuthSection = document.getElementById('auth-login-section');
  
  if (authSection) authSection.style.display = 'none';
  if (noAuthSection) noAuthSection.style.display = 'flex';
  
  localStorage.removeItem('usuarioAutenticado');
  localStorage.removeItem('usuarioEmail');
}

// =============================================
// MODALES
// =============================================
function abrirModalLogin() {
  const modal = document.getElementById('modal-login');
  if (modal) modal.classList.add('active');
}

function cerrarModalLogin() {
  const modal = document.getElementById('modal-login');
  if (modal) modal.classList.remove('active');
  
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  if (loginEmail) loginEmail.value = '';
  if (loginPassword) loginPassword.value = '';
}

function abrirModalRegistro() {
  const modal = document.getElementById('modal-registro');
  if (modal) modal.classList.add('active');
}

function cerrarModalRegistro() {
  const modal = document.getElementById('modal-registro');
  if (modal) modal.classList.remove('active');
  
  ['registro-nombre', 'registro-email', 'registro-password', 'registro-password-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

// =============================================
// MANEJADORES DE FORMULARIOS
// =============================================
function handleLoginSubmit(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  
  if (!email || !password) {
    alert('⚠️ Por favor completa todos los campos');
    return;
  }
  
  iniciarSesion(email, password);
}

function handleRegistroSubmit(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('registro-nombre')?.value.trim();
  const email = document.getElementById('registro-email')?.value.trim();
  const password = document.getElementById('registro-password')?.value;
  const confirmacion = document.getElementById('registro-password-confirm')?.value;
  
  if (!nombre || !email || !password || !confirmacion) {
    alert('⚠️ Por favor completa todos los campos');
    return;
  }
  
  if (password !== confirmacion) {
    alert('⚠️ Las contraseñas no coinciden');
    return;
  }
  
  if (password.length < 6) {
    alert('⚠️ La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  registrarse(email, password, nombre);
}

// =============================================
// CERRAR MODALES CON CLICK FUERA
// =============================================
function closeModalOnBackdropClick(event) {
  const modalLogin = document.getElementById('modal-login');
  const modalRegistro = document.getElementById('modal-registro');
  
  if (event?.target === modalLogin) {
    cerrarModalLogin();
  } else if (event?.target === modalRegistro) {
    cerrarModalRegistro();
  }
}

// =============================================
// CERRAR CON ESC
// =============================================
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    cerrarModalLogin();
    cerrarModalRegistro();
  }
});

console.log('📱 auth.js cargado - Inicializando Firebase...');
