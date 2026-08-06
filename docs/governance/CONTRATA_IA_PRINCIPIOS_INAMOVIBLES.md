# CONTRATA-IA — PRINCIPIOS INAMOVIBLES DEL PROYECTO

**Documento de gobierno permanente del proyecto**  
**Estado:** INAMOVIBLE  
**Versión:** 1.0  

## 1. Objetivo final

Contrata-IA debe convertirse en una aplicación real de asistencia a la contratación pública que guíe al usuario desde **Crear nuevo expediente** hasta un expediente completo, trazable y exportable.

Flujo permanente:

CREAR EXPEDIENTE
→ ASISTENTE GUIADO
→ RECOPILAR INFORMACIÓN
→ ANÁLISIS NORMATIVO
→ PROPUESTA JUSTIFICADA
→ VALIDACIÓN DEL TÉCNICO
→ GENERACIÓN DOCUMENTAL
→ VALIDACIÓN DOCUMENTAL
→ EXPORTACIÓN
→ EXPEDIENTE COMPLETO
→ AUDITORÍA Y TRAZABILIDAD

## 2. Principios inamovibles

### PI-01 — El objetivo es la aplicación, no el número de archivos
El avance se mide por capacidades funcionales verificables, no por archivos, líneas de código o clases.

### PI-02 — Una sola implementación canónica
Para cada responsabilidad debe existir una única implementación activa. Las duplicidades se consolidan, archivan o eliminan de forma controlada.

### PI-03 — Antes de crear, buscar y consolidar
Antes de crear cualquier componente se debe comprobar si ya existe, quién lo utiliza y si hay implementaciones equivalentes.

### PI-04 — La compilación es una puerta obligatoria
No se avanza ignorando TypeScript errors, imports no resueltos, contratos incompatibles o dependencias inexistentes.

Puerta mínima:
- TYPECHECK = 0 errores
- BUILD = 0 errores

### PI-05 — Las fases se cierran por criterios de aceptación
Un componente no está terminado porque el código exista. Debe compilar, integrarse, probarse y cumplir su criterio de aceptación.

Referencia:
- 25 %: diseño y componente canónico
- 50 %: compila aisladamente
- 75 %: integrado y probado
- 100 %: salida real + aceptación

### PI-06 — La línea base es la autoridad
El estado real se determina por el repositorio auditado, la auditoría vigente, el inventario, la arquitectura canónica y la hoja de ruta vigente. La memoria conversacional no sustituye al repositorio.

### PI-07 — No se pierde la perspectiva
El proyecto mantendrá permanentemente:
- 01_AUDITORIA_MAESTRA.md
- 02_ROADMAP_V1.md
- 03_ARCHITECTURE_DECISIONS.md
- 04_CHANGELOG.md

### PI-08 — Las fuentes normativas son la autoridad jurídica
Las decisiones jurídicas se basan en fuentes válidas, conocimiento estructurado y reglas. No se inventan normas, artículos, umbrales ni fuentes.

### PI-09 — Toda decisión normativa debe ser explicable
Toda decisión relevante debe poder mostrar:
- decisión;
- motivo;
- regla aplicada;
- fuente;
- evidencia;
- alternativas;
- riesgos;
- validación necesaria.

### PI-10 — Human in the loop
La secuencia es:
PROPUESTA DEL SISTEMA → JUSTIFICACIÓN → REVISIÓN DEL TÉCNICO → VALIDACIÓN/MODIFICACIÓN/RECHAZO → REGISTRO.

### PI-11 — Las salidas deben ser reales
Un DOCX debe ser DOCX real y editable; un PDF debe ser PDF real; un ZIP debe ser ZIP real. Las extensiones simuladas no cuentan como implementación.

### PI-12 — Los documentos administrativos son el producto final
El modelo debe separar:
DATOS → CONTENIDO → ESTRUCTURA → NUMERACIÓN → FORMATO → EXPORTACIÓN.

Debe poder compararse con los modelos administrativos de referencia.

### PI-13 — Toda tramitación debe ser trazable
Debe poder reconstruirse quién hizo qué, cuándo, por qué, con qué fuente, qué regla se aplicó, qué propuso el sistema, qué modificó el técnico y qué documento se generó.

### PI-14 — La IA es asistencia, no decisión jurídica autónoma
La IA puede analizar, redactar, explicar, revisar y proponer, pero la lógica normativa se fundamenta en fuentes, reglas y conocimiento controlado.

### PI-15 — El recorrido vertical es la prueba de realidad
Debe existir un recorrido funcional:
CREAR → GUARDAR → RECUPERAR → APLICAR REGLA → PROPONER CPV → WORKFLOW → GENERAR MEMORIA → EXPORTAR → AUDITAR.

### PI-16 — La arquitectura cambia con evidencia
Toda modificación arquitectónica debe registrar problema, alternativas, decisión, impacto y migración.

### PI-17 — No se avanza por inercia
Si la auditoría detecta duplicidades, código roto o arquitectura inconsistente, se detiene la expansión y se consolida antes de continuar.

### PI-18 — Primero un MVP vertical real
Antes de intentar cubrir toda la contratación pública debe existir un primer caso de uso completo: expediente + normativa + reglas + CPV + workflow + documentación + exportación + auditoría.

### PI-19 — La cobertura normativa se amplía progresivamente
No se declara cobertura general hasta disponer de corpus suficiente, fuentes vigentes, reglas verificadas, CPV suficiente y pruebas positivas, negativas y límite.

### PI-20 — V1.0 tiene una definición funcional clara
Contrata-IA V1.0 debe:
1. crear expediente;
2. guiar al usuario;
3. recopilar información;
4. analizar;
5. proponer;
6. justificar;
7. mostrar fuentes;
8. permitir validación humana;
9. guardar decisiones;
10. generar documentación;
11. validar documentación;
12. exportar formatos reales;
13. auditar;
14. recuperar el expediente.

## 3. Orden de gobierno

LB-0 CONGELACIÓN Y TRAZABILIDAD
→ LB-1 PROYECTO COMPILABLE
→ LB-2 ARQUITECTURA CANÓNICA
→ LB-3 RECORRIDO VERTICAL
→ LB-4 MOTOR NORMATIVO MVP
→ LB-5 DOCUMENTOS REALES
→ LB-6 API + FRONTEND
→ INTEGRACIÓN IA
→ EXPORTACIÓN REAL
→ LB-7 QA + SEGURIDAD + V1.0
→ PILOTO
→ USO REAL

## 4. Control de cambios

Estos principios solo pueden modificarse mediante una decisión explícita documentada y registrada en:
- 03_ARCHITECTURE_DECISIONS.md
- 04_CHANGELOG.md

## 5. Próximo hito

El siguiente trabajo activo es:

**LB-1 — PROYECTO COMPILABLE**

Objetivo inmediato:
- TYPECHECK = 0 errores
- BUILD = 0 errores

No se iniciarán nuevos grandes motores antes de superar esta puerta, salvo tareas necesarias para reparar la base.

**FIN**
