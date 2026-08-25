# LB25 — Cierre de release V1

## Objeto

LB25 no crea una nueva arquitectura. Su función es impedir que Contrata-IA se declare V1 productiva únicamente porque la CI esté verde o porque existan motores, modelos y renderers aislados.

La V1 solo puede cerrarse cuando el alcance declarado está respaldado por expedientes reales aceptados extremo a extremo y por evidencia operativa verificable.

## Regla de alcance

Un tipo contractual existente en el dominio (`SUPPLY`, `SERVICE`, `WORKS`, etc.) no forma parte automáticamente del alcance V1.

Cada escenario soportado debe declarar expresamente:

- identificador de escenario;
- tipo de contrato;
- procedimiento;
- documentos administrativos requeridos;
- al menos un expediente real aceptado que respalde ese escenario.

No existe fallback entre tipos, procedimientos o modelos.

## Evidencias obligatorias antes de producción

Además del cierre de aceptación de LB24, la release candidata debe acreditar:

1. modo productivo autenticado;
2. persistencia y recarga del expediente real;
3. backup y restauración de la release candidata;
4. despliegue HTTPS comprobado;
5. recorrido completo desde navegador, sin edición manual de JSON o código;
6. originales editables oficiales del alcance V1 verificados físicamente;
7. generación heredada deshabilitada para producción;
8. documentación de usuario y operación cerrada;
9. revisión humana final de la release, con identidad del revisor.

## Criterio de cierre

`engineeringReady=true` significa que el mecanismo de aceptación y release está técnicamente completo para el alcance declarado.

`productionReady=true` exige además que todas las evidencias anteriores sean reales y estén verificadas.

No se permite sustituir una evidencia real por un test sintético, una URL, un PDF, una copia derivada ni una declaración manual sin soporte.

## Estado al abrir LB25

En el momento de implantación de esta puerta final, el repositorio mantiene bloqueada la declaración productiva porque todavía no existe un expediente real aceptado de extremo a extremo con los activos editables oficiales físicamente incorporados y auditados, ni se ha verificado el despliegue HTTPS final y el recorrido real de navegador sobre la release candidata.

Este bloqueo es intencionado y forma parte del criterio de seguridad documental y jurídica de Contrata-IA.
