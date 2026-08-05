/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * AI MANAGER
 *
 * Motor central de Inteligencia Artificial.
 *
 * Ningún módulo accede directamente a OpenAI,
 * Gemini, Claude u Ollama.
 *
 * Todo pasa por este componente.
 *
 ******************************************************************************/

import { UUID } from "../../domain/common/types";

import {

    AIProvider,

    AIProviderRequest,

    AIProviderResponse

} from "./AIProvider";

import {

    ProviderRegistry

} from "./providers/ProviderRegistry";

import {

    ProviderHealth

} from "./providers/ProviderHealth";


/*===========================================================================
=
= ESTADOS
=
===========================================================================*/

export enum AIManagerStatus{

    CREATED="CREATED",

    INITIALIZING="INITIALIZING",

    READY="READY",

    BUSY="BUSY",

    PAUSED="PAUSED",

    ERROR="ERROR",

    DISPOSED="DISPOSED"

}


/*===========================================================================
=
= MODOS
=
===========================================================================*/

export enum AIExecutionMode{

    FAST="FAST",

    NORMAL="NORMAL",

    QUALITY="QUALITY",

    LOCAL_ONLY="LOCAL_ONLY",

    REMOTE_ONLY="REMOTE_ONLY"

}


/*===========================================================================
=
= PRIORIDAD
=
===========================================================================*/

export enum AIRequestPriority{

    LOW=1,

    NORMAL=5,

    HIGH=10,

    CRITICAL=100

}


/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

export interface AIManagerConfiguration{

    executionMode:AIExecutionMode;

    defaultTimeout:number;

    maximumRetries:number;

    enableCache:boolean;

    enableStatistics:boolean;

    enableAudit:boolean;

    enableLoadBalancing:boolean;

    enableHealthMonitor:boolean;

}


/*===========================================================================
=
= PETICIÓN
=
===========================================================================*/

export interface AIExecutionRequest{

    id:UUID;

    priority:AIRequestPriority;

    provider?:string;

    request:AIProviderRequest;

}


/*===========================================================================
=
= RESPUESTA
=
===========================================================================*/

export interface AIExecutionResult{

    id:UUID;

    provider:string;

    response:AIProviderResponse;

    executionMilliseconds:number;

}


/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

export interface AIManagerStatistics{

    executedRequests:number;

    failedRequests:number;

    cachedRequests:number;

    averageMilliseconds:number;

    totalMilliseconds:number;

}


/*===========================================================================
=
= AI MANAGER
=
===========================================================================*/

export class AIManager{

    private status=

        AIManagerStatus.CREATED;

    private readonly registry:

        ProviderRegistry;

    private readonly health:

        ProviderHealth;

    private configuration:

        AIManagerConfiguration;

    private statistics:

        AIManagerStatistics;

    private initialized=false;

    private paused=false;

    private disposed=false;

    constructor(

        registry:ProviderRegistry,

        health:ProviderHealth,

        configuration?:

        Partial<AIManagerConfiguration>

    ){

        this.registry=registry;

        this.health=health;

        this.configuration={

            executionMode:

                AIExecutionMode.NORMAL,

            defaultTimeout:120000,

            maximumRetries:3,

            enableCache:true,

            enableStatistics:true,

            enableAudit:true,

            enableLoadBalancing:true,

            enableHealthMonitor:true,

            ...configuration

        };

        this.statistics={

            executedRequests:0,

            failedRequests:0,

            cachedRequests:0,

            averageMilliseconds:0,

            totalMilliseconds:0

        };

    }

/*===========================================================================
=
= INICIALIZACIÓN
=
===========================================================================*/

public async initialize()

    : Promise<void> {

    if (

        this.initialized

    ) {

        return;

    }

    this.status =

        AIManagerStatus.INITIALIZING;

    if (

        this.configuration.enableHealthMonitor

    ) {

        await this.health.checkAll();

    }

    this.initialized = true;

    this.status =

        AIManagerStatus.READY;

}


/*===========================================================================
=
= ESTADO
=
===========================================================================*/

public getStatus()

    : AIManagerStatus {

    return this.status;

}

public isReady()

