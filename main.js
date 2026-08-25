// =============================================
//  TURISCO - main.js (modificado para seguridad y robustez)
//  - Usar CONFIG inyectada desde servidor/CI (window.__TURISCO_CONFIG__)
//  - OpenRouteService via POST con Authorization header (mejor práctica)
//  - Nominatim: agregar parámetros de contacto/idioma
//  - Guardar coordenadas reales al persistir búsquedas
//  - Mejor manejo de errores al agregar favoritos
// =============================================

const CONFIG = window.__TURISCO_CONFIG__ || {
  API_KEY_CLIMA: 'REPLACE_WITH_YOUR_OPENWEATHER_KEY',
  ORS_KEY: 'REPLACE_WITH_YOUR_OPENROUTESERVICE_KEY',
  CONTACT_EMAIL: 'tu-email@dominio.com' // para Nominatim
};

const API_KEY_CLIMA = CONFIG.API_KEY_CLIMA;
const OPEN_ROUTE_SERVICE_API = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

// =============================================
// Función para obtener tiempo y distancia entre dos puntos (OpenRouteService)
// =============================================
async function calcularDistanciaYTiempo(latOrigen, lonOrigen, latDestino, lonDestino) {
  try {
    if (!CONFIG.ORS_KEY) {
      console.warn('ORS key no configurada (usar proxy en servidor es más seguro)');
      return null;
    }

    const body = {
      coordinates: [
        [lonOrigen, latOrigen],
        [lonDestino, latDestino]
      ]
    };

    const res = await fetch(OPEN_ROUTE_SERVICE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CONFIG.ORS_KEY
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      console.warn('OpenRouteService responded with', res.status);
      return null;
    }

    const data = await res.json();

    // Diferentes formatos de respuesta: try to read common fields
    const summary = (data.features && data.features[0] && data.features[0].properties && data.features[0].properties.summary) ||
                    (data.routes && data.routes[0] && data.routes[0].summary) || null;

    let distanciaMetros = null;
    let tiempoSegundos = null;
    if (summary) {
      distanciaMetros = summary.distance;
      tiempoSegundos = summary.duration;
    } else if (data.routes && data.routes[0] && data.routes[0].segments && data.routes[0].segments[0]) {
      distanciaMetros = data.routes[0].segments[0].distance;
      tiempoSegundos = data.routes[0].segments[0].duration;
    } else {
      console.warn('Formato de respuesta ORS inesperado', data);
      return null;
    }

    const distanciaKm = (distanciaMetros / 1000).toFixed(1);
    const tiempoHoras = Math.floor(tiempoSegundos / 3600);
    const tiempoMinutos = Math.floor((tiempoSegundos % 3600) / 60);

    return {
      distanciaKm: parseFloat(distanciaKm),
      distanciaMetros,
      tiempoSegundos,
      tiempoFormato: `${tiempoHoras}h ${tiempoMinutos}m`,
      tiempoHoras,
      tiempoMinutos
    };
  } catch (error) {
    console.error('Error calculando distancia:', error);
    return null;
  }
}

// =============================================
// Obtener coordenadas con Nominatim (agrega contacto y idioma)
// =============================================
async function obtenerCoordenadas(ciudad) {
  try {
    const extras = `&format=json&limit=1&accept-language=es&email=${encodeURIComponent(CONFIG.CONTACT_EMAIL)}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ciudad)}${extras}`;
    const response = await fetch(url, { headers: { 'Referer': location.origin } });
    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn(`No se encontraron coordenadas para: ${ciudad}`);
      return null;
    }

    return {
      latitud: parseFloat(data[0].lat),
      longitud: parseFloat(data[0].lon),
      nombre: data[0].display_name
    };
  } catch (error) {
    console.error(`Error obteniendo coordenadas para ${ciudad}:`, error);
    return null;
  }
}

