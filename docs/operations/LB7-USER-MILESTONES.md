# LB-7 — Hitos de colaboración del usuario

Este documento resume exclusivamente las actuaciones humanas necesarias para poder cerrar LB-7 y avanzar a candidato V1.0. El resto del desarrollo técnico continúa de forma autónoma en la rama `agent/lb7-qa-seguridad-v1`.

## Hito U1 — Aportar documentación real

Prioridad alta.

Aportar, cuando sea posible, expedientes completos o pares/tríos de documentos relacionados:

- Memoria justificativa;
- PCAP;
- PPT;
- informes de necesidad o insuficiencia cuando existan como documentos separados;
- anexos relevantes.

Preferencia: contratos de servicios, especialmente limpieza y mantenimiento, y documentos recientes de Junta de Andalucía/SAE.

Criterio de finalización: corpus suficiente para ampliar el golden set y contrastar coherencia cruzada.

## Hito U2 — Revisar paquete piloto documental

Cuando se entregue una nueva generación piloto, revisar como tramitador:

1. Memoria justificativa;
2. PCAP;
3. PPT;
4. Ficha de Datos del Expediente.

Para cada documento basta indicar:

- `CORRECTO PARA SEGUIR`, o
- `CAMBIARÍA: ...`, o
- `NO SE AJUSTA A LA PRÁCTICA REAL: ...`.

Criterio de finalización: no quedan defectos BLOQUEANTES o MAYORES conocidos.

## Hito U3 — Validar variantes de composición

Confirmar que resultan aceptables, según el expediente:

- necesidad e idoneidad integrada en Memoria o como informe independiente;
- insuficiencia de medios integrada en Memoria o como informe independiente;
- posibilidad de documentos adicionales a petición del tramitador.

Criterio de finalización: validación funcional expresa de las variantes.

## Hito U4 — Prueba PWA en dispositivo real

Cuando exista despliegue HTTPS piloto:

1. abrir la URL en Android/iPhone/tablet;
2. instalar mediante `Añadir a pantalla de inicio` o el flujo de instalación disponible;
3. abrir Contrata-IA desde el icono;
4. crear o abrir expediente de prueba;
5. descargar Ficha DOCX;
6. volver a subir una Ficha;
7. comprobar que no quedan documentos sensibles disponibles sin autenticación.

Criterio de finalización: instalación y flujo básico móvil correctos sin defecto BLOQUEANTE/MAYOR.

## Hito U5 — Piloto administrativo controlado

Usar uno o varios casos representativos y revisar:

- datos de entrada;
- propuestas normativas;
- validación humana;
- Memoria/PCAP/PPT generados;
- coherencia entre documentos;
- persistencia y recuperación del expediente.

Criterio de finalización: piloto aceptado sin defectos BLOQUEANTES o MAYORES.

## Hito U6 — Aceptación de LB-7

Emitir una validación final del tipo:

`LB-7 válida para candidato V1.0`,

siempre que el informe de cierre no recoja defectos BLOQUEANTES o MAYORES abiertos.

## Regla operativa

No se requiere autorización del usuario para cada cambio técnico. El desarrollo continúa autónomamente. Solo se escalarán para decisión humana:

- decisiones jurídicas o administrativas no deducibles de fuentes vigentes;
- conflictos entre modelos/práctica que impliquen elegir criterio funcional;
- aceptación del piloto y cierre de LB-7.
