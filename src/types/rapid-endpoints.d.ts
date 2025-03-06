export type RapidHttpMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "GET_BY_ID";
export type RapidInterceptCreationEvent = {
    id: number,
}
export type RapidInterceptUpdateEvent = {
    id: number,
    method: 'PUT' | 'PATCH',
}

export type RapidEndpoint = {
    name: string,
    methods: RapidHttpMethods[],
    objectReference: object,
    interceptCreations?: InterceptCreationsFn,
    interceptUpdates?: InterceptUpdatesFn
}

export type InterceptCreationsFn = (object: object, event: RapidInterceptCreationEvent) => void
export type InterceptUpdatesFn = (object: object, event: RapidInterceptUpdateEvent) => void
