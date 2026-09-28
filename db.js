// =============================================
//  TURISCO - db.js
//  Base de datos local con IndexedDB
// =============================================

class TuriscoDatabase {
  constructor() {
    this.dbName = 'TuriscoTravelDB';
    this.version = 1;
    this.db = null;
    this.ready = this.init();
  }

  async init() {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB no está disponible en este navegador.');
      return null;
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => { console.error('Error abriendo BD:', request.error); reject(request.error); };
      request.onblocked = () => console.warn('La actualización de la BD está bloqueada por otra pestaña.');
      request.onsuccess = () => {
        this.db = request.result;
        this.db.onversionchange = () => this.db.close();
        console.log('✅ Base de datos Turisco inicializada');
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('busquedas')) {
          const store = db.createObjectStore('busquedas', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('destino', 'destino', { unique: false });
        }
        if (!db.objectStoreNames.contains('favoritos')) {
          const store = db.createObjectStore('favoritos', { keyPath: 'id', autoIncrement: true });
          store.createIndex('nombreDestino', 'nombreDestino', { unique: true });
          store.createIndex('fechaGuardado', 'fechaGuardado', { unique: false });
        }
        if (!db.objectStoreNames.contains('preferencias')) db.createObjectStore('preferencias', { keyPath: 'clave' });
        if (!db.objectStoreNames.contains('analisis')) {
          const store = db.createObjectStore('analisis', { keyPath: 'id', autoIncrement: true });
          store.createIndex('mes', 'mes', { unique: false });
          store.createIndex('tipoDestino', 'tipoDestino', { unique: false });
        }
      };
    });
  }

  async esperarDisponible() {
    await this.ready.catch(() => null);
    if (!this.db) throw new Error('La base de datos no está disponible');
    return this.db;
  }

  async guardarBusqueda(destino, latitud, longitud, clima) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('busquedas', 'readwrite').objectStore('busquedas').add({
        destino, latitud, longitud, clima,
        timestamp: new Date().toISOString(),
        fechaLegible: new Date().toLocaleString('es-CO')
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async obtenerHistorial(limite = 20) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('busquedas', 'readonly').objectStore('busquedas').index('timestamp').openCursor(null, 'prev');
      const historial = [];
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && historial.length < Math.max(0, limite)) { historial.push(cursor.value); cursor.continue(); }
        else resolve(historial);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async agregarFavorito(nombreDestino, region, clima, distancia, coordenadas) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('favoritos', 'readwrite').objectStore('favoritos').add({ nombreDestino, region, clima, distancia, coordenadas, fechaGuardado: new Date().toISOString(), contador: 1 });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async obtenerFavoritos() {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('favoritos', 'readonly').objectStore('favoritos').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async eliminarFavorito(nombreDestino) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('favoritos', 'readwrite');
      const store = tx.objectStore('favoritos');
      const request = store.index('nombreDestino').getKey(nombreDestino);
      request.onsuccess = () => request.result === undefined ? resolve(false) : store.delete(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async guardarPreferencia(clave, valor) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('preferencias', 'readwrite').objectStore('preferencias').put({ clave, valor, ultimaActualizacion: new Date().toISOString() });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async obtenerPreferencia(clave) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('preferencias', 'readonly').objectStore('preferencias').get(clave);
      request.onsuccess = () => resolve(request.result?.valor ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  calcularScoreViaje(temp, precip, popularidad) {
    const temperatura = Number(temp), lluvia = Number(precip), popular = Number(popularidad);
    if (![temperatura, lluvia, popular].every(Number.isFinite)) return 0;
    const scoreTemp = Math.max(0, 100 - Math.abs(temperatura - 24) * 5);
    const scorePrecip = Math.max(0, 100 - lluvia * 0.5);
    const scorePopularidad = Math.max(0, Math.min(100, popular * 20));
    return Math.round(scoreTemp * 0.4 + scorePrecip * 0.3 + scorePopularidad * 0.3);
  }

  async guardarAnalisis(mes, tipoDestino, temperaturaPromedio, precipitacion, popularidad) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('analisis', 'readwrite').objectStore('analisis').add({ mes, tipoDestino, temperaturaPromedio, precipitacion, popularidad, timestamp: new Date().toISOString(), score: this.calcularScoreViaje(temperaturaPromedio, precipitacion, popularidad) });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async obtenerAnalisisPorMes(mes) {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const request = db.transaction('analisis', 'readonly').objectStore('analisis').index('mes').getAll(mes);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async obtenerEstadisticas() {
    const [historial, favoritos] = await Promise.all([this.obtenerHistorial(), this.obtenerFavoritos()]);
    const conteo = historial.reduce((resultado, item) => { resultado[item.destino] = (resultado[item.destino] || 0) + 1; return resultado; }, {});
    const topDestinos = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { totalBusquedas: historial.length, totalFavoritos: favoritos.length, topDestinos, destinoFavorito: topDestinos[0]?.[0] || 'N/A', ultimaBusqueda: historial[0] || null };
  }

  async limpiarTodo() {
    const db = await this.esperarDisponible();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['busquedas', 'favoritos', 'preferencias', 'analisis'], 'readwrite');
      ['busquedas', 'favoritos', 'preferencias', 'analisis'].forEach(nombre => tx.objectStore(nombre).clear());
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }
}

const turiscoDb = new TuriscoDatabase();
if (typeof window !== 'undefined') window.turiscoDb = turiscoDb;
if (typeof module !== 'undefined' && module.exports) module.exports = turiscoDb;
