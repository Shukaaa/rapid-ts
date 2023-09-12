import {RapidHttpMethods} from "./rapid-http-methods";

export type RapidEndpoint = {
    name: string,
    methods: RapidHttpMethods[],
    object: string,
    hasId: boolean
}