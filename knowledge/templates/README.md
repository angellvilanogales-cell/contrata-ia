# Banco de Plantillas Documentales de CONTRATA IA

## Objetivo

Este directorio contiene todas las plantillas documentales utilizadas por CONTRATA IA para generar automáticamente la documentación de los expedientes de contratación pública.

Las plantillas están desacopladas del código fuente y únicamente contienen texto y variables.

---

# Organización

```
templates/

├── memorias/
│
├── pliegos/
│
├── informes/
│
├── resoluciones/
│
├── actas/
│
├── anexos/
│
└── comunes/
```

---

# Variables

Las variables siempre utilizarán el formato:

```
{{VARIABLE}}
```

Ejemplos:

```
{{OBJETO}}

{{CPV}}

{{VALOR_ESTIMADO}}

{{PRESUPUESTO_BASE}}

{{IVA}}

{{TIPO_CONTRATO}}

{{PROCEDIMIENTO}}

{{SOLVENCIA}}

{{PUBLICIDAD}}

{{DURACION}}

{{ORGANO_CONTRATACION}}

{{UNIDAD_PROMOTORA}}

{{RESPONSABLE_CONTRATO}}

{{FINANCIACION}}

{{FONDOS_PRTR}}

{{DIVISION_LOTES}}
```

---

# Normas

Nunca incluir datos fijos.

Siempre utilizar variables.

No incluir formatos específicos de Word.

Las plantillas deben ser independientes del formato.

---

# Flujo

Plantilla

↓

TemplateEngine

↓

ExpedienteContext

↓

Documento final

---

# Objetivo final

Todo documento administrativo del expediente deberá generarse exclusivamente mediante una plantilla contenida en este directorio.

No se redactarán documentos directamente desde TypeScript.
