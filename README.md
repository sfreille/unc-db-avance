# Cohorte 2020: dashboard estático

Abrir `index.html` directamente en un navegador. No requiere R, servidor, conexión a Internet ni dependencias externas. Los filtros se ejecutan localmente.

## Actualizar los datos

Desde la carpeta `pi-unc`, ejecutar con PowerShell:

```powershell
./code/01_build_cohort_dashboard.ps1
```

El script lee `datasets/cohorte_2020_avance.csv`, conserva el original y regenera `cohort-dashboard/data.js`. Precalcula personas únicas para cada combinación de unidad y tipo, además de cada propuesta. No suma conteos de personas entre propuestas.

## Publicación

La carpeta `cohort-dashboard` es el artefacto estático completo. Publicar solo su contenido en la raíz de un repositorio dedicado de GitHub Pages (o en la carpeta de publicación de un sitio existente). No incluir el CSV original. No se ha creado un repositorio ni desplegado este prototipo.

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

Los indicadores de avance describen registros de personas en propuestas, no un promedio de personas únicas. La media de aprobadas usa todos los registros. La búsqueda de texto afecta solo la tabla y su descarga.
