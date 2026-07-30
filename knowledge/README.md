# BANCO DE CONOCIMIENTO DE CONTRATA IA

**Versión:** 1.0.0

**Estado:** Documento Director

---

# Objetivo

El directorio **knowledge/** constituye el núcleo de conocimiento de CONTRATA IA.

Su finalidad es separar completamente el conocimiento jurídico del código fuente para permitir la evolución del sistema sin necesidad de modificar la aplicación.

Toda decisión jurídica deberá estar fundamentada en el conocimiento almacenado en este directorio.

El código únicamente será responsable de interpretar dicho conocimiento.

---

# Principios

El Banco de Conocimiento se rige por los siguientes principios:

- Separación absoluta entre código y conocimiento.
- Una única fuente de verdad.
- Reutilización máxima del conocimiento.
- Trazabilidad completa.
- Versionado de todos los elementos.
- Explicabilidad de todas las decisiones.
- Evolución independiente del software.

---

# Arquitectura

```
knowledge/

├── README.md
├── VERSION.yaml
│
├── catalogo-maestro/
│
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
├── guias/
│
└── modelos/
```

---

# Catálogo Maestro

El **Catálogo Maestro** constituye el núcleo documental del Banco de Conocimiento.

No almacena documentos completos.

Almacena conocimiento reutilizable.

Su misión es suministrar toda la información necesaria para construir automáticamente documentos administrativos.

Está formado por:

- Activos Documentales
- Reglas Jurídicas
- Relaciones
- Plantillas
- Índices
- Metadatos

---

# Activos Documentales

Un Activo Documental representa la unidad mínima reutilizable del sistema.

Ejemplos:

- Justificación de la necesidad.
- Justificación de insuficiencia de medios.
- Objeto del contrato.
- Justificación del procedimiento.
- Justificación del CPV.
- División en lotes.
- Solvencia económica.
- Solvencia técnica.
- Garantías.
- Penalidades.
- Conclusiones.

Un mismo activo podrá utilizarse simultáneamente en:

- Memoria Justificativa.
- PCAP.
- PPT.
- Informes.
- Resoluciones.
- Anexos.

---

# Reglas Jurídicas

Las reglas contienen la lógica normativa utilizada por los motores expertos.

Ejemplos:

- Procedimiento de adjudicación.
- Publicidad.
- Solvencia.
- Garantías.
- Duración.
- Modificaciones.
- Penalidades.
- Recursos.

Las reglas nunca contendrán texto documental.

Únicamente expresarán condiciones y decisiones jurídicas.

---

# Plantillas

Las plantillas definen exclusivamente la estructura documental.

No contienen conocimiento jurídico.

Determinan:

- Secciones.
- Orden.
- Bloques.
- Dependencias.
- Composición del documento.

Todo el contenido será suministrado por los Activos Documentales.

---

# Snippets

Los snippets contienen fragmentos de redacción administrativa reutilizable.

Ejemplos:

- Necesidad.
- Insuficiencia de medios.
- División en lotes.
- Solvencia.
- Garantías.
- Penalidades.
- Modificaciones.
- Conclusiones.

Cada snippet podrá disponer de múltiples variantes según:

- Tipo de contrato.
- Procedimiento.
- Órgano de contratación.
- Sector.
- Nivel de detalle.

---

# Normativa

Contendrá toda la normativa utilizada por CONTRATA IA.

Ejemplos:

- Ley 9/2017 de Contratos del Sector Público.
- Ley 39/2015.
- Ley 40/2015.
- Reglamentos de desarrollo.
- Normativa de la Junta de Andalucía.
- Instrucciones internas.
- Circulares.
- Guías oficiales.

---

# CPV

Contendrá la clasificación oficial de códigos CPV.

Fuente principal:

Reglamento (CE) nº 213/2008.

Permitirá relacionar automáticamente:

- Objeto.
- Tipo de contrato.
- Procedimiento.
- Solvencia.
- Cláusulas.
- Documentación.

---

# Jurisprudencia

Repositorio de resoluciones y doctrina administrativa.

Entre otras:

- Tribunal Supremo.
- Tribunal de Justicia de la Unión Europea.
- TACRC.
- Tribunales Administrativos de Recursos Contractuales.
- Junta Consultiva de Contratación Pública.
- Informes relevantes.

---

# Informes

Repositorio de informes emitidos por organismos especializados.

Ejemplos:

- Junta Consultiva.
- IGAE.
- Abogacía del Estado.
- Intervención.
- Órganos consultivos.

---

# Guías

Documentación técnica utilizada como apoyo.

Ejemplos:

- Junta de Andalucía.
- Ministerio de Hacienda.
- Comisión Europea.
- Buenas prácticas.
- Manuales.

---

# Modelos

Repositorio de modelos documentales reales.

No se utilizarán para copiar contenido.

Su finalidad será:

- Analizar estructuras.
- Identificar bloques reutilizables.
- Extraer activos documentales.
- Homogeneizar el estilo administrativo.

---

# Flujo de conocimiento

```
Normativa
        │
        ▼
Reglas Jurídicas
        │
        ▼
Motores Expertos
        │
        ▼
Expediente
        │
        ▼
Plan Documental
        │
        ▼
Activos Documentales
        │
        ▼
Plantillas
        │
        ▼
Documento Administrativo
```

---

# Filosofía de desarrollo

El conocimiento debe evolucionar sin modificar el código.

Nunca se codificará directamente:

- una decisión jurídica;
- una cláusula;
- una justificación;
- un documento administrativo.

Todo deberá proceder del Banco de Conocimiento.

El código únicamente interpretará dicho conocimiento.

---

# Versionado

Todo elemento almacenado en el Banco de Conocimiento deberá disponer de:

- Identificador único.
- Versión.
- Estado.
- Fecha de creación.
- Fecha de modificación.
- Fuente.
- Referencia normativa.
- Nivel de confianza.
- Dependencias.

---

# Objetivo de la Versión 1.0

El Banco de Conocimiento deberá proporcionar toda la información necesaria para generar automáticamente:

- Memoria Justificativa.
- Informe de insuficiencia de medios.
- Pliego de Cláusulas Administrativas Particulares.
- Pliego de Prescripciones Técnicas.
- Resolución de inicio.
- Resolución de aprobación.

---

# Proyecto

**CONTRATA IA**

Asistente Inteligente para la Elaboración de Expedientes de Contratación Pública

Consejería de Empleo

Junta de Andalucía
