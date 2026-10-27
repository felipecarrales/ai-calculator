# Calculadora Científica Moderna

Aplicación web de calculadora científica con Dark Mode, operaciones básicas y científicas (sin, cos, tan, √, log, ln, x^y, π, e, n!), historial de cálculos y soporte de teclado.

## Ejecutar en local

Solo abre `index.html` en tu navegador, o sirve la carpeta con un servidor estático:

```bash
# Python
python -m http.server 8080

# Node (si tienes http-server)
npx http-server .
```

Luego visita `http://localhost:8080`.

## Publicar en GitHub Pages

Este repositorio incluye un workflow (`.github/workflows/pages.yml`) que despliega automáticamente en cada push a `main`.

Para activarlo:

1. Ve a **Settings → Pages** en el repositorio.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. Haz un push a `main` (o re-ejecuta el workflow).
4. La calculadora quedará disponible en: `https://felipecarrales.github.io/ai-calculator/`

## Tecnologías

- HTML5, CSS3 (Dark Mode + neomorfismo), JavaScript vanilla.
- Sin dependencias ni build step.
