# BANCO DE CONOCIMIENTO DE CONTRATA IA

## Objetivo

Este directorio contiene todo el conocimiento jurídico utilizado por CONTRATA IA.

El objetivo es separar completamente:

- Código
- Normativa
- Reglas
- Plantillas
- Redacción administrativa

De esta forma el conocimiento podrá evolucionar sin modificar el software.

---

# Estructura

```
knowledge/

├── cpv/
│
├── normativa/
│
├── rules/
│
├── templates/
│
├── snippets/
│
├── jurisprudencia/
│
├── informes/
│
└── guias/
```

---

# Contenido de cada directorio

## cpv

Listado oficial de códigos CPV.

Fuente:

Reglamento (CE) 213/2008.

---

## normativa

Normativa consolidada.

Ejemplo

LCSP

Ley 39/2015

Ley 40/2015

Reglamentos

Normativa Junta de Andalucía

---

## rules

Reglas jurídicas del sistema experto.

Ejemplo

procedimiento.rules.json

solvencia.rules.json

publicidad.rules.json

plazos.rules.json

...

---

## templates

Modelos completos de documentos.

Ejemplo

PCAP

PPT

Memorias

Informes

Resoluciones

Actas

---

## snippets

Fragmentos jurídicos reutilizables.

Ejemplo

Justificación necesidad

Insuficiencia medios

División en lotes

Criterios adjudicación

Solvencia económica

Solvencia técnica

Garantías

Modificaciones

Penalidades

Prórrogas

---

## jurisprudencia

Sentencias y doctrina.

TS

TJUE

TACRC

Tribunales Administrativos

JCCA

---

## informes

Informes de órganos consultivos.

JCCA

IGAE

Abogacía del Estado

Tribunales Administrativos

---

## guias

Guías técnicas.

Junta de Andalucía

Ministerio de Hacienda

Comisión Europea

Buenas prácticas

---

# Filosofía

Todo el conocimiento debe residir aquí.

El código únicamente debe interpretar este conocimiento.

Nunca codificar directamente una decisión jurídica.

Nunca redactar directamente un documento.

Todo debe proceder del Banco de Conocimiento.

---

# Flujo

Normativa

↓

Reglas

↓

Motores

↓

Expediente

↓

Plantillas

↓

Documento final
