// =============================================
//  TURISCO - main.js
//  Funcionalidad principal: clima, ubicación, búsqueda, favoritos
// =============================================

const CONFIG = window.__TURISCO_CONFIG__ || {
  API_KEY_CLIMA: 'REPLACE_WITH_YOUR_OPENWEATHER_KEY',
  ORS_KEY: 'REPLACE_WITH_YOUR_OPENROUTESERVICE_KEY',
  CONTACT_EMAIL: 'tu-email@dominio.com'
};

const API_KEY_CLIMA = CONFIG.API_KEY_CLIMA;
const OPEN_ROUTE_SERVICE_API = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

// =============================================
// Distancia y Tiempo
// =============================================
async function calcularDistanciaYTiempo(latOrigen, lonOrigen, latDestino, lonDestino) {
  try {
    if (!CONFIG.ORS_KEY || CONFIG.ORS_KEY.startsWith('REPLACE_')) {
      console.warn('ORS key no configurada');
      return null;
    }

    if (![latOrigen, lonOrigen, latDestino, lonDestino].every(Number.isFinite)) {
      console.warn('Coordenadas inválidas');
      return null;
    }

    const res = await fetch(OPEN_ROUTE_SERVICE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': CONFIG.ORS_KEY },
      body: JSON.stringify({ coordinates: [[lonOrigen, latOrigen], [lonDestino, latDestino]] })
    });

    if (!res.ok) {
      console.warn(`OpenRouteService error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (!data || typeof data !== 'object') {
      console.warn('Respuesta inválida de ORS');
      return null;
    }

    let distanciaMetros = null, tiempoSegundos = null;

    if (data.features?.[0]?.properties?.summary) {
      distanciaMetros = data.features[0].properties.summary.distance;
      tiempoSegundos = data.features[0].properties.summary.duration;
    } else if (data.routes?.[0]?.summary) {
      distanciaMetros = data.routes[0].summary.distance;
      tiempoSegundos = data.routes[0].summary.duration;
    } else if (data.routes?.[0]?.segments?.[0]) {
      distanciaMetros = data.routes[0].segments[0].distance;
      tiempoSegundos = data.routes[0].segments[0].duration;
    }

    if (!Number.isFinite(distanciaMetros) || !Number.isFinite(tiempoSegundos)) {
      console.warn('Formato de respuesta ORS inesperado');
      return null;
    }

    const distanciaKm = (distanciaMetros / 1000).toFixed(1);
    const tiempoHoras = Math.floor(tiempoSegundos / 3600);
    const tiempoMinutos = Math.floor((tiempoSegundos % 3600) / 60);

    return {
      distanciaKm: parseFloat(distanciaKm),
      distanciaMetros: Math.round(distanciaMetros),
      tiempoSegundos: Math.round(tiempoSegundos),
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
// Obtener Coordenadas (Nominatim)
// =============================================
async function obtenerCoordenadas(ciudad) {
  try {
    if (!ciudad || typeof ciudad !== 'string' || ciudad.trim().length === 0) {
      console.warn('Ciudad inválida:', ciudad);
      return null;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ciudad)}&format=json&limit=1&accept-language=es&email=${encodeURIComponent(CONFIG.CONTACT_EMAIL)}`;
    
    const response = await fetch(url, { headers: { 'User-Agent': 'Turisco-App' } });
    
    if (!response.ok) {
      console.warn(`Nominatim error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`No se encontraron coordenadas para: ${ciudad}`);
      return null;
    }

    const { lat, lon, display_name } = data[0];
    
    if (!Number.isFinite(parseFloat(lat)) || !Number.isFinite(parseFloat(lon))) {
      console.warn('Coordenadas inválidas recibidas');
      return null;
    }

    return {
      latitud: parseFloat(lat),
      longitud: parseFloat(lon),
      nombre: display_name || ciudad
    };
  } catch (error) {
    console.error(`Error obteniendo coordenadas para ${ciudad}:`, error);
    return null;
  }
}

// =============================================
// Esperar Base de Datos
// =============================================
async function esperarBaseDatos(timeout = 5000) {
  try {
    const inicio = Date.now();
    while (!window.turiscoDb?.db) {
      if (Date.now() - inicio > timeout) {
        console.warn('Timeout esperando BD');
        return false;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    return true;
  } catch (error) {
    console.error('Error esperando BD:', error);
    return false;
  }
}

// =============================================
// Favoritos
// =============================================
async function agregarAFavoritos(nombreDestino, region, clima, distancia) {
  try {
    if (!nombreDestino || typeof nombreDestino !== 'string') {
      alert('⚠️ Destino inválido');
      return;
    }

    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const coordDestino = await obtenerCoordenadas(nombreDestino);
    const coordenadas = coordDestino ? { latitud: coordDestino.latitud, longitud: coordDestino.longitud } : null;

    await window.turiscoDb.agregarFavorito(nombreDestino, region || '', clima || '', distancia || 0, coordenadas);
    alert(`❤️ ${nombreDestino} agregado a favoritos!`);
  } catch (error) {
    console.error('Error agregando favorito:', error);
    if (error?.name === 'ConstraintError') {
      alert('⚠️ Este destino ya está en favoritos');
    } else {
      alert('⚠️ Error al guardar favorito');
    }
  }
}

async function mostrarFavoritos() {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const favoritos = await window.turiscoDb.obtenerFavoritos();
    if (!favoritos || favoritos.length === 0) {
      alert('📌 Aún no tienes destinos favoritos. ¡Agrega algunos!');
      return;
    }

    const lista = favoritos.map(f => `❤️ ${f.nombreDestino} (${f.region}) - ${f.distancia || '?'}km`).join('\n');
    alert(`Tus favoritos:\n\n${lista}`);
  } catch (error) {
    console.error('Error mostrando favoritos:', error);
    alert('⚠️ Error al obtener favoritos');
  }
}

async function guardarBusquedaEnBD(destino, lat, lon, clima) {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      console.warn('BD no disponible para guardar búsqueda');
      return;
    }

    await window.turiscoDb.guardarBusqueda(destino, lat, lon, clima);
    console.log('📝 Búsqueda guardada');
  } catch (error) {
    console.error('Error guardando búsqueda:', error);
  }
}

async function verHistorial() {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const historial = await window.turiscoDb.obtenerHistorial(10);
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
// Hora Local
// =============================================
function actualizarHora() {
  try {
    const horaFormateada = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const el = document.getElementById('hora-actual');
    if (el) el.textContent = '🕒 ' + horaFormateada;
  } catch (error) {
    console.error('Error actualizando hora:', error);
  }
}

actualizarHora();
setInterval(actualizarHora, 1000);

// =============================================
// Ubicación
// =============================================
let coordenadasUsuario = null;

function detectarUbicacion() {
  const el = document.getElementById('ciudad-actual');
  
  if (!navigator.geolocation) {
    if (el) el.textContent = 'Ubicación no disponible';
    console.warn('Geolocation no soportado');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude: lat, longitude: lon } = pos.coords;

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        console.warn('Coordenadas inválidas');
        return;
      }

      coordenadasUsuario = { latitud: lat, longitud: lon };
      obtenerClimaUbicacion(lat, lon);

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=es&email=${encodeURIComponent(CONFIG.CONTACT_EMAIL)}`;
        const response = await fetch(url, { headers: { 'User-Agent': 'Turisco-App' } });
        const data = await response.json();

        if (data?.address) {
          const ciudad = data.address.city || data.address.town || data.address.village || 'Tu ciudad';
          if (el) el.textContent = ciudad;
        } else {
          if (el) el.textContent = 'Tu ubicación';
        }
      } catch (err) {
        console.error('Error detectando ubicación:', err);
        if (el) el.textContent = 'Tu ubicación';
      }
    },
    (err) => {
      console.error('Geolocation error:', err.message);
      if (el) el.textContent = 'Medellín';
    }
  );
}

// =============================================
// Clima
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
  return (id >= 200 && id < 600) 
    ? { texto: 'Lluvia hoy', clase: 'tag-rain' }
    : { texto: 'Buen clima', clase: 'tag-ok' };
}

