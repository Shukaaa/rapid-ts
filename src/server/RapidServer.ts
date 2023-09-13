import express, {Express} from 'express';
import bodyParser from "body-parser";
import fs from "fs";
import {GenerateEndpointUtils} from '../utils/generate-endpoint.utils';
import {JsonFileService} from "../services/json-file.service";
import {IdStore} from "../stores/id.store";
import {ExpressEndpoint} from "../types/express-endpoint";
import {RapidEndpoint} from "../types/rapid-endpoints";
import {buildHtml} from "../builder/html.builder";
import {RapidConfig} from "../types/rapid-config";
import {HtmlEndpoint} from "../types/html-endpoint";
import {OverviewPageThemes} from "../types/overview-page-config";

export class RapidServer {
    private app: Express = express();
    private server: any;
    private hasBeenStarted: boolean = false;
    private endpoints_for_html: HtmlEndpoint[] = [];
    private readonly name: string = "";
    private readonly prefix: string = "";
    private readonly port: number = 3000;
    private readonly endpoints: RapidEndpoint[] = [];
    private readonly overviewPageEnable: boolean = true;
    private readonly overviewPageTheme: OverviewPageThemes = "LIGHT";
    private readonly objects: object = {};

    constructor(config: RapidConfig, objects: object) {
        if (config == undefined) {
            throw Error("Config couldn't be found")
        }

        if (objects == undefined) {
            throw Error("Objects couldn't be found")
        }

        this.objects = objects

        // check if storage folder exists
        if (!JsonFileService.exists("./storage")) {
            fs.mkdirSync("./storage")
        }

        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: false}))

        IdStore.check()

        const port = config.port
        if (port != undefined) {
            this.port = port
        }

        const prefix = config.prefix
        if (prefix != undefined) {
            this.prefix = prefix
        }

        const overviewPage = config.overviewPage
        if (overviewPage != undefined) {
            const enable = overviewPage.enable
            if (enable != undefined) {
                this.overviewPageEnable = enable
            }

            const theme = overviewPage.theme
            if (theme != undefined) {
                this.overviewPageTheme = theme
            }
        }

        const name = config.name
        if (name == undefined) {
            throw Error("Api name couldn't be found inside the config")
        }
        this.name = name

        const endpoints = config.endpoints
        if (endpoints == undefined) {
            throw Error("Endpoints couldn't be found inside the config")
        }
        this.endpoints = endpoints
    }

    public start() {
        for (let endpoint of this.endpoints) {
            this.generateEndpoint(endpoint)
        }

        if (this.overviewPageEnable) {
            this.createStartPage(this.prefix, this.name, this.endpoints_for_html, this.overviewPageTheme)
        }

        this.server = this.listen(this.port, this.name, this.prefix)
        this.hasBeenStarted = true
    }

    private listen(port: number, api_name: string, prefix: string) {
        return this.app.listen(port, () => {
            console.log(`🪐 [${api_name}]: Server is running at http://localhost:${port}${prefix}`);
        });
    }

    private generateEndpoint(endpoint: RapidEndpoint) {
        IdStore.get(endpoint.name)

        const endpoint_name = endpoint.name
        if (endpoint_name == undefined) {
            throw Error("Endpoint name couldn't be found inside one of the endpoints in the config.json")
        }

        let endpoint_for_html: HtmlEndpoint = {
            methods: [],
            name: endpoint_name
        }

        if (!JsonFileService.exists(`./storage/${endpoint_name}.json`)) {
            JsonFileService.writeJsonFile(`./storage/${endpoint_name}.json`, [])
        }

        const endpoint_methods = endpoint.methods
        if (endpoint_methods == undefined) {
            throw Error("Endpoint methods couldn't be found inside the endpoint " + endpoint_name)
        }

        endpoint_for_html.methods = endpoint_methods
        this.endpoints_for_html.push(endpoint_for_html)

        const object_name = endpoint.object
        if (object_name == undefined) {
            throw Error("Object name couldn't be found inside the endpoint " + endpoint_name)
        }

        // @ts-ignore
        const object_class = this.objects[object_name]
        if (object_class == undefined) {
            throw Error("Object class with the name " + object_name + " couldn't be found inside the api-objects.ts")
        }

        let id = new object_class({}).object_for_datacheck.id

        const hasId = endpoint.hasId
        if (hasId == undefined) {
            throw Error("hasId couldn't be found inside the endpoint " + endpoint_name)
        }

        if (hasId && id == undefined) {
            throw Error("Id couldn't be found inside the object " + object_name)
        }

        for (let method of endpoint_methods) {
            GenerateEndpointUtils.buildEndpoint(method, this.app, endpoint_name, object_class, hasId, this.prefix)
        }
    }

    private createStartPage(prefix: string, api_name: string, final: HtmlEndpoint[], theme: OverviewPageThemes) {
        this.app.get(prefix, (req, res) => {
            res.send(buildHtml(api_name, final, prefix, theme))
        });
    }

    public stop() {
        if (!this.hasBeenStarted) {
            throw Error("The server hasn't been started yet!")
        }

        console.log(`🪐 [${this.name}]: Server is stopping...`)
        this.server.close()
        this.hasBeenStarted = false
    }

    public restart() {
        if (!this.hasBeenStarted) {
            throw Error("The server hasn't been started yet!")
        }

        console.log(`🪐 [${this.name}]: Server has been restarted!`)
        this.server.close()
        this.start()
    }

    public addExpressEndpoint(endpoint: ExpressEndpoint, func: (req: Express.Request, res: Express.Response) => void) {
        let path = this.prefix + "/" + endpoint.name

        // @ts-ignore
        if (!(typeof this.app[endpoint.method.toLowerCase()] === 'function')) {
            throw Error("The method " + endpoint.method + " is not a valid method!");
        }

        // @ts-ignore
        this.app[endpoint.method.toLowerCase()](path, func);
        this.endpointCheck(endpoint, endpoint.method)
    }

    public addRapidEndpoint(rapidEndpoint: RapidEndpoint, object_class: any) {
        let endpoint = {
            name: rapidEndpoint.name,
            methods: rapidEndpoint.methods,
            object: rapidEndpoint.object,
            hasId: rapidEndpoint.hasId
        }

        // @ts-ignore
        this.objects[rapidEndpoint.object] = object_class

        this.generateEndpoint(endpoint)
    }

    private endpointCheck(endpoint: ExpressEndpoint, method: string) {
        let endpoint_for_html = this.endpoints_for_html.find(e => e.name == endpoint.name);
        if (endpoint_for_html) {
            // check if the endpoint already has the GET method
            if (endpoint_for_html.methods.includes(method)) {
                throw Error("The endpoint " + endpoint.name + " already has the " + method + " method!")
            }

            // add new method to the existing endpoint
            endpoint_for_html.methods.push(method)
        } else {
            // create a new endpoint
            endpoint_for_html = {
                name: endpoint.name,
                methods: [method]
            }
            this.endpoints_for_html.push(endpoint_for_html)
        }
    }
}