// =============================================
// Funciones de BD y favoritos (mejor manejo de errores)
// =============================================
async function esperarBaseDatos(timeout = 5000) {
  const inicio = Date.now();
  while (!window.turiscoDb || !turiscoDb.db) {
    if (Date.now() - inicio > timeout) {
      console.warn('Timeout esperando BD');
      return false;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return true;
}

async function agregarAFavoritos(nombreDestino, region, clima, distancia) {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const coordDestino = await obtenerCoordenadas(nombreDestino);
    const coordenadas = coordDestino ? { latitud: coordDestino.latitud, longitud: coordDestino.longitud } : null;

    await turiscoDb.agregarFavorito(nombreDestino, region, clima, distancia, coordenadas);
    alert(`❤️ ${nombreDestino} agregado a favoritos!`);
  } catch (error) {
    console.error('Error agregando favorito:', error);
    if (error && error.name === 'ConstraintError') {
      alert('⚠️ Este destino ya está en favoritos');
    } else {
      alert('⚠️ Error al guardar favorito');
    }
  }
}

// Mostrar favoritos (sin cambios funcionales)
async function mostrarFavoritos() {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const favoritos = await turiscoDb.obtenerFavoritos();
    if (!favoritos || favoritos.length === 0) {
      alert('📌 Aún no tienes destinos favoritos. ¡Agrega algunos!');
      return;
    }
    const lista = favoritos.map(f => `❤️ ${f.nombreDestino} (${f.region}) - ${f.distancia}km`).join('\n');
    alert(`Tus favoritos:\n\n${lista}`);
  } catch (error) {
    console.error('Error mostrando favoritos:', error);
  }
}

// Guardar búsqueda en la base de datos
async function guardarBusquedaEnBD(destino, lat, lon, clima) {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      console.warn('⚠️ BD no disponible para guardar búsqueda');
      return;
    }
    await turiscoDb.guardarBusqueda(destino, lat, lon, clima);
    console.log('📝 Búsqueda guardada en la base de datos');
  } catch (error) {
    console.error('Error guardando búsqueda:', error);
  }
}

// Ver historial
async function verHistorial() {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const historial = await turiscoDb.obtenerHistorial(10);
    if (!historial || historial.length === 0) {
      alert('📜 No hay historial de búsquedas aún.');
      return;
    }
    const lista = historial.map(h => `🔍 ${h.destino} (${h.fechaLegible})`).join('\n');
    alert(`Últimas 10 búsquedas:\n\n${lista}`);
  } catch (error) {
    console.error('Error viendo historial:', error);
  }
}

