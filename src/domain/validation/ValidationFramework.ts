/**
 * ============================================================
 * CONTRATA-IA
 * ------------------------------------------------------------
 * ValidationFramework
 * ------------------------------------------------------------
 *
 * Framework genérico de validaciones.
 *
 * Este componente NO contiene normativa.
 *
 * No conoce la LCSP.
 *
 * No conoce contratos.
 *
 * Su única misión consiste en ejecutar validadores y
 * devolver los errores encontrados.
 * ============================================================
 */

export enum ValidationSeverity {

    INFO = "INFO",

    WARNING = "WARNING",

    ERROR = "ERROR"

}

/**
 * Resultado individual.
 */
export interface ValidationIssue {

    code: string;

    message: string;

    severity: ValidationSeverity;

    source?: string;

}

/**
 * Resultado global.
 */
export interface ValidationResult {

    valid: boolean;

    issues: ValidationIssue[];

}

/**
 * Contrato de cualquier validador.
 */
export interface Validator<T = unknown> {

    /**
     * Nombre.
     */
    readonly name: string;

    /**
     * Ejecuta la validación.
     */
    validate(

        value: T

    ): ValidationIssue[];

}

/**
 * ============================================================
 * ValidationFramework
 * ============================================================
 */

export class ValidationFramework {

    /**
     * Validadores registrados.
     */
    private readonly validators:

        Validator[] = [];

    /**
     * Registro.
     */
    public register(

        validator: Validator

    ): void {

        this.validators.push(

            validator

        );

    }

    /**
     * Eliminación.
     */
    public unregister(

        name: string

    ): void {

        const index =

            this.validators.findIndex(

                validator =>

                    validator.name === name

            );

        if (index >= 0) {

            this.validators.splice(

                index,

                1

            );

        }

    }

    /**
     * Número de validadores.
     */
    public count(): number {

        return this.validators.length;

    }

    /**
     * Lista.
     */
    public registered():

        string[] {

        return this.validators.map(

            validator =>

                validator.name

        );

    }


      /**
     * =====================================================
     * EJECUCIÓN DE VALIDACIONES
     * =====================================================
     */

    public validate<T>(

        value: T

    ): ValidationResult {

        const issues: ValidationIssue[] = [];

        for (

            const validator of

            this.validators

        ) {

            try {

                const result =

                    validator.validate(

                        value

                    );

                if (

                    result.length > 0

                ) {

                    issues.push(

                        ...result

                    );

                }

            }

            catch (error) {

                issues.push({

                    code: "VALIDATOR_EXCEPTION",

                    message:

                        error instanceof Error

                            ? error.message

                            : "Error desconocido.",

                    severity:

                        ValidationSeverity.ERROR,

                    source:

                        validator.name

                });

            }

        }

        return {

            valid:

                !issues.some(

                    issue =>

                        issue.severity ===

                        ValidationSeverity.ERROR

                ),

            issues

        };

    }

    /**
     * =====================================================
     * VALIDAR UN ÚNICO VALIDADOR
     * =====================================================
     */

    public validateWith<T>(

        validatorName: string,

        value: T

    ): ValidationIssue[] {

        const validator =

            this.validators.find(

                v =>

                    v.name === validatorName

            );

        if (!validator) {

            return [

                {

                    code: "VALIDATOR_NOT_FOUND",

                    message:

                        `No existe el validador '${validatorName}'.`,

                    severity:

                        ValidationSeverity.ERROR,

                    source:

                        validatorName

                }

            ];

        }

        try {

            return validator.validate(

                value

            );

        }

        catch (error) {

            return [

                {

                    code: "VALIDATOR_EXCEPTION",

                    message:

                        error instanceof Error

                            ? error.message

                            : "Error desconocido.",

                    severity:

                        ValidationSeverity.ERROR,

                    source:

                        validator.name

                }

            ];

        }

    }

    /**
     * =====================================================
     * EXISTE VALIDADOR
     * =====================================================
     */

    public exists(

        validatorName: string

    ): boolean {

        return this.validators.some(

            validator =>

                validator.name ===

                validatorName

        );

    }

    /**
     * =====================================================
     * OBTENER VALIDADOR
     * =====================================================
     */

    public get(

        validatorName: string

    ): Validator | undefined {

        return this.validators.find(

            validator =>

                validator.name ===

                validatorName

        );

    }

    /**
     * =====================================================
     * LIMPIAR REGISTRO
     * =====================================================
     */

    public clear(): void {

        this.validators.length = 0;

    }

      /**
     * =====================================================
     * FILTRAR INCIDENCIAS POR SEVERIDAD
     * =====================================================
     */

    public filterBySeverity(

        result: ValidationResult,

        severity: ValidationSeverity

    ): ValidationIssue[] {

        return result.issues.filter(

            issue =>

                issue.severity === severity

        );

    }

    /**
     * =====================================================
     * ERRORES
     * =====================================================
     */

    public errors(

        result: ValidationResult

    ): ValidationIssue[] {

        return this.filterBySeverity(

            result,

            ValidationSeverity.ERROR

        );

    }

    /**
     * =====================================================
     * AVISOS
     * =====================================================
     */

    public warnings(

        result: ValidationResult

    ): ValidationIssue[] {

        return this.filterBySeverity(

            result,

            ValidationSeverity.WARNING

        );

    }

    /**
     * =====================================================
     * INFORMACIÓN
     * =====================================================
     */

    public infoMessages(

        result: ValidationResult

    ): ValidationIssue[] {

        return this.filterBySeverity(

            result,

            ValidationSeverity.INFO

        );

    }

