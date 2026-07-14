# Contribuir a GastroSync

Gracias por tu interés en contribuir a GastroSync. Este documento explica cómo trabajar en el proyecto de forma organizada.

---

## 1. Flujo de trabajo

```
main
└── develop
    ├── feat/hero-section
    ├── fix/navbar-mobile-overflow
    ├── docs/update-contributing
    └── refactor/testimonials-service
```

### Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Producción estable — solo recibe fusiones desde `develop` |
| `develop` | Integración continua — base de todas las ramas de trabajo |
| `feat/*` | Nuevas funcionalidades |
| `fix/*` | Corrección de bugs |
| `docs/*` | Cambios de documentación |
| `refactor/*` | Refactorizaciones sin cambio funcional |

### Reglas

1. **Crea tu rama siempre desde `develop` actualizado:**
   ```bash
   git checkout develop && git pull
   git checkout -b feat/short-description
   ```

2. **Nombre de rama en inglés, kebab-case:**
   - `feat/add-hero-cta`
   - `fix/navbar-scroll`
   - `docs/update-contributing`

3. **Los merges a `main` solo ocurren desde `develop` mediante PR.**

---

## 2. Convención de commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>(<scope opcional>): <descripción>
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo cambios de documentación |
| `refactor` | Refactorización sin cambio funcional |
| `test` | Agregar o corregir pruebas |
| `chore` | Mantenimiento: dependencias, configuración |
| `style` | Formato, espacios — sin cambio de lógica |
| `perf` | Mejora de rendimiento |

### Reglas para la descripción

- En inglés, en modo imperativo: `add`, no `added` ni `adding`
- Minúsculas, sin punto al final
- Máximo 72 caracteres en la primera línea
- Debe responder a "¿qué hace este commit?" de forma concreta

| ❌ Evitar | ✅ Correcto |
|-----------|-------------|
| `fix bug` | `fix(navbar): correct active link on scroll` |
| `update files` | `feat(home): add hero section with CTA button` |
| `changes` | `refactor(core): extract testimonials into service` |

### Cuerpo del commit (opcional)

Si el cambio necesita contexto, añade un cuerpo separado por una línea en blanco explicando el **por qué**, no el qué:

```
fix(home): prevent myths section from overflowing on mobile

The myths grid used a fixed width that broke below 375px.
Switched to auto-fill columns to let the grid adapt naturally.
```

### Ejemplos

```
feat(home): add hero section with CTA button
fix(navbar): correct active link highlight on scroll
docs: add CONTRIBUTING.md with branching and commit guide
refactor(core): extract testimonials into standalone service
test(app): add unit tests for lazy-loaded routes
chore: upgrade angular to v20.3.1
style(home): apply prettier formatting to hero component
```

---

## 3. Tamaño de commits y PRs

| Unidad | Límite |
|--------|--------|
| Líneas por commit | ≤ 200 líneas cambiadas |
| Líneas por PR | ≤ 400 líneas cambiadas |
| Archivos por PR | ≤ 10 archivos |

**Un commit = un cambio atómico y coherente.** Si tienes que escribir "y" en la descripción, probablemente son dos commits.

Si un PR supera los límites, divídelo en PRs más pequeños encadenados (uno como base del siguiente).

---

## 4. Proceso de Pull Request

### Preparar tu rama

```bash
git fetch origin
git rebase origin/develop
```

### Título del PR

Sigue la misma convención de commits:

```
feat(home): add hero section
```

### Descripción del PR

Debe incluir:

| Sección | Contenido |
|---------|-----------|
| **Qué cambia** | Resumen breve |
| **Por qué** | Motivación o contexto |
| **Cómo probar** | Pasos para verificar el cambio |

### Reglas de merge

- Requiere al menos **1 aprobación** antes de hacer merge
- Los cheques deben pasar: `npm test` (backend) y `npm run build` (frontend)

### Estrategia de fusión

| Destino | Origen | Método |
|---------|--------|--------|
| `develop` | Ramas de trabajo | **Squash & merge** |
| `main` | `develop` | **Confirmación de fusión** |

### Checks automáticos (CI)

Un workflow de GitHub Actions ejecuta automáticamente:

| Job | Qué verifica |
|-----|-------------|
| `backend` | `npm ci` + `npm test` (validación Zod, schemas, utils) |
| `frontend` | `npm ci` + `npm run build` |

Estos checks deben pasar antes de poder hacer merge de un PR.

---

## 5. Preguntas frecuentes

### ¿Cómo ejecuto el proyecto localmente?

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### ¿Dónde reporto bugs?

Abre un [issue](https://github.com/alfonsopixota/gastrosync/issues) con:
- Título descriptivo
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica

### ¿Cómo pido una nueva funcionalidad?

Abre un issue con la etiqueta `enhancement` y describe:
- Qué funcionalidad necesitas
- Por qué es útil
- Ejemplo de uso