// =============================================
// Hora local
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
// Detectar ubicación
// =============================================
let coordenadasUsuario = null;

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

      coordenadasUsuario = { latitud: lat, longitud: lon };
      obtenerClimaUbicacion(lat, lon);

      fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json&accept-language=es&email=' + encodeURIComponent(CONFIG.CONTACT_EMAIL))
        .then(r => r.json())
        .then(data => {
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
// Clima (OpenWeatherMap)
// =============================================
function obtenerIconoClima(id) {
  if (id >= 200 && id < 300) return '⛈';
  if (id >= 300 && id < 400) return '🌦';
  if (id >= 500 && id < 600) return '🌧';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫';
  if (id === 800) return '☀️';
  if (id > 800) return '🌤';
  return '🌡';
}

function obtenerEtiqueta(id) {
  if (id >= 200 && id < 600) return { texto: 'Lluvia hoy', clase: 'tag-rain' };
  return { texto: 'Buen clima', clase: 'tag-ok' };
}

function obtenerClimaUbicacion(lat, lon) {
  if (!API_KEY_CLIMA) {
    console.warn('OpenWeather API key no configurada');
    return;
  }
  fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + API_KEY_CLIMA + '&units=metric&lang=es')
    .then(r => r.json())
    .then(data => {
      if (!data || !data.main || !data.weather || data.weather.length === 0) {
        console.warn('Datos de clima incompletos');
        return;
      }

      const temp  = Math.round(data.main.temp);
      const id    = data.weather[0].id;
      const desc  = data.weather[0].description || 'Clima';
      const icono = obtenerIconoClima(id);
      const etiq  = obtenerEtiqueta(id);

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

function obtenerClimaCiudad(ciudad, elementoId) {
  if (!ciudad || !elementoId || typeof elementoId !== 'string') {
    console.warn('Parámetros inválidos en obtenerClimaCiudad:', ciudad, elementoId);
    return;
  }

  if (!API_KEY_CLIMA) {
    console.warn('OpenWeather API key no configurada');
    return;
  }

  fetch('https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(ciudad) + '&appid=' + API_KEY_CLIMA + '&units=metric&lang=es')
    .then(r => r.json())
    .then(data => {
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

// Llamadas iniciales
obtenerClimaCiudad('Cartagena,CO',  'clima-cartagena');
obtenerClimaCiudad('Santa Marta,CO','clima-santamarta');
obtenerClimaCiudad('San Andres,CO', 'clima-sanandres');

detectarUbicacion();

// =============================================
// Buscador: usar coordenadas reales y guardar búsquedas en paralelo
// =============================================
const destinos = [
  { nombre: 'Cartagena de Indias', region: 'Bolívar · Caribe',  clima: 'soleado', distancia: 640, ciudad: 'Cartagena' },
  { nombre: 'Guatapé',             region: 'Antioquia',          clima: 'nublado', distancia: 80,   ciudad: 'Guatapé' },
  { nombre: 'Leticia, Amazonas',   region: 'Amazonas · Selva',   clima: 'soleado', distancia: 1200, ciudad: 'Leticia' },
  { nombre: 'La Guajira',          region: 'Guajira · Desierto', clima: 'soleado', distancia: 850,  ciudad: 'Riohacha' },
  { nombre: 'Santa Marta',         region: 'Magdalena · Caribe', clima: 'nublado', distancia: 700,  ciudad: 'Santa Marta' },
  { nombre: 'San Andrés',          region: 'Isla · Caribe',      clima: 'soleado', distancia: 1300, ciudad: 'San Andrés' },
  { nombre: 'Villa de Leyva',      region: 'Boyacá',             clima: 'soleado', distancia: 350,  ciudad: 'Villa de Leyva' },
];

async function buscar() {
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
      return;
    }

    const lista = resultados.map(d => '📍 ' + d.nombre + ' — ' + d.region).join('\n');
    alert('Resultados para "' + termino + '":\n\n' + lista + '\n\n(Próximamente como tarjetas 🚀)');

    // Guardar búsquedas: obtener coordenadas en paralelo y guardarlas
    const tareas = resultados.map(async destino => {
      const coord = await obtenerCoordenadas(destino.ciudad).catch(() => null);
      const lat = coord ? coord.latitud : null;
      const lon = coord ? coord.longitud : null;
      return guardarBusquedaEnBD(destino.nombre, lat, lon, destino.clima);
    });
    // No esperamos el resultado en UI, pero registramos fallos en consola
    Promise.allSettled(tareas).then(results => {
      results.forEach((r, i) => { if (r.status === 'rejected') console.warn('guardarBusqueda falló para', resultados[i].nombre, r.reason); });
    });

    // Opcional: calcular distancias si tenemos coordenadas del usuario
    if (coordenadasUsuario) {
      resultados.forEach(async (destino) => {
        const coordDestino = await obtenerCoordenadas(destino.ciudad);
        if (coordDestino) {
          const distancia = await calcularDistanciaYTiempo(
            coordenadasUsuario.latitud,
            coordenadasUsuario.longitud,
            coordDestino.latitud,
            coordDestino.longitud
          );
          if (distancia) {
            console.log(`📍 ${destino.nombre}: ${distancia.distanciaKm} km · ${distancia.tiempoFormato}`);
          }
        }
      });
    }

  } catch (e) {
    console.error('Error en función buscar:', e);
    alert('Ocurrió un error en la búsqueda. Por favor, intenta de nuevo.');
  }
}
