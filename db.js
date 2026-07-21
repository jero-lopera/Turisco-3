// =============================================
//  TURISCO - db.js
//  Base de datos local con IndexedDB
//  Almacena: historial de búsquedas, destinos favoritos, 
//  preferencias de usuario y análisis de patrones de viaje
// =============================================

class TuriscoDatabase {
  constructor() {
    this.dbName = 'TuriscoTravelDB';
    this.version = 1;
    this.db = null;
    this.init();
  }

  // Inicializar base de datos
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Error abriendo BD:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Base de datos Turisco inicializada');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store 1: Historial de búsquedas
        if (!db.objectStoreNames.contains('busquedas')) {
          const store1 = db.createObjectStore('busquedas', { keyPath: 'id', autoIncrement: true });
          store1.createIndex('timestamp', 'timestamp', { unique: false });
          store1.createIndex('destino', 'destino', { unique: false });
        }

        // Store 2: Destinos favoritos
        if (!db.objectStoreNames.contains('favoritos')) {
          const store2 = db.createObjectStore('favoritos', { keyPath: 'id', autoIncrement: true });
          store2.createIndex('nombreDestino', 'nombreDestino', { unique: true });
          store2.createIndex('fechaGuardado', 'fechaGuardado', { unique: false });
        }

        // Store 3: Preferencias del usuario
        if (!db.objectStoreNames.contains('preferencias')) {
          const store3 = db.createObjectStore('preferencias', { keyPath: 'clave' });
        }

        // Store 4: Análisis de patrones de viaje
        if (!db.objectStoreNames.contains('analisis')) {
          const store4 = db.createObjectStore('analisis', { keyPath: 'id', autoIncrement: true });
          store4.createIndex('mes', 'mes', { unique: false });
          store4.createIndex('tipoDestino', 'tipoDestino', { unique: false });
        }