    : boolean {

    return (

        this.status ===

        AIManagerStatus.READY

    );

}

public isBusy()

    : boolean {

    return (

        this.status ===

        AIManagerStatus.BUSY

    );

}


/*===========================================================================
=
= EJECUCIÓN PRINCIPAL
=
===========================================================================*/

public async execute(

    request: AIExecutionRequest

)

    : Promise<AIExecutionResult> {

    if (

        !this.initialized

    ) {

        await this.initialize();

    }

    if (

        this.disposed

    ) {

        throw new Error(

            "AIManager disposed."

        );

    }

    while (

        this.paused

    ) {

        await this.sleep(

            100

        );

    }

    this.status =

        AIManagerStatus.BUSY;

    const start =

        performance.now();

    try {

        const provider =

            this.selectProvider(

                request

            );

        const response =

            await this.executeProvider(

                provider,

                request.request

            );

        const elapsed =

            performance.now() - start;

        this.updateStatistics(

            elapsed,

            true

        );

        this.status =

            AIManagerStatus.READY;

        return {

            id:

                request.id,

            provider:

                provider.id,

            response,

            executionMilliseconds:

                elapsed

        };

    }

    catch (

        error

    ) {

        const elapsed =

            performance.now() - start;

        this.updateStatistics(

            elapsed,

            false

        );

        this.status =

            AIManagerStatus.ERROR;

        throw error;

    }

}


/*===========================================================================
=
= EJECUCIÓN DEL PROVEEDOR
=
===========================================================================*/

private async executeProvider(

    provider: AIProvider,

    request: AIProviderRequest

)

    : Promise<AIProviderResponse> {

    return await provider.generate(

        request

    );

}


/*===========================================================================
=
= SELECCIÓN DEL PROVEEDOR
=
===========================================================================*/

private selectProvider(

    request: AIExecutionRequest

)

    : AIProvider {

    if (

        request.provider

    ) {

        return this.registry.get(

            request.provider

        );

    }

    if (

        this.configuration.enableLoadBalancing

    ) {

        return this.health.getBestProvider();

    }

    return this.registry.getDefault();

}


/*===========================================================================
=
= PAUSA
=
===========================================================================*/

public pause()

    : void {

    this.paused = true;

    this.status =

        AIManagerStatus.PAUSED;

}


/*===========================================================================
=
= REANUDAR
=
===========================================================================*/

public resume()

    : void {

    this.paused = false;

    this.status =

        AIManagerStatus.READY;

}


/*===========================================================================
=
= DESTRUIR
=
===========================================================================*/

public dispose()

    : void {

    this.disposed = true;

    this.initialized = false;

    this.status =

        AIManagerStatus.DISPOSED;

}

/*===========================================================================
=
= TIMEOUT
=
===========================================================================*/

private async executeWithTimeout(

    provider: AIProvider,

    request: AIProviderRequest

): Promise<AIProviderResponse> {

    return await Promise.race([

        provider.generate(

            request

        ),

        this.timeoutPromise(

            this.configuration.defaultTimeout

        )

    ]);

}

private timeoutPromise(

    milliseconds:number

):Promise<never>{

    return new Promise(

        (

            _,

            reject

        )=>

            setTimeout(

                ()=>

                    reject(

                        new Error(

                            `Timeout after ${milliseconds} ms`

                        )

                    ),

                milliseconds

            )

    );

}


/*===========================================================================
=
= REINTENTOS
=
===========================================================================*/

private async executeWithRetry(

    provider:AIProvider,

    request:AIProviderRequest

):Promise<AIProviderResponse>{

    let lastError:unknown;

    for(

        let attempt=1;

        attempt<=

        this.configuration.maximumRetries;

        attempt++

    ){

        try{

            return await this.executeWithTimeout(

                provider,

                request

            );

        }

        catch(

            error

        ){

            lastError=error;

            this.log(

                `Retry ${attempt}/${this.configuration.maximumRetries}`

            );

            if(

                attempt<

                this.configuration.maximumRetries

            ){

                await this.sleep(

                    attempt*1000

                );

            }

        }

    }

    throw lastError;

}


/*===========================================================================
=
= CANCELACIÓN
=
===========================================================================*/

private cancelled=false;

public cancelCurrentExecution()