    /**
     * =====================================================
     * RESUMEN
     * =====================================================
     */

    public summary(

        result: ValidationResult

    ) {

        return {

            valid:

                result.valid,

            totalIssues:

                result.issues.length,

            errors:

                this.errors(result).length,

            warnings:

                this.warnings(result).length,

            info:

                this.infoMessages(result).length

        };

    }

    /**
     * =====================================================
     * ESTADÍSTICAS
     * =====================================================
     */

    public statistics(

        result: ValidationResult

    ) {

        const bySource =

            new Map<

                string,

                number

            >();

        for (

            const issue of

            result.issues

        ) {

            const source =

                issue.source ??

                "UNKNOWN";

            bySource.set(

                source,

                (

                    bySource.get(

                        source

                    ) ?? 0

                ) + 1

            );

        }

        return {

            summary:

                this.summary(

                    result

                ),

            bySource:

                Object.fromEntries(

                    bySource

                )

        };

    }

    /**
     * =====================================================
     * DIAGNÓSTICO
     * =====================================================
     */

    public diagnostics(

        result: ValidationResult

    ) {

        return {

            registeredValidators:

                this.validators.length,

            executedValidators:

                this.validators.length,

            statistics:

                this.statistics(

                    result

                ),

            validatorNames:

                this.registered()

        };

    }

    /**
     * =====================================================
     * EXPORTACIÓN
     * =====================================================
     */

    public export(

        result: ValidationResult

    ) {

        return {

            diagnostics:

                this.diagnostics(

                    result

                ),

            issues:

                result.issues

        };

    }

      /**
     * =====================================================
     * VALIDACIÓN EN LOTE
     * =====================================================
     */

    public validateAll<T>(

        values: T[]

    ): ValidationResult[] {

        return values.map(

            value =>

                this.validate(value)

        );

    }

    /**
     * =====================================================
     * COMBINAR RESULTADOS
     * =====================================================
     */

    public merge(

        ...results: ValidationResult[]

    ): ValidationResult {

        const issues: ValidationIssue[] = [];

        for (

            const result of results

        ) {

            issues.push(

                ...result.issues

            );

        }

        return {

            valid:

                !issues.some(

                    issue =>

                        issue.severity ===

                        ValidationSeverity.ERROR

                ),

            issues

        };

    }

    /**
     * =====================================================
     * ELIMINAR DUPLICADOS
     * =====================================================
     */

    public removeDuplicates(

        result: ValidationResult

    ): ValidationResult {

        const map =

            new Map<

                string,

                ValidationIssue

            >();

        for (

            const issue of

            result.issues

        ) {

            const key =

                `${issue.code}|${issue.message}|${issue.source}`;

            if (!map.has(key)) {

                map.set(

                    key,

                    issue

                );

            }

        }

        return {

            valid:

                result.valid,

            issues:

                Array.from(

                    map.values()

                )

        };

    }

    /**
     * =====================================================
     * ORDENAR INCIDENCIAS
     * =====================================================
     */

    public sort(

        result: ValidationResult

    ): ValidationResult {

        const priority = {

            [ValidationSeverity.ERROR]: 0,

            [ValidationSeverity.WARNING]: 1,

            [ValidationSeverity.INFO]: 2

        };

        return {

            valid:

                result.valid,

            issues:

                [...result.issues].sort(

                    (a, b) =>

                        priority[a.severity] -

                        priority[b.severity]

                )

        };

    }

    /**
     * =====================================================
     * NORMALIZACIÓN
     * =====================================================
     */

    public normalize(

        result: ValidationResult

    ): ValidationResult {

        return this.sort(

            this.removeDuplicates(

                result

            )

        );

    }

    /**
     * =====================================================
     * BÚSQUEDA POR CÓDIGO
     * =====================================================
     */

    public findByCode(

        result: ValidationResult,

        code: string

    ): ValidationIssue[] {

        return result.issues.filter(

            issue =>

                issue.code === code

        );

    }

    /**
     * =====================================================
     * COMPROBAR EXISTENCIA
     * =====================================================
     */

    public contains(

        result: ValidationResult,

        code: string

    ): boolean {

        return this.findByCode(

            result,

            code

        ).length > 0;

    }

      /**
     * =====================================================
     * HEALTH CHECK
     * =====================================================
     */

    public health() {

        return {

            healthy: true,

            registeredValidators:

                this.validators.length,

            validatorNames:

                this.registered()

        };

    }

    /**
     * =====================================================
     * FACTORÍA POR DEFECTO
     * =====================================================
     */

    public static createDefault():

        ValidationFramework {

        const framework =

            new ValidationFramework();

        /**
         * Aquí se registrarán automáticamente
         * todos los validadores del sistema.
         *
         * Ejemplo:
         *
         * framework.register(
         *      new ProcedureValidator()
         * );
         *
         * framework.register(
         *      new CPVValidator()
         * );
         *
         * framework.register(
         *      new BudgetValidator()
         * );
         */

        return framework;

    }

    /**
     * =====================================================
     * INFORMACIÓN
     * =====================================================
     */

    public info() {

        return {

            version:

                this.version(),

            registeredValidators:

                this.validators.length,

            validatorNames:

                this.registered(),

            health:

                this.health()

        };

    }

    /**
     * =====================================================
     * SERIALIZACIÓN
     * =====================================================
     */

    public toJSON(): string {

        return JSON.stringify(

            this.info(),

            null,

            4

        );

    }

    /**
     * =====================================================
     * VERSIÓN
     * =====================================================
     */

    public version(): string {

        return "1.0.0";

    }

}
