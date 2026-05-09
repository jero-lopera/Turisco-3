// =============================================
//  TURISCO - main.js
//  ✅ PASO 1 - Menú con scroll suave
//  ✅ PASO 2 - Botones hero funcionando
//  ✅ PASO 3 - Hora en tiempo real
//  ✅ PASO 4 - Detectar ubicación del usuario
//  ✅ PASO 5 - Clima real con OpenWeatherMap
//  🔜 PASO 6 - Buscador conectado a destinos
// =============================================

const API_KEY_CLIMA = '8fe318cf34b450bc6643ce5daecb4da3';

// =============================================
// ✅ PASO 3 — Hora local en tiempo real
// =============================================
function actualizarHora() {
  try {
    const horaFormateada = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const el = document.getElementById('hora-actual');
    if (el) el.textContent = '🕒 ' + horaFormateada;
  } catch (e) {
    console.error('Error actualizando hora:', e);
  }
}
actualizarHora();
setInterval(actualizarHora, 1000);


// =============================================
// ✅ PASO 4 — Detectar ciudad del usuario
// =============================================
function detectarUbicacion() {
  const el = document.getElementById('ciudad-actual');
  if (!navigator.geolocation) {
    if (el) el.textContent = 'Ubicación no disponible';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // También aprovechamos para pedir el clima de la ubicación actual
      obtenerClimaUbicacion(lat, lon);

      fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json')
        .then(r => r.json())
        .then(data => {
          // Validar que data y data.address existan
          if (data && data.address) {
            const ciudad = data.address.city || data.address.town || data.address.village || 'Tu ciudad';
            if (el) el.textContent = ciudad;
          } else {
            if (el) el.textContent = 'Tu ubicación';
          }
        })
        .catch(err => { 
          console.error('Error detectando ubicación:', err);
          if (el) el.textContent = 'Tu ubicación'; 
        });
    },
    function (err) { 
      console.error('Geolocation error:', err);
      if (el) el.textContent = 'Medellín'; 
    }
  );
}


// =============================================
// ✅ PASO 5 — Clima real con OpenWeatherMap
// =============================================

// Iconos según el código de clima de la API
function obtenerIconoClima(id) {
  if (id >= 200 && id < 300) return '⛈';
  if (id >= 300 && id < 400) return '🌦';
  if (id >= 500 && id < 600) return '🌧';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫';
  if (id === 800)             return '☀️';
  if (id > 800)               return '🌤';
  return '🌡';
}

// Etiqueta según lluvia o no
function obtenerEtiqueta(id) {
  if (id >= 200 && id < 600) return { texto: 'Lluvia hoy', clase: 'tag-rain' };
  return { texto: 'Buen clima', clase: 'tag-ok' };
}

// Clima de la ubicación actual del usuario
function obtenerClimaUbicacion(lat, lon) {
  fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + API_KEY_CLIMA + '&units=metric&lang=es')
    .then(r => r.json())
    .then(data => {
      // Validar que data.main y data.weather existan
      if (!data || !data.main || !data.weather || data.weather.length === 0) {
        console.warn('Datos de clima incompletos');
        return;
      }

      const temp  = Math.round(data.main.temp);
      const id    = data.weather[0].id;
      const desc  = data.weather[0].description || 'Clima';
      const icono = obtenerIconoClima(id);
      const etiq  = obtenerEtiqueta(id);

      // Actualizar la tarjeta de "Tu ubicación" en la sección clima
      const iconoEl = document.querySelector('#clima-tuubicacion .big-icon');
      const descEl  = document.querySelector('#clima-tuubicacion p');
      const tagEl   = document.querySelector('#clima-tuubicacion .clima-tag');

      if (iconoEl) iconoEl.textContent = icono;
      if (descEl)  descEl.textContent  = temp + '°C · ' + desc;
      if (tagEl)   { 
        tagEl.textContent = etiq.texto; 
        tagEl.className = 'clima-tag ' + etiq.clase; 
      }
    })
    .catch(err => console.error('No se pudo obtener el clima de tu ubicación:', err));
}