    :void{

    this.cancelled=true;

}

private checkCancellation()

    :void{

    if(

        this.cancelled

    ){

        throw new Error(

            "Execution cancelled."

        );

    }

}


/*===========================================================================
=
= EJECUCIÓN SEGURA
=
===========================================================================*/

private async executeSafely(

    provider:AIProvider,

    request:AIProviderRequest

):Promise<AIProviderResponse>{

    this.checkCancellation();

    try{

        return await this.executeWithRetry(

            provider,

            request

        );

    }

    finally{

        this.cancelled=false;

    }

}


/*===========================================================================
=
= GESTIÓN CENTRALIZADA DE ERRORES
=
===========================================================================*/

private handleExecutionError(

    provider:AIProvider,

    error:unknown

):never{

    this.status=

        AIManagerStatus.ERROR;

    this.health.registerFailure?.(

        provider.id

    );

    this.log(

        `Provider ${provider.id} failed.`

    );

    throw error;

}


/*===========================================================================
=
= EJECUCIÓN RESILIENTE
=
===========================================================================*/

private async resilientExecution(

    provider:AIProvider,

    request:AIProviderRequest

):Promise<AIProviderResponse>{

    try{

        return await this.executeSafely(

            provider,

            request

        );

    }

    catch(

        error

    ){

        return this.tryFallbackProvider(

            provider,

            request,

            error

        );

    }

}


/*===========================================================================
=
= FALLBACK
=
===========================================================================*/

private async tryFallbackProvider(

    failedProvider:AIProvider,

    request:AIProviderRequest,

    originalError:unknown

):Promise<AIProviderResponse>{

    const candidates=

        this.health

            .getAvailableProviders()

            .filter(

                provider=>

                    provider.id!==

                    failedProvider.id

            );

    if(

        candidates.length===0

    ){

        this.handleExecutionError(

            failedProvider,

            originalError

        );

    }

    this.log(

        `Fallback -> ${candidates[0].id}`

    );

    return await this.executeSafely(

        candidates[0],

        request

    );

}


/*===========================================================================
=
= UTILIDADES
=
===========================================================================*/

private sleep(

    milliseconds:number

):Promise<void>{

    return new Promise(

        resolve=>

            setTimeout(

                resolve,

                milliseconds

            )

    );

}

private log(

    message:string

):void{

    console.log(

        `[AIManager] ${message}`

    );

}

/*===========================================================================
=
= COLA INTERNA DE PETICIONES
=
===========================================================================*/

private readonly requestQueue:

    AIExecutionRequest[]=[];

private readonly runningRequests:

    Map<UUID,Promise<AIExecutionResult>>=

        new Map();

private maximumConcurrentRequests=5;

private currentConcurrentRequests=0;


/*===========================================================================
=
= ENCOLAR PETICIÓN
=
===========================================================================*/

public enqueue(

    request:AIExecutionRequest

):void{

    this.requestQueue.push(

        request

    );

    this.sortQueue();

}


/*===========================================================================
=
= ORDENACIÓN POR PRIORIDAD
=
===========================================================================*/

private sortQueue()

    :void{

    this.requestQueue.sort(

        (

            left,

            right

        )=>

            right.priority-left.priority

    );

}


/*===========================================================================
=
= EJECUCIÓN DE LA COLA
=
===========================================================================*/

public async processQueue()

    :Promise<void>{

    while(

        this.requestQueue.length>0

    ){

        if(

            this.currentConcurrentRequests>=

            this.maximumConcurrentRequests

        ){

            await this.sleep(

                50

            );

            continue;

        }

        const request=

            this.requestQueue.shift()!;

        this.dispatchRequest(

            request

        );

    }

}


/*===========================================================================
=
= DISPATCH
=
===========================================================================*/

private async dispatchRequest(

    request:AIExecutionRequest

):Promise<void>{

    this.currentConcurrentRequests++;

    const promise=

        this.execute(

            request

        );

    this.runningRequests.set(

        request.id,

        promise

    );

    try{

        await promise;

    }

    finally{

        this.runningRequests.delete(

            request.id

        );

        this.currentConcurrentRequests--;

    }

}


/*===========================================================================
=
= CANCELACIÓN DE PETICIONES
=
===========================================================================*/

public clearQueue()

