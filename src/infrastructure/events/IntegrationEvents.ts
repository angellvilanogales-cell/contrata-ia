/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * INTEGRATION EVENTS
 *
 * Eventos destinados a integraciones externas.
 *
 ******************************************************************************/

import { Event } from "./EventBus";

/*===========================================================================
=
= BASE
=
===========================================================================*/

export abstract class IntegrationEvent implements Event{

    public readonly id:string;

    public readonly timestamp:Date;

    constructor(

        public readonly type:string,

        public readonly payload:unknown

    ){

        this.id=

            crypto.randomUUID();

        this.timestamp=

            new Date();

    }

}

/*===========================================================================
=
= IA
=
===========================================================================*/

export class AIProviderInvokedEvent

extends IntegrationEvent{

    constructor(

        provider:string,

        model:string

    ){

        super(

            "AIProviderInvoked",

            {

                provider,

                model

            }

        );

    }

}

export class AIProviderResponseEvent

extends IntegrationEvent{

    constructor(

        provider:string,

        duration:number,

        tokens:number

    ){

        super(

            "AIProviderResponse",

            {

                provider,

                duration,

                tokens

            }

        );

    }

}

export class AIProviderErrorEvent

extends IntegrationEvent{

    constructor(

        provider:string,

        error:string

    ){

        super(

            "AIProviderError",

            {

                provider,

                error

            }

        );

    }

}

/*===========================================================================
=
= EXPORTACIONES
=
===========================================================================*/

export class ExportStartedEvent

extends IntegrationEvent{

    constructor(

        expedienteId:string,

        format:string

    ){

        super(

            "ExportStarted",

            {

                expedienteId,

                format

            }

        );

    }

}

export class ExportCompletedEvent

extends IntegrationEvent{

    constructor(

        expedienteId:string,

        format:string,

        file:string

    ){

        super(

            "ExportCompleted",

            {

                expedienteId,

                format,

                file

            }

        );

    }

}

export class ExportFailedEvent

extends IntegrationEvent{

    constructor(

        expedienteId:string,

        reason:string

    ){

        super(

            "ExportFailed",

            {

                expedienteId,

                reason

            }

        );

    }

}

/*===========================================================================
=
= GITHUB
=
===========================================================================*/

export class GitRepositoryUpdatedEvent

extends IntegrationEvent{

    constructor(

        repository:string,

        branch:string

    ){

        super(

            "GitRepositoryUpdated",

            {

                repository,

                branch

            }

        );

    }

}

/*===========================================================================
=
= ALMACENAMIENTO
=
===========================================================================*/

export class FileStoredEvent

extends IntegrationEvent{

    constructor(

        file:string

    ){

        super(

            "FileStored",

            {

                file

            }

        );

    }

}

export class FileDeletedEvent

extends IntegrationEvent{

    constructor(

        file:string

    ){

        super(

            "FileDeleted",

            {

                file

            }

        );

    }

}

/*===========================================================================
=
= NOTIFICACIONES
=
===========================================================================*/

export class NotificationSentEvent

extends IntegrationEvent{

    constructor(

        recipient:string,

        channel:string

    ){

        super(

            "NotificationSent",

            {

                recipient,

                channel

            }

        );

    }

}

export class NotificationFailedEvent

extends IntegrationEvent{

    constructor(

        recipient:string,

        reason:string

    ){

        super(

            "NotificationFailed",

            {

                recipient,

                reason

            }

        );

    }

}
