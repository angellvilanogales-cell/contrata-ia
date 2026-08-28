# LB99 — Orquestación Mixed · cierre de alcance de piloto

## Decisión de alcance

LB99 queda cerrado para el alcance de viabilidad del piloto con contratos mixtos de **suministro + servicios**. No se declara cobertura física general de todas las combinaciones mixtas posibles.

La decisión evita una plantilla `MIXED` genérica jurídicamente incorrecta. La composición se determina conforme a los artículos 18, 34.2 y 122.2 LCSP y conserva la identidad y régimen de cada prestación.

## Alcance físicamente operativo

Dos perfiles independientes:

- `SUPPLY_PRINCIPAL`: suministro como prestación principal y régimen de adjudicación gobernante.
- `SERVICE_PRINCIPAL`: servicio como prestación principal y régimen de adjudicación gobernante.

Cada perfil dispone de PCAP, Memoria y PPT propios derivados de Contrata-IA, `officialModel=false`, con procedencia `LCSP_18_34_122_PLUS_JDA_MIXED_SUPPLY_SERVICE_REAL_CASES` y validación humana obligatoria.

Los seis activos están persistidos y su longitud y SHA-256 han sido recalculados sobre los bytes decodificados en PostgreSQL.

## Salvaguardas

- `genericMixedTemplateAllowed=false` de forma permanente.
- La prestación principal no se presume cuando la regla jurídica no permite determinarla automáticamente.
- El empate de valores Supply/Service bloquea decisión automática.
- El régimen de efectos, cumplimiento y extinción se diferencia por prestación conforme al artículo 122.2 LCSP.
- El PPT exige contenido técnico separado de suministro, servicio, integración y control/recepción.
- Las combinaciones Mixed con `WORKS` o `CONCESSION` no reutilizan los perfiles Supply+Service y responden con bloqueo seguro.
- Los expedientes reales de la Junta se usan como contraste/regresión y nunca como plantillas generales.

## Evidencia técnica

- E2E físico de `SUPPLY_PRINCIPAL` con los bytes persistidos.
- E2E físico de `SERVICE_PRINCIPAL` con los bytes persistidos.
- Regresión de mutación binaria: un cambio en los bytes invalida el perfil.
- Regresión de alcance: una combinación con Works es rechazada.
- Runtime `/mixed` solo habilita ZIP para composición exacta Supply+Service con revisión humana completa y 3/3 activos del perfil seleccionado.
- CI #2636, run `33148565520`, `SUCCESS` sobre el commit `d8452141a3000bd1484a7bbad98d40e0fc8e510f`.

## Estado

- Mixed Supply+Service: **physical operational for pilot scope**
- Supply principal: **operational**
- Service principal: **operational**
- Mixed con Works: **fuera de alcance inicial y bloqueado de forma segura**
- Mixed con Concession: **fuera de alcance inicial y bloqueado de forma segura**
- plantilla Mixed genérica: **prohibida**
- humanValidationRequired: **true**
- productionReady: **false**

Este cierre es suficiente para continuar la viabilidad del piloto. La ampliación a otras combinaciones Mixed es una evolución posterior y no debe impedir LB100-LB102 mientras permanezca bloqueada de forma segura.