    :void{

    this.requestQueue.length=0;

}

public queuedRequests()

    :number{

    return this.requestQueue.length;

}

public runningCount()

    :number{

    return this.runningRequests.size;

}


/*===========================================================================
=
= ESPERAR FINALIZACIÓN
=
===========================================================================*/

public async waitUntilIdle()

    :Promise<void>{

    while(

        this.requestQueue.length>0 ||

        this.runningRequests.size>0

    ){

        await this.sleep(

            100

        );

    }

}


/*===========================================================================
=
= CONFIGURACIÓN DE CONCURRENCIA
=
===========================================================================*/

public setMaximumConcurrency(

    maximum:number

):void{

    if(

        maximum<1

    ){

        maximum=1;

    }

    this.maximumConcurrentRequests=

        maximum;

}

public getMaximumConcurrency()

    :number{

    return this.maximumConcurrentRequests;

}


/*===========================================================================
=
= INFORMACIÓN DE LA COLA
=
===========================================================================*/

public getQueueInformation(){

    return{

        queued:

            this.requestQueue.length,

        running:

            this.runningRequests.size,

        concurrent:

            this.currentConcurrentRequests,

        maximum:

            this.maximumConcurrentRequests

    };

}


/*===========================================================================
=
= PETICIONES ACTIVAS
=
===========================================================================*/

public getRunningRequests()

    :ReadonlyArray<UUID>{

    return Object.freeze(

        [

            ...this.runningRequests.keys()

        ]

    );

}


/*===========================================================================
=
= MÉTRICAS DE CARGA
=
===========================================================================*/

private calculateLoad()

    :number{

    if(

        this.maximumConcurrentRequests===0

    ){

        return 0;

    }

    return(

        this.currentConcurrentRequests

        /

        this.maximumConcurrentRequests

    )*100;

}


/*===========================================================================
=
= AUTOBALANCEO
=
===========================================================================*/

private shouldThrottle()

    :boolean{

    return(

        this.calculateLoad()>90

    );

}

private async throttle()

    :Promise<void>{

    while(

        this.shouldThrottle()

    ){

        await this.sleep(

            100

        );

    }

}

/*===========================================================================
=
= SISTEMA DE CACHE
=
===========================================================================*/

private readonly responseCache =

    new Map<string, AIProviderResponse>();

private readonly cacheTimestamps =

    new Map<string, number>();

private cacheEnabled = true;

private cacheTTL = 300000; // 5 minutos

private cacheHits = 0;

private cacheMisses = 0;


/*===========================================================================
=
= CLAVE DEL CACHE
=
===========================================================================*/

private buildCacheKey(

    request: AIProviderRequest

): string {

    return JSON.stringify({

        provider:

            request.provider,

        model:

            request.model,

        prompt:

            request.prompt,

        temperature:

            request.temperature,

        maxTokens:

            request.maxTokens

    });

}


/*===========================================================================
=
= OBTENER CACHE
=
===========================================================================*/

private getCachedResponse(

    request: AIProviderRequest

): AIProviderResponse | undefined {

    if (

        !this.cacheEnabled

    ) {

        return undefined;

    }

    const key =

        this.buildCacheKey(

            request

        );

    const timestamp =

        this.cacheTimestamps.get(

            key

        );

    if (

        timestamp === undefined

    ) {

        this.cacheMisses++;

        return undefined;

    }

    if (

        Date.now() - timestamp >

        this.cacheTTL

    ) {

        this.responseCache.delete(

            key

        );

        this.cacheTimestamps.delete(

            key

        );

        this.cacheMisses++;

        return undefined;

    }

    this.cacheHits++;

    return this.responseCache.get(

        key

    );

}


/*===========================================================================
=
= ALMACENAR CACHE
=
===========================================================================*/

private saveCachedResponse(

    request: AIProviderRequest,

    response: AIProviderResponse

): void {

    if (

        !this.cacheEnabled

    ) {

        return;

    }

    const key =

        this.buildCacheKey(

            request

        );

    this.responseCache.set(

        key,

        response

    );

    this.cacheTimestamps.set(

        key,

        Date.now()

    );

}


/*===========================================================================
=
= LIMPIAR CACHE
=
===========================================================================*/

public clearCache()