        console.log('✅ Stores creados exitosamente');
      };
    });
  }

  // =============================================
  // HISTORIAL DE BÚSQUEDAS
  // =============================================
  async guardarBusqueda(destino, latitud, longitud, clima) {
    const busqueda = {
      destino,
      latitud,
      longitud,
      clima,
      timestamp: new Date().toISOString(),
      fechaLegible: new Date().toLocaleString('es-CO')
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['busquedas'], 'readwrite');
      const store = transaction.objectStore('busquedas');
      const request = store.add(busqueda);

      request.onsuccess = () => {
        console.log('📝 Búsqueda guardada:', destino);
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Obtener historial de búsquedas
  async obtenerHistorial(limite = 20) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['busquedas'], 'readonly');
      const store = transaction.objectStore('busquedas');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      let historial = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && count < limite) {
          historial.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(historial);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // =============================================
  // DESTINOS FAVORITOS
  // =============================================
  async agregarFavorito(nombreDestino, region, clima, distancia, coordenadas) {
    const favorito = {
      nombreDestino,
      region,
      clima,
      distancia,
      coordenadas, // { latitud, longitud }
      fechaGuardado: new Date().toISOString(),
      contador: 1 // Cuántas veces ha visitado este favorito
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favoritos'], 'readwrite');
      const store = transaction.objectStore('favoritos');
      const request = store.add(favorito);

      request.onsuccess = () => {
        console.log('❤️ Favorito agregado:', nombreDestino);
        resolve(request.result);
      };

      request.onerror = (event) => {
        if (event.target.error.name === 'ConstraintError') {
          console.log('⚠️ Este destino ya está en favoritos');
        }
        reject(event.target.error);
      };
    });
  }

  // Obtener todos los favoritos
  async obtenerFavoritos() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favoritos'], 'readonly');
      const store = transaction.objectStore('favoritos');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Eliminar un favorito
  async eliminarFavorito(nombreDestino) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favoritos'], 'readwrite');
      const store = transaction.objectStore('favoritos');
      const index = store.index('nombreDestino');
      const request = index.getKey(nombreDestino);

      request.onsuccess = () => {
        const key = request.result;
        if (key !== undefined) {
          const deleteRequest = store.delete(key);
          deleteRequest.onsuccess = () => {
            console.log('🗑️ Favorito eliminado:', nombreDestino);
            resolve(true);
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve(false);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // =============================================
  // PREFERENCIAS DEL USUARIO
  // =============================================
  async guardarPreferencia(clave, valor) {
    const preferencia = { clave, valor, ultimaActualizacion: new Date().toISOString() };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preferencias'], 'readwrite');
      const store = transaction.objectStore('preferencias');
      const request = store.put(preferencia);

      request.onsuccess = () => {
        console.log('⚙️ Preferencia guardada:', clave);
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Obtener una preferencia
  async obtenerPreferencia(clave) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['preferencias'], 'readonly');
      const store = transaction.objectStore('preferencias');
      const request = store.get(clave);

      request.onsuccess = () => resolve(request.result?.valor || null);
      request.onerror = () => reject(request.error);
    });
  }

  // =============================================
  // ANÁLISIS DE PATRONES DE VIAJE (IA)
  // =============================================
  async guardarAnalisis(mes, tipoDestino, temperaturaPromedio, precipitacion, popularidad) {
    const analisis = {
      mes, // "enero", "febrero", etc.
      tipoDestino, // "playa", "montaña", "ciudad", "selva"
      temperaturaPromedio,
      precipitacion, // en mm
      popularidad, // 1-5
      timestamp: new Date().toISOString(),
      score: this.calcularScoreViaje(temperaturaPromedio, precipitacion, popularidad)
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['analisis'], 'readwrite');
      const store = transaction.objectStore('analisis');
      const request = store.add(analisis);

      request.onsuccess = () => {
        console.log('📊 Análisis guardado para:', tipoDestino);
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Calcular score de viaje (algoritmo de recomendación)
  calcularScoreViaje(temp, precip, popularidad) {
    // Rango ideal de temperatura: 20-28°C
    const scoreTemp = Math.max(0, 100 - Math.abs(temp - 24) * 5);
    // Menos lluvia es mejor
    const scorePrecip = Math.max(0, 100 - precip * 0.5);
    // Mayor popularidad es mejor
    const scorePopularidad = popularidad * 20;

    return Math.round((scoreTemp * 0.4 + scorePrecip * 0.3 + scorePopularidad * 0.3) / 100);
  }

  // Obtener análisis por mes
  async obtenerAnalisisPorMes(mes) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['analisis'], 'readonly');
      const store = transaction.objectStore('analisis');
      const index = store.index('mes');
      const request = index.getAll(mes);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // =============================================
  // ESTADÍSTICAS Y REPORTES
  // =============================================
  async obtenerEstadisticas() {
    const historial = await this.obtenerHistorial();
    const favoritos = await this.obtenerFavoritos();

    const destinosMasBuscados = {};
    historial.forEach(b => {
      destinosMasBuscados[b.destino] = (destinosMasBuscados[b.destino] || 0) + 1;
    });

    const topDestinos = Object.entries(destinosMasBuscados)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalBusquedas: historial.length,
      totalFavoritos: favoritos.length,
      topDestinos: topDestinos,
      destinoFavorito: topDestinos.length > 0 ? topDestinos[0][0] : 'N/A',
      ultimaBusqueda: historial.length > 0 ? historial[0] : null
    };
  }

  // Limpiar base de datos (solo para desarrollo)
  async limpiarTodo() {
    return new Promise((resolve, reject) => {
      const stores = ['busquedas', 'favoritos', 'preferencias', 'analisis'];
      let completadas = 0;

      stores.forEach(storeName => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completadas++;
          if (completadas === stores.length) {
            console.log('🧹 Base de datos limpiada');
            resolve(true);
          }
        };

        request.onerror = () => reject(request.error);
      });
    });
  }
}

// Crear instancia global de la base de datos
const turiscoDb = new TuriscoDatabase();

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = turiscoDb;
}
