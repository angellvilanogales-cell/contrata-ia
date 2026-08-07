# ADR-0007 — Entrada dual del expediente en LB-6

## Estado
Aceptada para LB-6.

## Decisión
Contrata-IA tendrá dos vías principales de entrada y una combinación híbrida, todas sobre el mismo modelo de expediente:

1. Asistente guiado: formula solo la siguiente pregunta necesaria según datos ya conocidos, reglas normativas y dependencias entre respuestas.
2. Ficha de Datos del Expediente: documento editable que reúne todas las preguntas del caso de uso, permite cumplimentación fuera del aplicativo y posterior importación.
3. Modo híbrido: permite descargar una ficha parcialmente cumplimentada, completarla fuera del sistema, volver a importarla y continuar únicamente con las preguntas pendientes.

Las tres vías producen el mismo `IntakeCase`, nunca modelos paralelos.

## Principios
- Preguntar lo mínimo necesario en conversación no implica ocultar el cuestionario completo: la Ficha debe permitir ver todas las preguntas posibles.
- Una respuesta importada tiene la misma trazabilidad que una respuesta introducida en interfaz.
- El sistema distingue dato aportado, dato inferido/propuesto y decisión validada.
- Ninguna propuesta jurídica se considera decisión final hasta validación humana expresa.
- La importación de una ficha no puede convertir silenciosamente campos vacíos, ambiguos o contradictorios en hechos.
- El usuario puede cambiar la ubicación documental de bloques como Necesidad e Idoneidad o Insuficiencia de Medios entre Memoria e informe independiente sin duplicación.

## Consecuencia
LB-6 debe exponer API e interfaz para crear, consultar, actualizar, importar, validar y generar expedientes, además de descargar una Ficha de Datos del Expediente editable y reimportarla.