    : void {

    this.responseCache.clear();

    this.cacheTimestamps.clear();

}


/*===========================================================================
=
= CONFIGURACIÓN
=
===========================================================================*/

public enableCache()

    : void {

    this.cacheEnabled = true;

}

public disableCache()

    : void {

    this.cacheEnabled = false;

}

public setCacheTTL(

    milliseconds:number

):void{

    this.cacheTTL =

        milliseconds;

}


/*===========================================================================
=
= ESTADÍSTICAS CACHE
=
===========================================================================*/

public getCacheStatistics(){

    const total =

        this.cacheHits +

        this.cacheMisses;

    return {

        enabled:

            this.cacheEnabled,

        entries:

            this.responseCache.size,

        hits:

            this.cacheHits,

        misses:

            this.cacheMisses,

        hitRate:

            total === 0

                ? 0

                :

                (

                    this.cacheHits /

                    total

                ) * 100,

        ttl:

            this.cacheTTL

    };

}


/*===========================================================================
=
= EJECUCIÓN CON CACHE
=
===========================================================================*/

private async executeUsingCache(

    provider: AIProvider,

    request: AIProviderRequest

): Promise<AIProviderResponse> {

    const cached =

        this.getCachedResponse(

            request

        );

    if (

        cached

    ) {

        return cached;

    }

    const response =

        await this.resilientExecution(

            provider,

            request

        );

    this.saveCachedResponse(

        request,

        response

    );

    return response;

}


/*===========================================================================
=
= LIMPIEZA AUTOMÁTICA
=
===========================================================================*/

private purgeExpiredCache()

    : void {

    const now =

        Date.now();

    for (

        const [

            key,

            timestamp

        ]

        of this.cacheTimestamps

    ) {

        if (

            now - timestamp >

            this.cacheTTL

        ) {

            this.cacheTimestamps.delete(

                key

            );

            this.responseCache.delete(

                key

            );

        }

    }

}


/*===========================================================================
=
= MANTENIMIENTO
=
===========================================================================*/

private performMaintenance()

    : void {

    this.purgeExpiredCache();

}


/*===========================================================================
=
= INFORMACIÓN
=
===========================================================================*/

public cacheInformation(){

    return {

        size:

            this.responseCache.size,

        enabled:

            this.cacheEnabled,

        ttl:

            this.cacheTTL

    };

}

/*===========================================================================
=
= STREAMING
=
===========================================================================*/

private streamingEnabled=true;

private activeStreams=

    new Map<UUID,ReadableStream<string>>();

public enableStreaming()

    :void{

    this.streamingEnabled=true;

}

public disableStreaming()

    :void{

    this.streamingEnabled=false;

}

public isStreamingEnabled()

    :boolean{

    return this.streamingEnabled;

}


/*===========================================================================
=
= EJECUCIÓN STREAMING
=
===========================================================================*/

private async executeStreaming(

    provider:AIProvider,

    request:AIProviderRequest,

    executionId:UUID

):Promise<ReadableStream<string>>{

    if(

        !provider.stream

    ){

        throw new Error(

            "Provider does not support streaming."

        );

    }

    const stream=

        await provider.stream(

            request

        );

    this.activeStreams.set(

        executionId,

        stream

    );

    return stream;

}


/*===========================================================================
=
= FINALIZAR STREAM
=
===========================================================================*/

private closeStream(

    executionId:UUID

):void{

    this.activeStreams.delete(

        executionId

    );

}

public getActiveStreams()

    :ReadonlyArray<UUID>{

    return Object.freeze(

        [

            ...this.activeStreams.keys()

        ]

    );

}


/*===========================================================================
=
= EVENTOS DEL AI MANAGER
=
===========================================================================*/

export enum AIManagerEvent{

    REQUEST_CREATED="REQUEST_CREATED",

    REQUEST_STARTED="REQUEST_STARTED",

    REQUEST_FINISHED="REQUEST_FINISHED",

    REQUEST_FAILED="REQUEST_FAILED",

