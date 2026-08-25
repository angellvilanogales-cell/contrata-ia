# Contrata-IA V1 — cierre autónomo y traspaso a piloto

## Estado alcanzado

La ingeniería automatizable del perfil productivo validado `FERRETERIA_SUPPLY_ASA_DA33_V1` queda cerrada para:

- PCAP protegido sobre el modelo oficial exacto de suministro ASA.
- Memoria justificativa protegida sobre la fuente editable V12 del expediente.
- PPT protegido sobre la fuente editable V6 del expediente.
- Catálogo canónico único de 98 referencias y auditoría cruzada.
- Generación conjunta de `PCAP + Memoria + PPT + manifest.json` en ZIP.
- Descarga del ZIP desde la interfaz universal.
- Bloqueo de la generación legacy en producción.
- Verificación SHA-256 de los tres ODT fuente antes de renderizar.
- Auditorías post-render y bloqueo ante divergencias documentales.

`engineeringReady` no equivale a `productionReady`. La aceptación humana no se autocertifica.

## Activos runtime exigidos

El directorio indicado por `CONTRATA_IA_TEMPLATE_DIR` debe contener exactamente:

| Documento | Fichero | SHA-256 |
|---|---|---|
| PCAP | `2025_12_17_pcap_suministro_abierto_simplificado_abreviado_autofinanciada.odt` | `45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc` |
| Memoria | `04_Memoría Ferretería SSCC SAE V12_letrado.odt` | `36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc` |
| PPT | `PPT Feretería SSCC SAE V6.odt` | `c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09` |

La instalación puede realizarse con:

```bash
npm run install:v1-runtime-assets -- /ruta/al/bundle/templates "$CONTRATA_IA_TEMPLATE_DIR"
```

El instalador rechaza cualquier activo cuyo hash no coincida y vuelve a verificar el fichero después de copiarlo.

## Recorrido de piloto pendiente

1. Desplegar la rama candidata en una URL HTTPS con disco persistente y credenciales de producción.
2. Instalar los tres activos exactos y comprobar `/api/runtime-assets/readiness`.
3. Abrir `/universal-evidence`, cargar el expediente, revisar/validar evidencias y comprobar `production-readiness`.
4. Pulsar `Generar y descargar PCAP + Memoria + PPT` y verificar que la respuesta es un ZIP con cuatro entradas: tres ODT y `manifest.json`.
5. Abrir los tres ODT y realizar la aceptación documental humana.
6. Reiniciar la aplicación y comprobar persistencia del expediente/evidencias.
7. Ejecutar backup, restaurar en entorno controlado y comprobar lectura/generación.

## Dependencias que no pueden autocerrarse desde el repositorio

- URL/entorno HTTPS real de piloto.
- Instalación efectiva de los activos en ese servidor.
- Ejecución E2E real con esos activos y navegador.
- Prueba real de reinicio, persistencia y backup/restauración en el despliegue.
- Aceptación humana de PCAP, Memoria y PPT.

Hasta disponer de estas evidencias `productionReady` debe permanecer en `false` y la versión del paquete no debe promoverse a `1.0.0`.
