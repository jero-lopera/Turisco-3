# CONFIG.md

Este proyecto separa la configuración sensible (claves API, identificadores de servicios) del código fuente.

Pasos para configurar las credenciales locales (recomendado):

1. Copia el archivo `config.example.js` a `config.local.js` en la raíz del proyecto.
2. Rellena los valores con la configuración de Firebase de tu proyecto.
3. Asegúrate de que `config.local.js` está incluido en `.gitignore` (ya añadido) para no subirlo al repositorio.

Incluir en tu HTML (antes de cargar `auth.js`):

```html
<script src="/config.local.js"></script>
<script src="/auth.js"></script>
```

Notas de seguridad:
- Nunca subas claves reales a este repositorio público.
- Para llamadas a APIs sensibles (p.ej. OpenRouteService) pasa por un backend y no uses claves públicas en el cliente.
- Revisa las reglas de seguridad de Firebase y valida tokens en el servidor cuando sea necesario.
