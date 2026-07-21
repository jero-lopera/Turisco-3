// =============================================
//  TURISCO - main.js
//  ✅ PASO 1 - Menú con scroll suave
//  ✅ PASO 2 - Botones hero funcionando
//  ✅ PASO 3 - Hora en tiempo real
//  ✅ PASO 4 - Detectar ubicación del usuario
//  ✅ PASO 5 - Clima real con OpenWeatherMap
//  ✅ PASO 6 - Cálculo de distancia y tiempo (Open Route Service)
//  ✅ PASO 7 - Base de datos de favoritos y búsquedas
// =============================================

const API_KEY_CLIMA = '8fe318cf34b450bc6643ce5daecb4da3';

// =============================================
// ✅ PASO 6 — Calcular distancia y tiempo entre ubicaciones
// =============================================
// Open Route Service API (gratuita)
const OPEN_ROUTE_SERVICE_API = 'https://api.openrouteservice.org/v2/directions/driving';

// Función para obtener tiempo y distancia entre dos puntos
async function calcularDistanciaYTiempo(latOrigen, lonOrigen, latDestino, lonDestino) {
  try {
    // Open Route Service requiere formato: [longitud, latitud]
    const url = `${OPEN_ROUTE_SERVICE_API}?api_key=5b3ce3597851110001cf624800e09e5dc&start=${lonOrigen},${latOrigen}&end=${lonDestino},${latDestino}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data || !data.routes || data.routes.length === 0) {
      console.warn('No se encontró ruta');
      return null;
    }
    
    const ruta = data.routes[0];
    const distanciaMetros = ruta.distance; // en metros
    const tiempoSegundos = ruta.duration;  // en segundos
    
    // Convertir a unidades legibles
    const distanciaKm = (distanciaMetros / 1000).toFixed(1);
    const tiempoHoras = Math.floor(tiempoSegundos / 3600);
    const tiempoMinutos = Math.floor((tiempoSegundos % 3600) / 60);
    
    return {
      distanciaKm: parseFloat(distanciaKm),
      distanciaMetros: distanciaMetros,
      tiempoSegundos: tiempoSegundos,
      tiempoFormato: `${tiempoHoras}h ${tiempoMinutos}m`,
      tiempoHoras: tiempoHoras,
      tiempoMinutos: tiempoMinutos
    };
  } catch (error) {
    console.error('Error calculando distancia:', error);
    return null;
  }
}

// Función para obtener coordenadas de una ciudad usando Nominatim
async function obtenerCoordenadas(ciudad) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ciudad)}&format=json&limit=1`
    );
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
// ✅ PASO 7 — Funciones de Base de Datos
// =============================================

// Esperar a que la BD esté lista
async function esperarBaseDatos(timeout = 5000) {
  const inicio = Date.now();
  while (!turiscoDb || !turiscoDb.db) {
    if (Date.now() - inicio > timeout) {
      console.warn('Timeout esperando BD');
      return false;
    }
    await new Promise(r => setTimeout(r, 100));
  }
  return true;
}

// Agregar a favoritos
async function agregarAFavoritos(nombreDestino, region, clima, distancia) {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const coordDestino = await obtenerCoordenadas(nombreDestino);
    const coordenadas = coordDestino ? { 
      latitud: coordDestino.latitud, 
      longitud: coordDestino.longitud 
    } : { latitud: 0, longitud: 0 };

    await turiscoDb.agregarFavorito(nombreDestino, region, clima, distancia, coordenadas);
    alert(`❤️ ${nombreDestino} agregado a favoritos!`);
  } catch (error) {
    console.error('Error agregando favorito:', error);
    alert('⚠️ Este destino ya está en favoritos');
  }
}

// Mostrar favoritos
async function mostrarFavoritos() {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const favoritos = await turiscoDb.obtenerFavoritos();
    if (favoritos.length === 0) {
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

// Ver historial de búsquedas
async function verHistorial() {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const historial = await turiscoDb.obtenerHistorial(10);
    if (historial.length === 0) {
      alert('📜 No hay historial de búsquedas aún.');
      return;
    }
    const lista = historial.map(h => `🔍 ${h.destino} (${h.fechaLegible})`).join('\n');
    alert(`Últimas 10 búsquedas:\n\n${lista}`);
  } catch (error) {
    console.error('Error viendo historial:', error);
  }
}

// Ver estadísticas
async function verEstadisticas() {
  try {
    const bDisponible = await esperarBaseDatos();
    if (!bDisponible) {
      alert('⚠️ La base de datos no está disponible');
      return;
    }

    const stats = await turiscoDb.obtenerEstadisticas();
    const mensaje = `
📊 ESTADÍSTICAS DE TURISCO
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Total de búsquedas: ${stats.totalBusquedas}
❤️ Total de favoritos: ${stats.totalFavoritos}
⭐ Destino favorito: ${stats.destinoFavorito}
🏆 Top 5 destinos:
${stats.topDestinos.map((d, i) => `  ${i + 1}. ${d[0]} (${d[1]} búsquedas)`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    alert(mensaje);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
}

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
let coordenadasUsuario = null; // Guardar coordenadas para usarlas después

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

      // Guardar coordenadas del usuario
      coordenadasUsuario = { latitud: lat, longitud: lon };

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
// 🔜 PASO 8 — Buscador de destinos avanzado
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
      
      // Guardar búsqueda en la base de datos (sin esperar)
      resultados.forEach(destino => {
        guardarBusquedaEnBD(destino.nombre, 0, 0, destino.clima);
      });

      // Opcionalmente calcular distancia para cada resultado
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
    }
  } catch (e) {
    console.error('Error en función buscar:', e);
    alert('Ocurrió un error en la búsqueda. Por favor, intenta de nuevo.');
  }
}
