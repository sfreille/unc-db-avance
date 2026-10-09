# Cohorte 2020: dashboard estático

Abrir `index.html` directamente en un navegador. No requiere R, servidor, conexión a Internet ni dependencias externas. Los filtros se ejecutan localmente.

## Actualizar los datos

Desde la carpeta `pi-unc`, ejecutar con PowerShell:

```powershell
./code/01_build_cohort_dashboard.ps1
```

El script lee `datasets/cohorte_2020_avance.csv`, conserva el original y regenera `cohort-dashboard/data.js`. Precalcula personas únicas para cada combinación de unidad y tipo, además de cada propuesta. No suma conteos de personas entre propuestas.

## Filtro de personas

El selector permite elegir todas las personas, quienes tienen una sola propuesta o quienes tienen más de una. La clasificación cuenta códigos de propuesta distintos por persona en el archivo completo, antes de aplicar filtros de unidad, tipo o propuesta. No identifica necesariamente cursado simultáneo.

La muestra contiene 574 personas con varias propuestas (1.232 registros) y 4.104 personas con una sola propuesta (4.104 registros). Todos los indicadores, gráficos y descarga respetan el grupo elegido. Los indicadores por registro usan solo los registros de la propuesta filtrada. El bloque por persona selecciona a las personas vinculadas a esa propuesta y considera todas sus propuestas en la muestra para calcular sus perfiles.

Para actualizar el sitio publicado, reemplazar juntos `index.html`, `app.js`, `style.css` y `data.js` en la rama de GitHub Pages. Los cambios locales no se publican solos.

Verificación de datos y filtros: `node code/02_verify_dashboard.cjs` desde `pi-unc`.

## Publicación

La carpeta `cohort-dashboard` es el artefacto estático completo. Publicar solo su contenido en la raíz de un repositorio dedicado de GitHub Pages (o en la carpeta de publicación de un sitio existente). No incluir el CSV original. Sitio publicado: https://sfreille.github.io/unc-db-avance/. Los cambios locales requieren actualizar el repositorio del sitio.

Antes de una publicación institucional, completar la fecha de corte y confirmar la definición de avance. Los resúmenes conservan grupos pequeños: no contienen IDs personales, pero no constituyen un procedimiento formal de control de divulgación.

## Inspección de la muestra

- 5.336 registros; 4.678 personas; 574 personas con más de una propuesta.
- `alumno` es único y no se repite la combinación `persona`–`propuesta`.
- 172 códigos de propuesta, 170 nombres, 38 etiquetas de unidad y 3 tipos.
- Grado: 4.522 registros; pregrado: 578; posgrado: 236.
- Sin campos vacíos. Un avance −1 se trata como no válido.
- Avance medio válido: 48,7744%; mediana: 38,89%; 513 registros con 0% y 1.397 con 100%.
- `Archivología` y `Licenciatura en Teatro` tienen dos códigos cada una; no se fusionan por nombre.
- Las etiquetas de unidad incluyen escuelas y posgrados; se conservan sin homologación inferida.
- No hay fecha de corte, estado de actividad ni confirmación de egreso.

Los indicadores originales de avance describen registros de personas en propuestas. El nuevo bloque por persona calcula promedios con igual peso para cada persona. La descarga incluye un total de selección y las propuestas seleccionadas, ordenadas por cantidad de registros.

## Diseño

Título: «Avance de carrera - Cohorte 2020». Tipografía local Avenir Next / Avenir, con alternativas Century Gothic y Segoe UI. No descarga fuentes externas. La vista de escritorio combina indicadores por registro, perfiles por persona, distribución del avance y un mapa de calor de todas las unidades de la selección; el contenido permite desplazamiento vertical. Cada celda tiene el mismo tamaño; el color representa el avance medio, no el tamaño de la unidad. Pasar el puntero o enfocar con el teclado muestra el nombre completo y la cantidad de registros; seleccionar una celda filtra esa unidad.

El explorador se eliminó; la descarga CSV permanece en el encabezado. En pantallas pequeñas los bloques se apilan y permiten desplazamiento. La metodología puede desplegarse al pie.

## Person-level progress and concentration

The person-level section gives every selected person equal weight. Faculty, type and programme filters identify people with a matching record; their profiles always use **all their programmes in the original sample**, including programmes outside the current filter. Existing record-level indicators and charts still use only matching records.

- Personal progress is the mean of that person's valid programme percentages. The displayed average is the mean of those personal means. People with no valid progress are excluded; partially observed profiles are counted explicitly.
- Passed subjects are first averaged across each person's programmes, then across people. This is not a sum of credits or distinct subjects.
- Highest progress, mean progress in remaining programmes, and their difference (percentage points) use only people with multiple programmes and valid progress in every programme. Each person has equal weight. Exactly one maximum is removed when computing the remaining average, including ties.
- The chart publishes counts in 10-percentage-point bins (left inclusive, right exclusive, except 90–100 inclusive), not individual profiles or identifiers. Remaining progress is on the horizontal axis; highest progress is on the vertical axis. Diagonal patterns suggest balanced progress; upper-left patterns suggest concentration.
- The highest-progress programme is not an identified primary programme. These fields do not establish current activity, simultaneous enrolment, switching, or intent.

The new section adds vertical scrolling to the desktop layout. Run `node code/03_verify_person_profiles.cjs` from `pi-unc` to reconcile all person summaries and chart cells against the source CSV. The source is never modified.

CSV exports include a `TOTAL SELECCIÓN` row and the programme rows. New `perfil_todas_propuestas_*` columns contain person-profile measures and denominators. These always refer to all programmes of the selected people. Do not add programme rows to obtain unique-person totals; use the total row. Gap values are in percentage points.

