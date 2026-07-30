# CATÁLOGO MAESTRO
## CONTRATA IA

**Versión:** 1.0.0

**Estado:** Activo

---

# Finalidad

El Catálogo Maestro constituye el núcleo documental de CONTRATA IA.

Su misión es almacenar todo el conocimiento documental reutilizable necesario para construir automáticamente los distintos documentos administrativos utilizados durante la tramitación de un expediente de contratación pública.

No almacena documentos completos.

Almacena conocimiento estructurado.

---

# Objetivos

El Catálogo Maestro persigue los siguientes objetivos:

- Reutilizar conocimiento.
- Evitar duplicidades.
- Homogeneizar la documentación.
- Garantizar coherencia documental.
- Mantener trazabilidad normativa.
- Facilitar el mantenimiento.
- Permitir la evolución independiente del código.

---

# Filosofía

CONTRATA IA nunca redacta un documento desde cero.

Todos los documentos administrativos se construyen mediante la combinación de Activos Documentales almacenados en este catálogo.

Un mismo Activo Documental puede utilizarse simultáneamente en:

- Memoria Justificativa.
- PCAP.
- PPT.
- Informes.
- Resoluciones.
- Anexos.

---

# Arquitectura

```
catalogo-maestro/

├── README.md
│
├── indices/
│
├── activos/
│
├── reglas/
│
├── plantillas/
│
├── relaciones/
│
└── metadatos/
```

---

# Componentes

## 1. Activos Documentales

Constituyen la unidad mínima reutilizable.

Ejemplos:

- Necesidad.
- Objeto.
- CPV.
- Procedimiento.
- Solvencia.
- Garantías.
- Penalidades.
- Conclusiones.

Cada activo será completamente independiente.

---

## 2. Reglas Jurídicas

Contienen exclusivamente lógica normativa.

Ejemplos:

- Determinación del procedimiento.
- Publicidad.
- Solvencia.
- Umbrales.
- Duración.
- Recursos.

Las reglas nunca contendrán texto administrativo.

---

## 3. Plantillas

Definen exclusivamente la estructura documental.

Una plantilla determina:

- Secciones.
- Orden.
- Dependencias.
- Composición.

Todo el contenido será suministrado por los Activos Documentales.

---

## 4. Relaciones

Las relaciones permiten navegar automáticamente entre activos.

Ejemplo:

```
Necesidad
      │
      ▼
Objeto
      │
      ▼
CPV
      │
      ▼
Procedimiento
      │
      ▼
Publicidad
      │
      ▼
Solvencia
```

Estas relaciones constituyen el verdadero modelo de conocimiento de CONTRATA IA.

---

## 5. Metadatos

Todo elemento del catálogo deberá disponer, al menos, de:

- Identificador único.
- Versión.
- Estado.
- Categoría.
- Subcategoría.
- Fuente.
- Referencia normativa.
- Dependencias.
- Fecha de creación.
- Fecha de modificación.

---

# Organización de los Activos

Los activos se organizan por documento y posteriormente por materia.

Ejemplo:

```
activos/

memoria/

pcap/

ppt/

informes/

resoluciones/

comunes/
```

Dentro de cada categoría los activos serán independientes.

Ejemplo:

```
memoria/

MEM.NEC.001.yaml

MEM.NEC.002.yaml

MEM.OBJ.001.yaml

MEM.CPV.001.yaml

MEM.LOT.001.yaml
```

Cada fichero contendrá exclusivamente un Activo Documental.

---

# Convención de Identificadores

Todos los activos seguirán una nomenclatura homogénea.

Ejemplos:

```
MEM.NEC.001

MEM.OBJ.001

MEM.CPV.001

PCAP.SOL.003

PPT.TEC.004

INF.CON.002
```

Donde:

- MEM = Memoria.
- PCAP = Pliego Administrativo.
- PPT = Pliego Técnico.
- INF = Informe.

El segundo bloque identifica la materia.

El tercer bloque identifica el elemento.

---

# Ciclo de vida

Todo Activo Documental pasa por los siguientes estados:

- Borrador.
- En revisión.
- Validado.
- Vigente.
- Obsoleto.
- Archivado.

El sistema nunca utilizará activos marcados como obsoletos.

---

# Principios de diseño

Todo activo debe cumplir:

- Una única responsabilidad.
- Reutilización.
- Independencia.
- Trazabilidad.
- Versionado.
- Explicabilidad.

---

# Relación con el Banco de Conocimiento

```
Normativa

        │

        ▼

Reglas Jurídicas

        │

        ▼

Catálogo Maestro

        │

        ▼

Motores Expertos

        │

        ▼

Plan Documental

        │

        ▼

Documento Administrativo
```

---

# Evolución prevista

Versión 1.0

- Memoria Justificativa.
- PCAP.
- PPT.
- Informes.

Versiones posteriores incorporarán nuevos tipos documentales manteniendo la misma arquitectura.

---

# Objetivo de la versión 1.0

La primera versión del Catálogo Maestro deberá ser capaz de proporcionar todos los Activos Documentales necesarios para generar automáticamente:

- Memoria Justificativa.
- Pliego de Cláusulas Administrativas Particulares.
- Pliego de Prescripciones Técnicas.
- Informes.
- Resoluciones.

---

# Documento Director

Este documento constituye la referencia arquitectónica del Catálogo Maestro.

Toda ampliación del Banco de Conocimiento deberá respetar las normas aquí definidas.