    PROVIDER_SELECTED="PROVIDER_SELECTED",

    PROVIDER_FAILED="PROVIDER_FAILED",

    CACHE_HIT="CACHE_HIT",

    CACHE_MISS="CACHE_MISS",

    STREAM_STARTED="STREAM_STARTED",

    STREAM_FINISHED="STREAM_FINISHED"

}

export interface AIManagerEventRecord{

    id:UUID;

    timestamp:string;

    type:AIManagerEvent;

    provider?:string;

    requestId?:UUID;

    details?:unknown;

}


/*===========================================================================
=
= HISTORIAL DE EVENTOS
=
===========================================================================*/

private readonly eventHistory:

    AIManagerEventRecord[]=[];

private emitEvent(

    type:AIManagerEvent,

    details?:unknown,

    provider?:string,

    requestId?:UUID

):void{

    this.eventHistory.push({

        id:

            crypto.randomUUID() as UUID,

        timestamp:

            new Date().toISOString(),

        type,

        provider,

        requestId,

        details

    });

}


/*===========================================================================
=
= CONSULTA DE EVENTOS
=
===========================================================================*/

public getEventHistory()

    :ReadonlyArray<AIManagerEventRecord>{

    return Object.freeze(

        [

            ...this.eventHistory

        ]

    );

}

public clearEvents()

    :void{

    this.eventHistory.length=0;

}


/*===========================================================================
=
= OBSERVADORES
=
===========================================================================*/

export interface AIManagerObserver{

    onEvent?(

        event:AIManagerEventRecord

    ):Promise<void>;

}

private readonly managerObservers:

    AIManagerObserver[]=[];

public registerObserver(

    observer:AIManagerObserver

):void{

    this.managerObservers.push(

        observer

    );

}

public unregisterObserver(

    observer:AIManagerObserver

):void{

    const index=

        this.managerObservers.indexOf(

            observer

        );

    if(

        index>=0

    ){

        this.managerObservers.splice(

            index,

            1

        );

    }

}


/*===========================================================================
=
= NOTIFICACIÓN
=
===========================================================================*/

private async notifyObservers(

    event:AIManagerEventRecord

):Promise<void>{

    for(

        const observer

        of this.managerObservers

    ){

        await observer.onEvent?.(

            event

        );

    }

}


/*===========================================================================
=
= AUDITORÍA IA
=
===========================================================================*/

export interface AIAuditRecord{

    id:UUID;

    timestamp:string;

    provider:string;

    model:string;

    executionMilliseconds:number;

    success:boolean;

    promptTokens:number;

    completionTokens:number;

    totalTokens:number;

}

private readonly audit:

    AIAuditRecord[]=[];

private registerAudit(

    record:AIAuditRecord

):void{

    this.audit.push(

        record

    );

}

public getAudit()

    :ReadonlyArray<AIAuditRecord>{

    return Object.freeze(

        [

            ...this.audit

        ]

    );

}


/*===========================================================================
=
= OBSERVABILIDAD
=
===========================================================================*/

public buildObservabilityReport(){

    return{

        status:

            this.status,

        providers:

            this.registry.list(),

        cache:

            this.getCacheStatistics(),

        queue:

            this.getQueueInformation(),

        running:

            this.runningCount(),

        streams:

            this.activeStreams.size,

        events:

            this.eventHistory.length,

        audit:

            this.audit.length

    };

}

/*===========================================================================
=
= AUTODIAGNÓSTICO
=
===========================================================================*/

private diagnosticsEnabled = true;

private lastHealthCheck?: Date;

private readonly diagnostics = {

    executions: 0,

    successful: 0,

    failed: 0,

    restartedProviders: 0,

    maintenanceCycles: 0

};


/*===========================================================================
=
= HEALTH CHECK GLOBAL
=
===========================================================================*/

public async healthCheck()

    : Promise<boolean> {

    this.lastHealthCheck =

        new Date();

    const providers =

        this.health.getAvailableProviders();

    if (

        providers.length === 0

    ) {

        this.status =

            AIManagerStatus.ERROR;

        return false;

    }

    this.status =

        AIManagerStatus.READY;

    return true;

}


/*===========================================================================
=
= MANTENIMIENTO
=
===========================================================================*/

public async maintenance()