function obtenerClimaUbicacion(lat, lon) {
  if (!API_KEY_CLIMA || API_KEY_CLIMA.startsWith('REPLACE_')) {
    console.warn('OpenWeather API key no configurada');
    return;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    console.warn('Coordenadas inválidas para clima');
    return;
  }

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY_CLIMA}&units=metric&lang=es`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      if (!data?.main?.temp || !data?.weather?.[0]) {
        console.warn('Datos de clima incompletos');
        return;
      }

      const temp = Math.round(data.main.temp);
      const { id, description } = data.weather[0];
      const icono = obtenerIconoClima(id);
      const etiq = obtenerEtiqueta(id);

      const iconoEl = document.querySelector('#clima-tuubicacion .big-icon');
      const descEl = document.querySelector('#clima-tuubicacion p');
      const tagEl = document.querySelector('#clima-tuubicacion .clima-tag');

      if (iconoEl) iconoEl.textContent = icono;
      if (descEl) descEl.textContent = `${temp}°C · ${description || 'Clima'}`;
      if (tagEl) {
        tagEl.textContent = etiq.texto;
        tagEl.className = 'clima-tag ' + etiq.clase;
      }
    })
    .catch(err => console.error('Error obteniendo clima:', err));
}

function obtenerClimaCiudad(ciudad, elementoId) {
  if (!ciudad || !elementoId || typeof elementoId !== 'string') {
    console.warn('Parámetros inválidos en obtenerClimaCiudad');
    return;
  }

  if (!API_KEY_CLIMA || API_KEY_CLIMA.startsWith('REPLACE_')) {
    console.warn('OpenWeather API key no configurada');
    return;
  }

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(ciudad)}&appid=${API_KEY_CLIMA}&units=metric&lang=es`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      if (!data?.main?.temp || !data?.weather?.[0]) {
        console.warn(`Datos de clima incompletos para: ${ciudad}`);
        return;
      }

      const temp = Math.round(data.main.temp);
      const { id, description } = data.weather[0];
      const icono = obtenerIconoClima(id);
      const etiq = obtenerEtiqueta(id);

      const iconoEl = document.querySelector(`#${elementoId} .big-icon`);
      const descEl = document.querySelector(`#${elementoId} p`);
      const tagEl = document.querySelector(`#${elementoId} .clima-tag`);

      if (iconoEl) iconoEl.textContent = icono;
      if (descEl) descEl.textContent = `${temp}°C · ${description || 'Clima'}`;
      if (tagEl) {
        tagEl.textContent = etiq.texto;
        tagEl.className = 'clima-tag ' + etiq.clase;
      }
    })
    .catch(err => console.error(`Error clima para ${ciudad}:`, err));
}

