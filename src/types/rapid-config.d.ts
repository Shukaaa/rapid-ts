import {RapidEndpoint} from "../interfaces/IRapidEndpoint";

export type RapidConfig = {
    name: string,
    endpoints: RapidEndpoint[],
    port?: number,
    prefix?: string
}