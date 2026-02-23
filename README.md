# Calculadora de Café

Calculadora web para preparar café por método, número de tazas e intensidad, con interfaz estilo liquid glass.

## Demo

Sitio: [https://calculadoradecafe.com](https://calculadoradecafe.com)

Repositorio: [https://github.com/afbecerra7-netizen/calculadora-cafe](https://github.com/afbecerra7-netizen/calculadora-cafe)

## Funcionalidades

- Selección de método: AeroPress, Chemex, V60, Prensa, Moka italiana y Cold Brew.
- Cálculo de gramos de café y agua según ratio ajustado.
- Recomendación de molienda por método dentro de la receta.
- Selector de intensidad (afecta ratio final).
- Conversión de agua en `ml` u `oz`.
- Modo avanzado para editar ratios base por método.
- Autocálculo en cambios de controles.
- Animación count-up en resultados.
- Copiado de receta al portapapeles.
- Persistencia de preferencias con `localStorage`.
- Guía de preparación dinámica por método.
- SEO base con metatags, `sitemap.xml`, `robots.txt`, OG y Twitter cards.

## Stack

- HTML5
- CSS3
- JavaScript (ES Modules)
- Node.js para tests y utilidades de build ligera

## Estructura del proyecto

```text
.
├── index.html
├── styles.css
├── styles.min.css
├── script.js
├── script.min.js
├── calculator-core.mjs
├── tests/
│   └── calculator-core.test.mjs
├── minify.mjs
├── favicon.svg
├── og-image-cafe.svg
├── robots.txt
└── sitemap.xml
```

## Ejecutar local

Como es un sitio estático, puedes abrir `index.html` directo en el navegador.

Si prefieres servidor local:

```bash
# opción 1 (python)
python3 -m http.server 5500

# opción 2 (node)
npx serve .
```

Luego abre `http://localhost:5500`.

## Testing

```bash
node --test /Users/felipebecerra/Proyectos/Cafe/tests/calculator-core.test.mjs
```

## Minificado ligero

Genera versiones minificadas de CSS y JS:

```bash
node /Users/felipebecerra/Proyectos/Cafe/minify.mjs
```

Salida:

- `styles.min.css`
- `script.min.js`

## Deploy

Dominio productivo actual: `https://calculadoradecafe.com`.

Publica en GitHub Pages, Netlify o Vercel como sitio estático y apunta el dominio principal a este proyecto.

## Licencia

Puedes agregar la licencia que prefieras (MIT recomendada para proyectos públicos).