obtenerClimaCiudad('Cartagena,CO', 'clima-cartagena');
obtenerClimaCiudad('Santa Marta,CO', 'clima-santamarta');
obtenerClimaCiudad('San Andres,CO', 'clima-sanandres');

detectarUbicacion();

// =============================================
// Destinos y Buscador
// =============================================
const destinos = [
  { nombre: 'Cartagena de Indias', region: 'Bolívar · Caribe', clima: 'soleado', distancia: 640, ciudad: 'Cartagena' },
  { nombre: 'Guatapé', region: 'Antioquia', clima: 'nublado', distancia: 80, ciudad: 'Guatapé' },
  { nombre: 'Leticia, Amazonas', region: 'Amazonas · Selva', clima: 'soleado', distancia: 1200, ciudad: 'Leticia' },
  { nombre: 'La Guajira', region: 'Guajira · Desierto', clima: 'soleado', distancia: 850, ciudad: 'Riohacha' },
  { nombre: 'Santa Marta', region: 'Magdalena · Caribe', clima: 'nublado', distancia: 700, ciudad: 'Santa Marta' },
  { nombre: 'San Andrés', region: 'Isla · Caribe', clima: 'soleado', distancia: 1300, ciudad: 'San Andrés' },
  { nombre: 'Villa de Leyva', region: 'Boyacá', clima: 'soleado', distancia: 350, ciudad: 'Villa de Leyva' }
];

async function buscar() {
  try {
    const inputEl = document.querySelector('.search-bar input');
    const climaSelect = document.querySelector('.search-bar select:nth-of-type(1)');
    const distanciaSelect = document.querySelector('.search-bar select:nth-of-type(2)');

    const termino = (inputEl?.value || '').trim().toLowerCase();
    const climaFiltro = (climaSelect?.value || '').toLowerCase();
    const distanciaFiltro = distanciaSelect?.value || '';

    if (!termino) {
      alert('✈️ Escribe un destino para buscar');
      return;
    }

    let resultados = destinos.filter(d =>
      d.nombre.toLowerCase().includes(termino) ||
      d.region.toLowerCase().includes(termino)
    );

    // Filtrar por clima
    if (climaFiltro && climaFiltro !== 'cualquier clima') {
      const climaBuscado = climaFiltro.split(' ').pop(); // extrae "soleado", "nublado", etc.
      resultados = resultados.filter(d => d.clima.toLowerCase().includes(climaBuscado));
    }

    // Filtrar por distancia
    if (distanciaFiltro && distanciaFiltro !== 'Cualquier distancia') {
      if (distanciaFiltro === 'Menos de 100 km') {
        resultados = resultados.filter(d => d.distancia < 100);
      } else if (distanciaFiltro === '100 – 300 km') {
        resultados = resultados.filter(d => d.distancia >= 100 && d.distancia <= 300);
      } else if (distanciaFiltro === 'Más de 300 km') {
        resultados = resultados.filter(d => d.distancia > 300);
      }
    }

    if (resultados.length === 0) {
      alert(`No encontramos "${termino}" con esos filtros.\nIntenta con: Cartagena, Guatapé, Amazonas, Guajira...`);
      return;
    }

    const lista = resultados.map(d => `📍 ${d.nombre} — ${d.region}`).join('\n');
    alert(`Resultados para "${termino}":\n\n${lista}\n\n(Próximamente como tarjetas 🚀)`);

    // Guardar búsquedas en paralelo
    const tareas = resultados.map(async destino => {
      const coord = await obtenerCoordenadas(destino.ciudad).catch(() => null);
      const lat = coord?.latitud || null;
      const lon = coord?.longitud || null;
      return guardarBusquedaEnBD(destino.nombre, lat, lon, destino.clima);
    });

    Promise.allSettled(tareas).then(results => {
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          console.warn(`guardarBusqueda falló para ${resultados[i]?.nombre}:`, r.reason);
        }
      });
    });

    // Calcular distancias reales si tenemos ubicación del usuario
    if (coordenadasUsuario) {
      resultados.forEach(async destino => {
        const coordDestino = await obtenerCoordenadas(destino.ciudad).catch(() => null);
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
  } catch (error) {
    console.error('Error en función buscar:', error);
    alert('Ocurrió un error en la búsqueda. Por favor, intenta de nuevo.');
  }
}
