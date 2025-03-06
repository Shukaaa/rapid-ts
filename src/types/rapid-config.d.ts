import {RapidEndpoint} from "./rapid-endpoints";
import {OverviewPageConfig} from "./overview-page-config";

export type RapidConfig = {
    name: string,
    endpoints: RapidEndpoint[],
    port?: number,
    prefix?: string,
    overviewPage?: OverviewPageConfig
}