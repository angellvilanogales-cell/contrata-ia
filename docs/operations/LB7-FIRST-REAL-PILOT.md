# LB-7 — Recorrido de la primera prueba real

## Finalidad

Ejecutar Contrata-IA como lo usaría una persona tramitadora, sin tocar código ni API, y comprobar que la aplicación produce un expediente documental coherente y revisable antes de plantear V1.0.

La primera prueba real se realizará dentro del alcance normativo ya validado por LB-4: servicio ordinario de limpieza de edificios/oficinas de la Junta de Andalucía. EVENT_SERVICES se probará en una segunda pasada documental mientras permanezca `PENDING_DEDICATED_RULE_VALIDATION`.

## Preparación

1. Abrir la URL HTTPS del piloto.
2. Introducir la credencial de piloto con permisos suficientes. La credencial permanece solo en la sesión del navegador mientras se navega entre la pantalla principal y la especializada.
3. Tener a mano un expediente real de limpieza del corpus, con Memoria, PCAP y PPT de referencia.
4. No copiar conclusiones jurídicas desde el expediente de referencia sin verificarlas: se usarán sus hechos y práctica documental, mientras que normativa y modelos oficiales vigentes prevalecen.

## Recorrido de usuario

### Paso 1. Crear o reanudar expediente

Seleccionar `Nuevo expediente guiado`, importar una Ficha DOCX o introducir el identificador de un expediente persistido para reanudarlo.

Resultado esperado: Contrata-IA crea o recupera un identificador de expediente, conserva el expediente seleccionado durante la sesión y muestra el progreso del recorrido.

### Paso 2. Introducir los hechos administrativos

Cumplimentar órgano de contratación, unidad promotora, objeto, necesidad, valor estimado, duración, presupuesto, IVA y demás hechos requeridos.

Resultado esperado: la aplicación no inventa datos no aportados; si falta un hecho obligatorio, no habilita la revisión final de datos.

### Paso 3. Introducir los hechos técnicos

Aportar descripción de edificios/centros, prestaciones mínimas, horarios cuando proceda, productos/requisitos y controles de calidad exactamente en los términos respaldados por el expediente fuente.

Resultado esperado: el PPT se alimenta de hechos aportados y no de cifras o frecuencias inventadas.

### Paso 4. Resolver decisiones documentales

Elegir si Necesidad e Idoneidad e Insuficiencia de Medios se integran en Memoria o se generan como documentos independientes cuando corresponda.

Resultado esperado: una misma decisión se refleja de forma coherente en todos los documentos.

### Paso 5. Revisar lotes, subrogación y protección de datos

Comprobar las advertencias del sistema. Si la subrogación no está acreditada, mantenerla sin cerrar como conclusión. Si la no división en lotes requiere motivación fáctica, aportarla.

Resultado esperado: las cuestiones no acreditadas permanecen abiertas y no se rellenan con fórmulas genéricas.

### Paso 6. Ejecutar revisión jurídica preventiva

Desde `Revisión especializada / prejurídica`, acceder a la pantalla especializada y cumplimentar únicamente el bloque de revisión preventiva para el expediente de limpieza.

Resultado esperado: la interfaz muestra en lenguaje administrativo `Requiere revisión antes de remisión jurídica`, `Sin alertas preventivas detectadas` o `Revisión preventiva no ejecutada`, conservando internamente los estados `REVIEW_REQUIRED`, `READY_FOR_HUMAN_LEGAL_REFERRAL` y `NOT_RUN`. El resultado no sustituye el informe jurídico.

La pantalla especializada recuerda además que EVENT_SERVICES es, en esta fase, un perfil documental y técnico y que su presencia no amplía automáticamente el alcance normativo validado en LB-4.

### Paso 7. Revisar y validar humanamente

Volver al asistente principal. La revisión debe presentar datos consolidados, propuestas del sistema, advertencias y alertas preventivas en formato legible, sin exigir leer JSON técnico. Identificar a la persona que valida.

Resultado esperado: la generación solo se habilita tras validación humana. Cualquier cambio posterior invalida esa validación.

### Paso 8. Generar documentos

Generar el paquete documental y descargar desde la propia interfaz los archivos ofrecidos.

Resultado esperado: descargar al menos Memoria, PCAP y PPT en DOCX editable y PDF; no deben aparecer IDs internos, nombres de fuentes, rutas técnicas ni estados como `PENDING_HUMAN_VALIDATION`.

### Paso 9. Comparación administrativa

Comparar los tres documentos generados con los documentos reales del expediente usado como referencia.

Registrar para cada documento:

- datos correctos/incorrectos;
- coherencia cruzada;
- estructura administrativa;
- motivación suficiente/insuficiente;
- referencias normativas visibles;
- tablas, numeración, cabeceras y formato;
- correcciones manuales necesarias.

Cada hallazgo se clasifica como `BLOQUEANTE`, `MAYOR`, `MENOR` o `MEJORA`.

### Paso 10. Persistencia

Cerrar/reiniciar el contenedor o servicio y volver a abrir el expediente usando su identificador.

Resultado esperado: respuestas, revisión especializada, validaciones vigentes y datos del caso reaparecen de forma consistente.

### Paso 11. Backup

Ejecutar backup con rol ADMIN y conservar el manifiesto. Restaurar una copia en entorno aislado antes de considerar cerrada LB-7.

### Paso 12. PWA

Abrir la URL HTTPS en Android y, cuando sea posible, iOS/iPadOS. Instalar Contrata-IA y comprobar navegación, reanudación del expediente y descarga documental.

Resultado esperado: el shell puede instalarse, pero `/api/`, expedientes, credenciales y documentos no quedan cacheados por el service worker.

## Segunda pasada: EVENT_SERVICES

Una vez superado el caso de limpieza, repetir el recorrido con uno de los expedientes de eventos ya `DEEP_READ`. En la pantalla especializada se activarán únicamente las prestaciones reales (sede, audiovisual, streaming, catering, accesibilidad, viajes, premios, etc.).

La interfaz debe recuperar una configuración EVENT_SERVICES ya guardada al volver al expediente, mostrar los hechos activados pendientes y evitar que una ausencia técnica se convierta en un dato inventado.

La finalidad de esta segunda pasada es comprobar composición documental y no ampliar silenciosamente el alcance jurídico: mientras el perfil permanezca `PENDING_DEDICATED_RULE_VALIDATION`, toda decisión normativa especializada deberá verificarse y validarse humanamente.

## Criterio de cierre de la primera prueba

La prueba se considera técnicamente superada cuando:

- el recorrido se completa desde navegador sin tocar código/API ni leer estructuras JSON internas;
- Memoria, PCAP y PPT se generan y abren correctamente;
- el expediente puede reanudarse y sobrevive a reinicio;
- el backup queda verificado;
- no hay metadatos internos en documentos finales;
- no hay defectos `BLOQUEANTE` ni `MAYOR` sin resolver.

El resultado de esta prueba no equivale todavía a autorización para producción general.
