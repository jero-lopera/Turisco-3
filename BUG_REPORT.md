# 🐛 Reporte de Bugs y Errores - Turisco-3

## Fecha de análisis: 28 de Septiembre de 2026

### Resumen
Se encontraron **7 bugs críticos y de media prioridad** en HTML, CSS y JavaScript que afectan la funcionalidad y user experience.

---

## 🔴 BUGS CRÍTICOS

### Bug #1: Logos faltantes en assets
- **Archivo:** `index.html` líneas 47, 332
- **Problema:** Referencias a `assets/logo.png` y `assets/logotipo.png` que no existen
- **Impacto:** Errores 404, imágenes no cargadas en navbar y footer
- **Solución:** Crear archivos SVG o PNG en carpeta assets

---

### Bug #2: Firebase no inicializa antes de usar
- **Archivo:** `auth.js` línea 297
- **Problema:** `initializeFirebase()` es async pero se llama sin `await`
- **Impacto:** Los formularios de login/registro fallan porque `auth` es `null`
- **Solución:** Esperar a que Firebase esté listo antes de permitir autenticación

---

### Bug #3: CONFIG sin valores reales
- **Archivo:** `main.js` líneas 10-14
- **Problema:** Las claves de API tienen valores placeholder `REPLACE_WITH_YOUR_*`
- **Impacto:** Clima, OpenRouteService y búsquedas no funcionan
- **Solución:** Inyectar variables desde `config.local.js` o servidor

---

## 🟡 BUGS MEDIA PRIORIDAD

### Bug #4: CSS truncado - Media queries incompletas
- **Archivo:** `styles.css` línea 998+
- **Problema:** El archivo CSS está incompleto (truncado)
- **Impacto:** Responsive design para móvil no funciona correctamente
- **Solución:** Completar las media queries para pantallas pequeñas

---

### Bug #5: Validación faltante en closeModalOnBackdropClick
- **Archivo:** `auth.js` línea 281-291
- **Problema:** No valida si los modales existen antes de usarlos
- **Impacto:** Error de null reference si los modales no existen
- **Solución:** Agregar validación null antes de comparar

---

### Bug #6: Manejo de errores frágil en calcularDistanciaYTiempo
- **Archivo:** `main.js` línea 53-67
- **Problema:** Múltiples formatos de respuesta pero no valida correctamente
- **Impacto:** Distancias incorrectas o no mostradas
- **Solución:** Mejorar parsing con validaciones más robustas

---

### Bug #7: Display flex inicial en modales
- **Archivo:** `index.html` línea 15, 29
- **Problema:** Inconsistencia entre CSS (`display: none`) y lógica JS
- **Impacto:** Comportamiento impredecible al abrir modales
- **Solución:** Estandarizar con `display: flex` en CSS `.modal.active`

---

## ✅ Estado de los archivos

| Archivo | Líneas | Estado | Prioridad |
|---------|--------|--------|-----------|
| index.html | 343 | ✅ Estructura OK, logos faltantes | 🔴 Crítica |
| styles.css | 998+ | ⚠️ Truncado | 🔴 Crítica |
| main.js | 435 | ⚠️ CONFIG sin valores | 🔴 Crítica |
| auth.js | 298 | ⚠️ Firebase async issue | 🔴 Crítica |
| db.js | 333 | ✅ OK | ✅ OK |

---

## 📋 Próximos pasos

1. **Crear assets/logo.png y assets/logotipo.png**
2. **Completar styles.css media queries**
3. **Implementar initialización correcta de Firebase**
4. **Crear config.local.js con credenciales reales**
5. **Mejorar validaciones en funciones críticas**