    : Promise<void> {

    this.performMaintenance();

    await this.health.checkAll();

    this.diagnostics.maintenanceCycles++;

}


/*===========================================================================
=
= RECUPERACIÓN AUTOMÁTICA
=
===========================================================================*/

public async recover()

    : Promise<void> {

    this.log(

        "Recovering AIManager..."

    );

    this.clearQueue();

    this.clearEvents();

    this.clearCache();

    this.currentConcurrentRequests = 0;

    this.cancelled = false;

    this.paused = false;

    this.status =

        AIManagerStatus.INITIALIZING;

    await this.initialize();

}


/*===========================================================================
=
= REINICIO DE PROVEEDORES
=
===========================================================================*/

public async restartProviders()

    : Promise<void> {

    for (

        const provider

        of this.registry.list()

    ) {

        if (

            provider.initialize

        ) {

            await provider.initialize();

        }

    }

    this.diagnostics.restartedProviders++;

}


/*===========================================================================
=
= CONTROL DE MEMORIA
=
===========================================================================*/

private optimizeMemory()

    : void {

    if (

        this.eventHistory.length > 5000

    ) {

        this.eventHistory.splice(

            0,

            2500

        );

    }

    if (

        this.audit.length > 5000

    ) {

        this.audit.splice(

            0,

            2500

        );

    }

}


/*===========================================================================
=
= ESTADÍSTICAS
=
===========================================================================*/

private registerSuccessfulExecution()

    : void {

    this.diagnostics.executions++;

    this.diagnostics.successful++;

}

private registerFailedExecution()

    : void {

    this.diagnostics.executions++;

    this.diagnostics.failed++;

}


/*===========================================================================
=
= TASA DE ÉXITO
=
===========================================================================*/

public successRate()

    : number {

    if (

        this.diagnostics.executions === 0

    ) {

        return 100;

    }

    return (

        this.diagnostics.successful

        /

        this.diagnostics.executions

    ) * 100;

}


/*===========================================================================
=
= DIAGNÓSTICO COMPLETO
=
===========================================================================*/

public buildDiagnostics() {

    return {

        status:

            this.status,

        initialized:

            this.initialized,

        disposed:

            this.disposed,

        paused:

            this.paused,

        providers:

            this.registry.list().length,

        running:

            this.runningRequests.size,

        queued:

            this.requestQueue.length,

        cache:

            this.responseCache.size,

        successRate:

            this.successRate(),

        diagnostics:

            this.diagnostics,

        lastHealthCheck:

            this.lastHealthCheck

    };

}


/*===========================================================================
=
= AUTOHEAL
=
===========================================================================*/

public async autoHeal()

    : Promise<void> {

    const healthy =

        await this.healthCheck();

    if (

        healthy

    ) {

        return;

    }

    this.log(

        "AutoHeal activated."

    );

    await this.restartProviders();

    await this.recover();

}


/*===========================================================================
=
= TAREA PERIÓDICA
=
===========================================================================*/

private maintenanceTimer?: NodeJS.Timeout;

public startMaintenance()

    : void {

    if (

        this.maintenanceTimer

    ) {

        return;

    }

    this.maintenanceTimer =

        setInterval(

            async () => {

                await this.maintenance();

                this.optimizeMemory();

            },

            300000

        );

}


/*===========================================================================
=
= DETENER MANTENIMIENTO
=
===========================================================================*/

public stopMaintenance()

    : void {

    if (

        this.maintenanceTimer

    ) {

        clearInterval(

            this.maintenanceTimer

        );

        this.maintenanceTimer =

            undefined;

    }

}


/*===========================================================================
=
= VERSIONES
=
===========================================================================*/

public version()

    : string {

    return WORKFLOW_ENGINE_VERSION;

}

public engineName()