// Clima de una ciudad fija por nombre
function obtenerClimaCiudad(ciudad, elementoId) {
  // Validar que elementoId sea válido
  if (!ciudad || !elementoId || typeof elementoId !== 'string') {
    console.warn('Parámetros inválidos en obtenerClimaCiudad:', ciudad, elementoId);
    return;
  }

  fetch('https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(ciudad) + '&appid=' + API_KEY_CLIMA + '&units=metric&lang=es')
    .then(r => r.json())
    .then(data => {
      // Validar que data.main y data.weather existan
      if (!data || !data.main || !data.weather || data.weather.length === 0) {
        console.warn('Datos de clima incompletos para:', ciudad);
        return;
      }

      const temp  = Math.round(data.main.temp);
      const id    = data.weather[0].id;
      const desc  = data.weather[0].description || 'Clima';
      const icono = obtenerIconoClima(id);
      const etiq  = obtenerEtiqueta(id);

      const iconoEl = document.querySelector('#' + elementoId + ' .big-icon');
      const descEl  = document.querySelector('#' + elementoId + ' p');
      const tagEl   = document.querySelector('#' + elementoId + ' .clima-tag');

      if (iconoEl) iconoEl.textContent = icono;
      if (descEl)  descEl.textContent  = temp + '°C · ' + desc;
      if (tagEl)   { 
        tagEl.textContent = etiq.texto; 
        tagEl.className = 'clima-tag ' + etiq.clase; 
      }
    })
    .catch(err => console.error('Error clima para', ciudad + ':', err));
}

// Llamar clima de cada ciudad en la sección
obtenerClimaCiudad('Cartagena,CO',  'clima-cartagena');
obtenerClimaCiudad('Santa Marta,CO','clima-santamarta');
obtenerClimaCiudad('San Andres,CO', 'clima-sanandres');

// Iniciar detección de ubicación (también llama obtenerClimaUbicacion)
detectarUbicacion();


// =============================================
// 🔜 PASO 6 — Buscador de destinos
// =============================================
const destinos = [
  { nombre: 'Cartagena de Indias', region: 'Bolívar · Caribe',  clima: 'soleado', distancia: 640  },
  { nombre: 'Guatapé',             region: 'Antioquia',          clima: 'nublado', distancia: 80   },
  { nombre: 'Leticia, Amazonas',   region: 'Amazonas · Selva',   clima: 'soleado', distancia: 1200 },
  { nombre: 'La Guajira',          region: 'Guajira · Desierto', clima: 'soleado', distancia: 850  },
  { nombre: 'Santa Marta',         region: 'Magdalena · Caribe', clima: 'nublado', distancia: 700  },
  { nombre: 'San Andrés',          region: 'Isla · Caribe',      clima: 'soleado', distancia: 1300 },
  { nombre: 'Villa de Leyva',      region: 'Boyacá',             clima: 'soleado', distancia: 350  },
];

function buscar() {
  try {
    const inputEl = document.querySelector('.search-bar input');
    const termino = inputEl ? inputEl.value.trim().toLowerCase() : '';

    if (!termino) {
      alert('✈️ Escribe un destino para buscar, por ejemplo: Cartagena, Amazonas, Guajira...');
      return;
    }

    const resultados = destinos.filter(d =>
      d.nombre.toLowerCase().includes(termino) ||
      d.region.toLowerCase().includes(termino)
    );

    if (resultados.length === 0) {
      alert('No encontramos "' + termino + '".\nIntenta con: Cartagena, Guatapé, Amazonas, Guajira...');
    } else {
      const lista = resultados.map(d => '📍 ' + d.nombre + ' — ' + d.region).join('\n');
      alert('Resultados para "' + termino + '":\n\n' + lista + '\n\n(Próximamente como tarjetas 🚀)');
    }
  } catch (e) {
    console.error('Error en función buscar:', e);
    alert('Ocurrió un error en la búsqueda. Por favor, intenta de nuevo.');
  }
}
