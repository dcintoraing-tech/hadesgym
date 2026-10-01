# HADES GYM — sitio de sucursal única

Sitio estático (HTML + CSS + JS, sin dependencias ni build) para un gimnasio de una sola sede.
Identidad negro / rojo / blanco, mobile-first, pensado para convertir: que alguien que entra por
primera vez entienda en menos de un minuto qué es, dónde está, cuánto cuesta y cómo inscribirse.

## Estructura

```
index.html              Página principal (todas las secciones)
aviso-privacidad.html   Aviso de privacidad
terminos.html           Términos y condiciones
assets/css/styles.css   Sistema visual completo
assets/js/main.js       Interacciones (sin librerías)
assets/img/favicon.svg  Ícono de marca
.claude/launch.json     Config del servidor local de previsualización
```

Flujo de la página: `HEADER → HERO → SUCURSAL → INSTALACIONES → PLANES → CLASES → HORARIOS → GALERÍA → CTA → CONTACTO → FOOTER`.

## Verlo en local

```bash
python -m http.server 5500
```

Y abre <http://localhost:5500>. Cualquier servidor estático sirve (Live Server, `npx serve`, Netlify, Vercel, hosting compartido).
No hace falta compilar nada: se sube tal cual.

## Qué hay que personalizar antes de publicar

Todo el contenido actual es de ejemplo y realista, pero **ficticio**. Reemplaza:

| Dato | Dónde aparece |
| --- | --- |
| Nombre del gimnasio | `index.html` (marca, títulos, JSON-LD), páginas legales |
| Dirección | `index.html` (hero, sucursal, contacto, footer, mapa, JSON-LD) |
| Teléfono y WhatsApp | Busca `523312345678` en `index.html` y la constante `WHATSAPP` en `assets/js/main.js` |
| Correo | `hola@hadesgym.mx` y `privacidad@hadesgym.mx` |
| Horarios | Sección `#horarios`, hero, footer, el objeto `SCHEDULE` en `main.js` y el JSON-LD |
| Precios y beneficios | Sección `#planes` |
| Clases, instructores y niveles | Sección `#clases` y la tabla de `#horarios` |
| Redes sociales | Enlaces `instagram.com` / `facebook.com` / `tiktok.com` |
| Fotografías | Ver abajo |

> El horario vive en dos lugares a propósito: el HTML (lo que lee la gente y Google) y `SCHEDULE`
> en el JS (lo que calcula el indicador "Abierto ahora"). Si cambias uno, cambia el otro.

### Fotografías

Las imágenes son de Unsplash y se cargan desde su CDN. Para producción, **sustitúyelas por fotos
reales del gimnasio**: dan más confianza y evitan depender de un servicio externo.

1. Guarda las fotos en `assets/img/` (formato WebP, ancho 1600 px máximo, comprimidas).
2. Reemplaza cada `src` / `srcset` que apunte a `images.unsplash.com`.
3. Conserva los `alt`, el `loading="lazy"` y el `decoding="async"` de cada imagen.
4. La foto del hero debe seguir con `fetchpriority="high"` y su `<link rel="preload">` en el `<head>`.

### Formulario de contacto

Hoy el formulario valida en el navegador y abre WhatsApp con el mensaje ya redactado: cero backend
y la respuesta más rápida posible. Si además quieres recibirlo por correo o guardarlo en una base:

- Opción rápida: servicios tipo Formspree / Basin — pon su URL en el `action` del `<form>` y quita el `e.preventDefault()`.
- Opción propia: haz un `fetch` POST a tu endpoint dentro del `submit` en `assets/js/main.js`.

## Detalles de implementación que conviene conocer

- **Menú móvil**: el header usa `backdrop-filter`, lo que lo convierte en bloque contenedor de sus
  hijos `position:fixed`. Por eso el drawer lleva `height:100dvh` explícito en lugar de `inset:0`.
- **Animaciones**: con `IntersectionObserver`; todo se desactiva si el sistema pide
  `prefers-reduced-motion: reduce`.
- **Galería**: mosaico de 4 / 3 / 2 columnas. Los spans (`.gal--big`, `.gal--wide`) están calculados
  para que no queden huecos con 8 imágenes. Si agregas o quitas fotos, revisa que siga cuadrando.
- **Accesibilidad**: enlace de salto, foco visible, `aria-expanded` en el menú, `aria-pressed` en los
  filtros, lightbox navegable con teclado (← → Esc) y textos alternativos en todas las fotos.
- **SEO**: metadatos Open Graph y datos estructurados `ExerciseGym` con dirección y horarios.
  Actualiza el JSON-LD junto con los datos reales.

## Pendientes antes de salir a producción

- [ ] Sustituir datos ficticios y fotografías.
- [ ] Revisar el aviso de privacidad y los términos con alguien que conozca la operación real.
- [ ] Añadir `sitemap.xml` y `robots.txt` si se va a indexar.
- [ ] Conectar analítica si se necesita medir conversiones.
