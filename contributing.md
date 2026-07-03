2. Flujo de ramas
main
└── develop
    ├── feat/hero-section
    ├── fix/navbar-mobile-overflow
    ├── docs/update-contributing
    └── refactor/testimonials-service
Rama	Propósito
main	Producción estable — solo recibe fusiones desdedevelop
develop	Integración continua — base de todas las ramas de trabajo
feat/*	Nuevas funcionalidades
fix/*	Corrección de bugs
docs/*	Cambios de documentación
refactor/*	Refactorizaciones sin cambio funcional
Reglas:

Crea tu rama siempre desde developactualizado:
git checkout develop && git pull
git checkout -b feat/short-description
Nombre de rama en inglés, kebab-case: feat/add-hero-cta,fix/navbar-scroll
Los merges a mainsolo ocurren desde developmediante PR
3. Convención de commits
Seguimos compromisos convencionales .

Formato:

<tipo>(<scope opcional>): <descripción>
Tipos permitidos:

Tipo	Cuándo usarlo
feat	Nueva funcionalidad
fix	Corrección de bug
docs	Solo cambios de documentación
refactor	Refactorización sin cambio funcional
test	Agregar o corregir pruebas
chore	Mantenimiento: dependencias, configuración
style	Formato, espacios — sin cambio de lógica
perf	Mejora de rendimiento
Reglas para la descripción:

En inglés, en modo imperativo: add, no addedniadding
Minúsculas, sin punto al final
Máximo 72 caracteres en la primera línea
Debe responder a "¿qué hace este commit?" de forma concreta
❌ Evitar	✅ Correcto
fix bug	fix(navbar): correct active link on scroll
update files	feat(home): add hero section with CTA button
changes	refactor(core): extract testimonials into service
Cuerpo del commit (opcional): Si el cambio necesita contexto, añade un cuerpo separado por una línea en blanco explicando el por qué , no el qué (no repitas en el cuerpo lo que ya dice el título):

fix(home): prevent myths section from overflowing on mobile

The myths grid used a fixed width that broke below 375px.
Switched to auto-fill columns to let the grid adapt naturally.
Ejemplos:

feat(home): add hero section with CTA button
fix(navbar): correct active link highlight on scroll
docs: add CONTRIBUTING.md with branching and commit guide
refactor(core): extract testimonials into standalone service
test(app): add unit tests for lazy-loaded routes
chore: upgrade angular to v20.3.1
style(home): apply prettier formatting to hero component
4. Tamaño de commits y PRs
Unidad	Límite
Líneas por commit	≤ 200 líneas cambiadas
Líneas por PR	≤ 400 líneas cambiadas
Archivos por PR	≤ 10 archivos
Un commit = un cambio atómico y coherente. Si tienes que escribir "y" en la descripción, probablemente son dos commits.

Si un PR supera los límites, divídelo en PRs más pequeños encadenados (uno como base del siguiente).

5. Proceso de Pull Request
Asegúrate de que tu rama esté actualizada con develop:
git fetch origin
git rebase origin/develop
El título del PR sigue la misma convención de commits:feat(home): add hero section
La descripción del PR debe incluir:
Qué cambia — resumen breve
Por qué — motivación o contexto
Cómo probar — pasos para verificar el cambio
Requiere al menos 1 aprobación antes de hacer merge
Los cheques deben pasar: pnpm testypnpm run build
Estrategia de fusión:
develop← ramas de trabajo: Squash & merge
main← develop: Confirmación de fusión
