# LB-7 — Despliegue piloto HTTPS

## Estado

Este documento prepara un piloto controlado. No declara el sistema apto para producción general ni sustituye las decisiones corporativas de infraestructura, identidad, protección de datos, retención o continuidad.

## Arquitectura mínima del piloto

Navegador/PWA -> HTTPS/TLS del proxy o plataforma -> contenedor Contrata-IA -> volumen persistente `/data/contrata-ia`.

El proceso Node escucha dentro del contenedor en `0.0.0.0` únicamente mediante `scripts/start-pilot.mjs`. El arranque ordinario de desarrollo conserva su comportamiento local.

## Opción preparada para obtener una URL HTTPS de piloto

Se incorpora `render.yaml` como Blueprint reproducible para Render, manteniendo el `Dockerfile` como artefacto portable. La elección responde únicamente a la fase de piloto: el servicio admite Docker, termina HTTPS en la plataforma, permite secretos como variables de entorno, health check y disco persistente. No implica elegir Render como infraestructura institucional definitiva.

El Blueprint queda configurado para:

- rama `agent/lb7-qa-seguridad-v1`;
- runtime Docker;
- región Frankfurt;
- despliegue automático únicamente cuando pasan los checks;
- health check `/api/health`;
- `NODE_ENV=production`;
- autenticación obligatoria;
- directorio persistente `/data/contrata-ia`;
- disco persistente de piloto;
- secreto `CONTRATA_IA_ADMIN_TOKEN` solicitado fuera del repositorio.

Para crear la URL real hace falta una única actuación externa que este repositorio no puede ejecutar por sí solo: conectar el repositorio a una cuenta/Workspace de Render con permisos de despliegue y proporcionar el secreto de piloto. Después Render asigna un subdominio HTTPS propio y construye el contenedor desde el Blueprint.

Si el organismo dispone de otra plataforma de contenedores, el mismo `Dockerfile` puede desplegarse allí sin depender de Render.

## Variables obligatorias o recomendadas

- `NODE_ENV=production`.
- `PORT` asignado por la plataforma o 3000 en ejecución local controlada.
- `HOST=0.0.0.0` dentro del contenedor.
- `CONTRATA_IA_DATA_DIR=/data/contrata-ia` con volumen persistente.
- `CONTRATA_IA_AUTH_REQUIRED=1`.
- al menos una credencial LB-7 suministrada como secreto del entorno; para el piloto integral puede usarse `CONTRATA_IA_ADMIN_TOKEN`.

Los secretos no deben incluirse en la imagen, en `render.yaml`, en logs ni en Git.

## Construcción local

```bash
docker build -t contrata-ia:lb7-pilot .
```

## Ejecución detrás de un terminador HTTPS propio

```bash
docker run --rm \
  -p 127.0.0.1:3000:3000 \
  -v contrata_ia_data:/data/contrata-ia \
  -e NODE_ENV=production \
  -e CONTRATA_IA_AUTH_REQUIRED=1 \
  -e CONTRATA_IA_ADMIN_TOKEN='<secreto>' \
  contrata-ia:lb7-pilot
```

En un servidor propio, el puerto publicado debe permanecer detrás del proxy HTTPS y del control de red correspondiente. En una plataforma gestionada, el servicio interno se expone únicamente a través del router HTTPS de la plataforma.

## Recorrido concreto para publicar el piloto con el Blueprint

1. Conectar una cuenta/Workspace de Render al repositorio GitHub.
2. Crear un Blueprint desde el `render.yaml` de esta rama.
3. Introducir `CONTRATA_IA_ADMIN_TOKEN` cuando la plataforma solicite el valor marcado `sync: false`.
4. Esperar a que la plataforma construya el `Dockerfile` y el health check `/api/health` quede verde.
5. Abrir el subdominio HTTPS asignado.
6. Introducir el token únicamente en la pantalla de acceso del piloto.
7. Crear un expediente de prueba y seguir `docs/operations/LB7-FIRST-REAL-PILOT.md`.

## Comprobaciones antes de entregar la URL al piloto

1. `/api/health` responde correctamente por HTTPS.
2. HTTP se redirige a HTTPS o no queda expuesto.
3. La aplicación no arranca en modo producción sin autenticación configurada.
4. El volumen persistente sobrevive al reinicio/recreación del contenedor.
5. Se crea un expediente de prueba, se reinicia el proceso y el expediente reaparece.
6. Se genera un backup y se verifica el manifiesto.
7. El service worker no cachea `/api/`, expedientes, credenciales ni documentos.
8. Se comprueba que los documentos generados requieren la autorización prevista.
9. No se registran secretos en logs ni en Git.
10. La pantalla `/specialized` permite configurar EVENT_SERVICES y revisión jurídica preventiva sin tocar API manualmente.
11. La PWA se prueba físicamente en al menos un dispositivo Android y, cuando sea posible, iOS/iPadOS.

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
