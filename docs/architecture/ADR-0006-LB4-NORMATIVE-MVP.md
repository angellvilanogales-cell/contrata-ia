# ADR-0006 — LB-4 MVP normativo: servicios de limpieza de edificios/oficinas

## Estado
Aceptado para LB-4.

## Decisión
El primer caso de uso normativo validable de Contrata-IA se limita a contratos de servicios de limpieza de edificios/oficinas celebrados por una Administración Pública de la Junta de Andalucía, en tramitación ordinaria.

Quedan fuera del MVP: emergencia, contratos menores, concesiones, prestaciones intelectuales, servicios especiales del Anexo IV y procedimientos excepcionales que requieran presupuestos fácticos no modelados.

## Motivo
Es un caso frecuente en la Administración andaluza, existe documentación administrativa aportada al proyecto y modelos oficiales de PCAP para servicios, y permite validar de forma útil CPV, lotes, procedimiento, SARA, solvencia, garantías, criterios, condiciones especiales de ejecución, subrogación y plazos.

## Regla de seguridad
Ninguna decisión que dependa de hechos no acreditados se convierte en decisión final automática. El motor distingue entre `DETERMINED`, `PROPOSED` y `PENDING_HUMAN_VALIDATION` y siempre devuelve `ruleIds` y `sourceIds`.

Los ejemplos aportados se utilizan como patrones administrativos y evidencia contextual; la autoridad normativa procede de BOE/EUR-Lex/BOJA y fuentes oficiales de la Junta de Andalucía.

## Vigencia
Los umbrales monetarios se versionan. Este paquete usa los umbrales 2026-2027 y debe dejar de considerarse vigente al finalizar 2027 salvo revisión previa.
