# Banco de Snippets Jurídicos

## Objetivo

Los snippets son fragmentos de redacción administrativa reutilizables.

No constituyen documentos completos, sino párrafos o bloques que podrán insertarse automáticamente en memorias, informes, pliegos y resoluciones.

---

# Filosofía

Un mismo texto jurídico nunca debe estar duplicado en varias plantillas.

Siempre existirá una única versión oficial del fragmento.

Si cambia la normativa o la doctrina, únicamente será necesario modificar este archivo.

---

# Organización

```
snippets/

necesidad/

insuficiencia_medios/

objeto/

division_lotes/

procedimiento/

solvencia/

clasificacion/

publicidad/

duracion/

criterios/

garantias/

penalidades/

modificaciones/

prorrogas/

ejecucion/

recepcion/

liquidacion/

financiacion/

proteccion_datos/

igualdad/

medioambiente/

innovacion/
```

---

# Variables

Los snippets podrán utilizar las mismas variables que las plantillas.

Ejemplo

```
{{OBJETO}}

{{CPV}}

{{PROCEDIMIENTO}}

{{VALOR_ESTIMADO}}

{{PUBLICIDAD}}

{{SOLVENCIA}}
```

---

# Uso

Plantilla principal

↓

Inserta snippets

↓

Documento final

---

# Regla

Toda redacción jurídica reutilizable deberá almacenarse como snippet antes de incorporarse a una plantilla.
