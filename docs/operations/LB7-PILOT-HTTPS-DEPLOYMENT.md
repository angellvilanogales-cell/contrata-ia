# LB-7 — Despliegue piloto HTTPS

## Estado

Este documento prepara un piloto controlado. No declara el sistema apto para producción general ni sustituye las decisiones corporativas de infraestructura, identidad, protección de datos, retención o continuidad.

## Arquitectura mínima del piloto

Navegador/PWA -> HTTPS/TLS del proxy o plataforma -> contenedor Contrata-IA -> volumen persistente `/data/contrata-ia`.

El proceso Node escucha dentro del contenedor en `0.0.0.0:3000` únicamente mediante `scripts/start-pilot.mjs`. El arranque ordinario de desarrollo conserva su comportamiento local.

## Variables obligatorias o recomendadas

- `NODE_ENV=production`.
- `PORT=3000` salvo asignación de la plataforma.
- `HOST=0.0.0.0` dentro del contenedor.
- `CONTRATA_IA_DATA_DIR=/data/contrata-ia` con volumen persistente.
- `CONTRATA_IA_AUTH_REQUIRED=1`.
- credenciales/roles de LB-7 suministrados como secretos del entorno, nunca en Git.

La configuración concreta de credenciales debe seguir la política implementada en `SecurityPolicy`; los secretos no deben incluirse en la imagen ni en el repositorio.

## Construcción

```bash
docker build -t contrata-ia:lb7-pilot .
```

## Ejecución detrás de un terminador HTTPS

```bash
docker run --rm \
  -p 127.0.0.1:3000:3000 \
  -v contrata_ia_data:/data/contrata-ia \
  -e NODE_ENV=production \
  -e CONTRATA_IA_AUTH_REQUIRED=1 \
  contrata-ia:lb7-pilot
```

En un servidor propio, el puerto publicado debe permanecer detrás del proxy HTTPS y del control de red correspondiente. En una plataforma gestionada, el servicio interno puede exponerse al router de la propia plataforma, que debe proporcionar HTTPS público.

## Comprobaciones antes de entregar la URL al piloto

1. `/api/health` responde correctamente por HTTPS.
2. HTTP se redirige a HTTPS o no queda expuesto.
3. La aplicación no arranca en modo producción sin la configuración de autenticación exigida.
4. El volumen persistente sobrevive al reinicio/recreación del contenedor.
5. Se crea un expediente de prueba, se reinicia el proceso y el expediente reaparece.
6. Se genera un backup y se verifica el manifiesto.
7. El service worker no cachea `/api/`, expedientes, credenciales ni documentos.
8. Se comprueba que los documentos generados requieren la autorización prevista.
9. No se registran secretos en logs ni en Git.
10. La PWA se prueba físicamente en al menos un dispositivo Android y, cuando sea posible, iOS/iPadOS.

## Lo que este despliegue NO resuelve

- proveedor corporativo definitivo de identidad;
- SSO institucional;
- infraestructura definitiva de la Junta/organismo receptor;
- retención documental corporativa;
- SIEM/observabilidad centralizada;
- alta disponibilidad;
- balanceo multiinstancia con bloqueo distribuido;
- restauración operativa automatizada de producción;
- análisis de impacto/procedimientos de protección de datos que correspondan al despliegue definitivo.

Estas cuestiones son posteriores al piloto controlado y requieren decisión humana/institucional.
