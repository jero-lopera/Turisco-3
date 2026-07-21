// =============================================
//  TURISCO - auth.js
//  Sistema de Autenticación con Firebase
//  Maneja: Registro, Login, Logout, Estado de usuario
// =============================================

// ⚠️ IMPORTANTE: Debes crear tu proyecto en Firebase
// 1. Ve a: https://firebase.google.com/
// 2. Crea un proyecto nuevo
// 3. Copia la configuración aquí

const firebaseConfig = {
  apiKey: "AIzaSyDemoKey123456789", // ← Reemplaza con tu key
  authDomain: "turisco-app.firebaseapp.com",
  projectId: "turisco-app",
  storageBucket: "turisco-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
let auth = null;
let currentUser = null;

async function initializeFirebase() {
  try {
    // Importar dinámicamente Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);

    // Escuchar cambios de autenticación
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (user) {
        console.log('✅ Usuario autenticado:', user.email);
        actualizarUIAutenticado(user);
      } else {
        console.log('❌ Usuario no autenticado');
        actualizarUINoAutenticado();
      }
    });

    return auth;
  } catch (error) {
    console.error('Error inicializando Firebase:', error);
  }
}

// =============================================
// REGISTRO DE NUEVO USUARIO
// =============================================
async function registrarse(email, password, nombre) {
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');

    // Crear usuario en Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Actualizar perfil con el nombre
    await updateProfile(user, {
      displayName: nombre
    });

    console.log('✅ Usuario registrado exitosamente:', user.email);
    alert(`¡Bienvenido ${nombre}! Tu cuenta ha sido creada.`);
    
    // Cerrar modal de registro
    cerrarModalRegistro();
    
    return user;
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Mensajes de error específicos
    if (error.code === 'auth/email-already-in-use') {
      alert('❌ Este email ya está registrado');
    } else if (error.code === 'auth/weak-password') {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
    } else if (error.code === 'auth/invalid-email') {
      alert('❌ Email inválido');
    } else {
      alert('❌ Error: ' + error.message);
    }
  }
}

// =============================================
// INICIAR SESIÓN
// =============================================
async function iniciarSesion(email, password) {
  try {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ Sesión iniciada:', user.email);
    alert(`¡Bienvenido de vuelta, ${user.displayName || user.email}!`);
    
    // Cerrar modal de login
    cerrarModalLogin();
    
    return user;
  } catch (error) {
    console.error('Error en login:', error);
    
    if (error.code === 'auth/user-not-found') {
      alert('❌ Usuario no encontrado');
    } else if (error.code === 'auth/wrong-password') {
      alert('❌ Contraseña incorrecta');
    } else if (error.code === 'auth/invalid-email') {
      alert('❌ Email inválido');
    } else {
      alert('❌ Error: ' + error.message);
    }
  }
}

// =============================================
// CERRAR SESIÓN
// =============================================
async function cerrarSesion() {
  try {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    
    await signOut(auth);
    console.log('✅ Sesión cerrada');
    alert('Sesión cerrada correctamente');
    
    currentUser = null;
    actualizarUINoAutenticado();
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    alert('❌ Error al cerrar sesión: ' + error.message);
  }
}

// =============================================
// ACTUALIZAR UI CUANDO ESTÁ AUTENTICADO
// =============================================
function actualizarUIAutenticado(user) {
  // Mostrar nombre del usuario
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = user.displayName || user.email;
  }

  // Mostrar sección autenticada
  const authSection = document.getElementById('auth-user-section');
  const noAuthSection = document.getElementById('auth-login-section');
  
  if (authSection) authSection.style.display = 'flex';
  if (noAuthSection) noAuthSection.style.display = 'none';

  // Guardar en localStorage
  localStorage.setItem('usuarioAutenticado', 'true');
  localStorage.setItem('usuarioEmail', user.email);
}

// =============================================
// ACTUALIZAR UI CUANDO NO ESTÁ AUTENTICADO
// =============================================
function actualizarUINoAutenticado() {
  // Mostrar botones de login
  const authSection = document.getElementById('auth-user-section');
  const noAuthSection = document.getElementById('auth-login-section');
  
  if (authSection) authSection.style.display = 'none';
  if (noAuthSection) noAuthSection.style.display = 'flex';

  // Limpiar localStorage
  localStorage.removeItem('usuarioAutenticado');
  localStorage.removeItem('usuarioEmail');
}

// =============================================
// MODALES (Abrir y Cerrar)
// =============================================
function abrirModalLogin() {
  const modal = document.getElementById('modal-login');
  if (modal) modal.style.display = 'flex';
}

function cerrarModalLogin() {
  const modal = document.getElementById('modal-login');
  if (modal) modal.style.display = 'none';
  // Limpiar campos
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
}

function abrirModalRegistro() {
  const modal = document.getElementById('modal-registro');
  if (modal) modal.style.display = 'flex';
}

function cerrarModalRegistro() {
  const modal = document.getElementById('modal-registro');
  if (modal) modal.style.display = 'none';
  // Limpiar campos
  document.getElementById('registro-nombre').value = '';
  document.getElementById('registro-email').value = '';
  document.getElementById('registro-password').value = '';
  document.getElementById('registro-password-confirm').value = '';
}

// =============================================
// FUNCIONES DE FORMULARIOS
// =============================================
function handleLoginSubmit(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('⚠️ Por favor completa todos los campos');
    return;
  }

  iniciarSesion(email, password);
}

function handleRegistroSubmit(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('registro-nombre').value.trim();
  const email = document.getElementById('registro-email').value.trim();
  const password = document.getElementById('registro-password').value;
  const passwordConfirm = document.getElementById('registro-password-confirm').value;

  if (!nombre || !email || !password || !passwordConfirm) {
    alert('⚠️ Por favor completa todos los campos');
    return;
  }

  if (password !== passwordConfirm) {
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
// CERRAR MODALES AL HACER CLICK FUERA
// =============================================
function closeModalOnBackdropClick(event) {
  const modalLogin = document.getElementById('modal-login');
  const modalRegistro = document.getElementById('modal-registro');

  if (event.target === modalLogin) {
    cerrarModalLogin();
  }
  if (event.target === modalRegistro) {
    cerrarModalRegistro();
  }
}

// =============================================
// INICIALIZAR
// =============================================
console.log('📱 auth.js cargado - Inicializando Firebase...');
initializeFirebase();
