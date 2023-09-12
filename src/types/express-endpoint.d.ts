import {AllowedHttpMethods} from "./allowed-http-methods";

export type ExpressEndpoint = {
    name: string,
    method: AllowedHttpMethods
}