    : string {

    return WORKFLOW_ENGINE_NAME;

}

/*===========================================================================
=
= EXPORTACIÓN DEL ESTADO
=
===========================================================================*/

public exportState(){

    return{

        status:this.status,

        initialized:this.initialized,

        statistics:this.statistics,

        metrics:this.metrics,

        diagnostics:this.diagnostics,

        cache:this.getCacheStatistics(),

        queue:this.getQueueInformation(),

        providers:this.registry.list(),

        version:this.version()

    };

}


/*===========================================================================
=
= IMPORTACIÓN DEL ESTADO
=
===========================================================================*/

public importState(

    snapshot:any

):void{

    if(

        !snapshot

    ){

        return;

    }

    this.status=

        snapshot.status??

        WorkflowStatus.CREATED;

    this.statistics=

        snapshot.statistics??

        this.statistics;

    this.metrics=

        snapshot.metrics??

        this.metrics;

}


/*===========================================================================
=
= RESET PARCIAL
=
===========================================================================*/

public resetRuntime()

    :void{

    this.clearQueue();

    this.clearEvents();

    this.currentConcurrentRequests=0;

    this.cancelled=false;

    this.paused=false;

    this.status=

        AIManagerStatus.READY;

}


/*===========================================================================
=
= RESET COMPLETO
=
===========================================================================*/

public fullReset()

    :void{

    this.dispose();

    this.clearCache();

    this.clearHistory();

    this.initialized=false;

    this.disposed=false;

    this.status=

        AIManagerStatus.CREATED;

}


/*===========================================================================
=
= RESUMEN EJECUTIVO
=
===========================================================================*/

public buildSummary(){

    return{

        engine:

            this.engineName(),

        version:

            this.version(),

        status:

            this.status,

        progress:

            this.successRate(),

        providers:

            this.registry.list().length,

        queue:

            this.requestQueue.length,

        running:

            this.runningRequests.size,

        cache:

            this.responseCache.size,

        health:

            this.healthCheck()

    };

}


/*===========================================================================
=
= API PÚBLICA
=
===========================================================================*/

public information(){

    return{

        engine:

            WORKFLOW_ENGINE_NAME,

        version:

            WORKFLOW_ENGINE_VERSION,

        description:

            WORKFLOW_ENGINE_DESCRIPTION,

        diagnostics:

            this.buildDiagnostics(),

        observability:

            this.buildObservabilityReport(),

        scheduler:

            this.getQueueInformation(),

        cache:

            this.getCacheStatistics(),

        pipeline:

            this.buildSummary()

    };

}


/*===========================================================================
=
= VALIDACIÓN GLOBAL
=
===========================================================================*/

public async validate()

    :Promise<boolean>{

    if(

        !this.initialized

    ){

        return false;

    }

    if(

        this.registry.list().length===0

    ){

        return false;

    }

    return await this.healthCheck();

}


/*===========================================================================
=
= AUTOINICIALIZACIÓN
=
===========================================================================*/

public async boot()

    :Promise<void>{

    if(

        this.initialized

    ){

        return;

    }

    await this.initialize();

    this.startMaintenance();

}


/*===========================================================================
=
= APAGADO CONTROLADO
=
===========================================================================*/

public async shutdown()

    :Promise<void>{

    await this.waitUntilIdle();

    this.stopMaintenance();

    this.dispose();

}


/*===========================================================================
=
= FACTORY
=
===========================================================================*/

export class AIManagerFactory{

    public static create()

        :AIManager{

        return new AIManager();

    }

    public static createProduction()

        :AIManager{

        const manager=

            new AIManager();

        manager.enableCache();

        manager.enableStreaming();

        manager.setMaximumConcurrency(

            10

        );

        return manager;

    }

}


/*===========================================================================
=
= DOCUMENTACIÓN
=
===========================================================================*/

/*

AI MANAGER

Responsabilidades

• Orquestación de IA.

• Gestión de proveedores.

• Balanceo automático.

• Health Monitoring.

• Cache inteligente.

• Streaming.

• Cola de peticiones.

• Concurrencia.

• Retry.

• Timeout.

• Fallback.

• Observabilidad.

• Auditoría.

• Eventos.

• Diagnóstico.

• Recuperación automática.

• AutoHeal.

• API pública.

Este componente constituye el núcleo de toda la Inteligencia
Artificial del proyecto Contrata-IA.

Toda interacción con modelos LLM debe pasar por este
gestor.

FIN DEL ARCHIVO.

*/
