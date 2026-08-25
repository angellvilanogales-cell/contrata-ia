# ADR-0008 · Coste cero, persistencia externa y reutilización de `main`

Fecha: 2026-08-25
Estado: ACEPTADO PARA PILOTO

## Contexto

El piloto HTTPS de Contrata-IA se ejecuta en Render Free. La prueba real de reinicio confirmó que el filesystem efímero de la instancia no puede considerarse almacenamiento persistente: un expediente adaptativo existente antes del reinicio dejó de estar disponible después del mismo.

El requisito económico del piloto queda fijado como gate arquitectónico: **coste obligatorio de infraestructura = 0 EUR/mes** durante esta fase.

Además, se ha comprobado la relación real entre ramas: `agent/lb7-qa-seguridad-v1` está 1091 commits por delante de `main` y 0 por detrás; el HEAD actual de `main` es el merge-base de la rama. Por tanto, el trabajo histórico de `main` ya forma parte de la historia de la rama actual. No procede hacer un merge o cherry-pick indiscriminado desde `main`; procede auditar y reutilizar de forma explícita los motores heredados que sigan siendo compatibles con la arquitectura canónica y los gates actuales.

## Decisión

### 1. Requisito de coste

Ningún componente necesario para ejecutar el piloto puede requerir un plan de pago. Si una capacidad gratuita deja de ser suficiente, el sistema debe degradar de forma explícita o ofrecer exportación/migración, pero no activar gasto automáticamente.

### 2. Responsabilidades de plataforma

- **GitHub**: fuente maestra de código, reglas, motores, tests, CI, plantillas versionadas y trazabilidad de cambios.
- **Render Free**: cómputo efímero y exposición HTTPS de la aplicación. No es fuente de verdad de expedientes.
- **Supabase Free**: persistencia externa del estado recuperable del piloto. No debe convertirse en dependencia irreversible del dominio.

### 3. Puerto de persistencia

La lógica de dominio y los motores no deben llamar directamente a Supabase. La persistencia externa se conectará mediante un adaptador/puerto de infraestructura, manteniendo la posibilidad de ejecución local basada en filesystem para desarrollo y pruebas.

Objetivo:

```text
Dominio / aplicación
        |
Puerto de persistencia de expedientes
        |
   +----+----------------+
   |                     |
Filesystem local     Supabase remoto
(desarrollo)         (piloto gratuito)
```

### 4. Reutilización de motores heredados

Antes de crear un motor, regla o repositorio nuevo se debe comprobar si existe una implementación heredada útil. En especial se auditarán, como mínimo:

- `CPVEngine`
- `KnowledgeEngine`
- `RuleEngine`
- `PCAPGeneratorEngine`
- motores/document composers
- infraestructura `Repository*` y `PersistenceBootstrap`
- motores de expediente y sincronización canónica

La clasificación será una de estas cuatro:

1. **REUTILIZAR**: compatible y cubierto por tests/gates actuales.
2. **ADAPTAR**: contiene lógica útil pero requiere frontera canónica, trazabilidad o actualización normativa.
3. **REFERENCIA**: útil como conocimiento técnico, no invocable en producción.
4. **DESCARTAR**: duplicado, obsoleto o incompatible con los gates vigentes.

No se reactivará generación legacy ni se rebajarán auditorías para aprovechar código histórico.

### 5. Seguridad de persistencia Supabase

La tabla remota no se expondrá directamente a clientes anónimos. RLS permanecerá activa y los roles públicos no tendrán acceso directo. El acceso del backend se realizará mediante un endpoint servidor-servidor con autenticación específica y sin publicar claves de servicio en el navegador.

### 6. Backup y portabilidad

Supabase Free no se tratará como única copia irrecuperable. Contrata-IA deberá disponer de exportación y restauración propias de expedientes/datos persistentes. El cierre del piloto requerirá prueba real:

1. crear expediente;
2. persistirlo externamente;
3. reiniciar Render;
4. recuperar exactamente el mismo expediente;
5. exportar backup;
6. eliminar/restaurar en entorno de prueba o mediante procedimiento controlado;
7. verificar equivalencia del estado restaurado.

## Consecuencias

- Render puede reiniciarse o perder su disco local sin provocar pérdida del expediente persistido.
- Se mantiene el piloto a coste 0 EUR/mes.
- Supabase queda detrás de una frontera de infraestructura sustituible.
- El trabajo existente en `main` se aprovecha por auditoría, no por copia indiscriminada.
- `main` no se modifica ni se fusiona sin autorización expresa.
