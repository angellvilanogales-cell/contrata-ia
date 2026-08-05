/******************************************************************************
 *
 * ASISTENTE DE CONTRATACIÓN PÚBLICA
 *
 * DOMAIN EVENTS
 *
 ******************************************************************************/

import {

    Event

} from "./EventBus";

/*===========================================================================
=
= BASE
=
===========================================================================*/

export abstract class DomainEvent

implements Event{

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
= EXPEDIENTE
=
===========================================================================*/

export class ExpedienteCreatedEvent

extends DomainEvent{

    constructor(

        expedienteId:string

    ){

        super(

            "ExpedienteCreated",

            {

                expedienteId

            }

        );

    }

}

export class ExpedienteUpdatedEvent

extends DomainEvent{

    constructor(

        expedienteId:string

    ){

        super(

            "ExpedienteUpdated",

            {

                expedienteId

            }

        );

    }

}

export class ExpedienteDeletedEvent

extends DomainEvent{

    constructor(

        expedienteId:string

    ){

        super(

            "ExpedienteDeleted",

            {

                expedienteId

            }

        );

    }

}

/*===========================================================================
=
= DOCUMENTOS
=
===========================================================================*/

export class DocumentGeneratedEvent

extends DomainEvent{

    constructor(

        expedienteId:string,

        document:string

    ){

        super(

            "DocumentGenerated",

            {

                expedienteId,

                document

            }

        );

    }

}

export class DocumentValidatedEvent

extends DomainEvent{

    constructor(

        expedienteId:string,

        document:string

    ){

        super(

            "DocumentValidated",

            {

                expedienteId,

                document

            }

        );

    }

}

/*===========================================================================
=
= IA
=
===========================================================================*/

export class AIRequestStartedEvent

extends DomainEvent{

    constructor(

        provider:string,

        model:string

    ){

        super(

            "AIRequestStarted",

            {

                provider,

                model

            }

        );

    }

}

export class AIRequestCompletedEvent

extends DomainEvent{

    constructor(

        provider:string,

        duration:number

    ){

        super(

            "AIRequestCompleted",

            {

                provider,

                duration

            }

        );

    }

}

export class AIRequestFailedEvent

extends DomainEvent{

    constructor(

        provider:string,

        reason:string

    ){

        super(

            "AIRequestFailed",

            {

                provider,

                reason

            }

        );

    }

}

/*===========================================================================
=
= WORKFLOW
=
===========================================================================*/

export class WorkflowStartedEvent

extends DomainEvent{

    constructor(

        workflow:string

    ){

        super(

            "WorkflowStarted",

            {

                workflow

            }

        );

    }

}

export class WorkflowCompletedEvent

extends DomainEvent{

    constructor(

        workflow:string,

        duration:number

    ){

        super(

            "WorkflowCompleted",

            {

                workflow,

                duration

            }

        );

    }

}

export class WorkflowFailedEvent

extends DomainEvent{

    constructor(

        workflow:string,

        reason:string

    ){

        super(

            "WorkflowFailed",

            {

                workflow,

                reason

            }

        );

    }

}
