export interface RapidEndpoint {
    name: string,
    methods: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "GET_BY_ID"[],
    object: string,
    hasId: boolean
}
