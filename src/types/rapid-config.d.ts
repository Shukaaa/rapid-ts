import {RapidEndpoint} from "./rapid-endpoints";

export type RapidConfig = {
    name: string,
    endpoints: RapidEndpoint[],
    port?: number,
    prefix?: string
}