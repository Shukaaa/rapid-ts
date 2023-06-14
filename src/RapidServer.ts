import express, {Express} from 'express';
import {GenerateEndpointUtils} from './utils/GenerateEndpointUtils';
import bodyParser from "body-parser";
import {JsonFileService} from "./services/JsonFileService";
import {IdStore} from "./stores/IdStore";
import fs from "fs";

interface EndpointHTML {
    methods: string[],
    name: string,
}

interface RapidEndpoint {
    name: string,
    methods: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "GET_BY_ID"[],
    object: string,
    hasId: boolean
}

interface Endpoint {
    name: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
}

export class RapidServer {
    private app: Express = express();
    private server: any;
    private hasBeenStarted: boolean = false;
    private endpoints_for_html: EndpointHTML[] = [];
    private readonly name: string = "";
    private readonly prefix: string = "";
    private readonly port: number = 0;
    private readonly endpoints: any[] = [];
    private readonly objects: object = {};

    constructor(config_path: string, objects: object) {
        if (!JsonFileService.exists(config_path)) {
            throw Error("Config file couldn't be found")
        }

        if (objects == undefined) {
            throw Error("Objects couldn't be found")
        }

        config_path = config_path.replace(/\\/g, "/")
        this.objects = objects

        const config_data = JsonFileService.readJsonFile(config_path);

        // check if storage folder exists
        if (!JsonFileService.exists("./storage")) {
            fs.mkdirSync("./storage")
        }

        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: false}))

        IdStore.check()

        let port = config_data["port"]
        if (port == undefined) {
            console.log("Port couldn't be found inside the config.json, so it will be set to 3000")
            this.port = 3000
        }
        this.port = port

        let prefix = config_data["prefix"]
        if (prefix == undefined) {
            console.log("Prefix couldn't be found inside the config.json, so it will be set to api/v1/")
            prefix = "/api/v1"
        }
        this.prefix = prefix

        const name = config_data["name"]
        if (name == undefined) {
            throw Error("Api name couldn't be found inside the config.json")
        }
        this.name = name

        const endpoints = config_data["endpoints"]
        if (endpoints == undefined) {
            throw Error("Endpoints couldn't be found inside the config.json")
        }
        this.endpoints = endpoints
    }

    public start() {
        for (let endpoint of this.endpoints) {
            this.generateEndpoint(endpoint)
        }

        this.createStartPage(this.prefix, this.name, this.endpoints_for_html)
        this.server = this.listen(this.port, this.name, this.prefix)
        this.hasBeenStarted = true
    }

    private listen(port: number, api_name: string, prefix: string) {
        return this.app.listen(port, () => {
            console.log(`🪐 [${api_name}]: Server is running at http://localhost:${port}${prefix}`);
        });
    }

    private generateEndpoint(endpoint: any) {
        IdStore.get(endpoint["name"])

        const endpoint_name = endpoint["name"]
        if (endpoint_name == undefined) {
            throw Error("Endpoint name couldn't be found inside one of the endpoints in the config.json")
        }

        let endpoint_for_html: EndpointHTML = {
            methods: [],
            name: endpoint_name
        }

        if (!JsonFileService.exists(`./storage/${endpoint_name}.json`)) {
            JsonFileService.writeJsonFile(`./storage/${endpoint_name}.json`, [])
        }

        const endpoint_methods = endpoint["methods"]
        if (endpoint_methods == undefined) {
            throw Error("Endpoint methods couldn't be found inside the endpoint " + endpoint_name)
        }

        endpoint_for_html.methods = endpoint_methods
        this.endpoints_for_html.push(endpoint_for_html)

        const object_name = endpoint["object"]
        if (object_name == undefined) {
            throw Error("Object name couldn't be found inside the endpoint " + endpoint_name)
        }

        // @ts-ignore
        const object_class = this.objects[object_name]
        if (object_class == undefined) {
            throw Error("Object class with the name " + object_name + " couldn't be found inside the api-objects.ts")
        }

        let id = new object_class({}).object_for_datacheck.id

        const hasId = endpoint["hasId"]
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

    private createStartPage(prefix: string, api_name: string, final: EndpointHTML[]) {
        this.app.get(prefix, (req, res) => {
            res.send(`
                <head>
                    <style>
                        body { font-family: sans-serif; }
                        h2 {  margin-bottom: 0; }
                        ul, h1 { margin-top: 0; }
                        li { padding: 5px; }
                        main {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            padding: 20px;
                            border: 1px solid #333;
                            background-color: #f5f5f5;
                            border-radius: 10px;
                        }
                    </style>
                    <title>${api_name}</title>
                </head>
                <body>
                    <main>
                        <h1>${api_name} is running!</h1>
                        <p>created by: <a href="https://github.com/Shukaaa/rapid-ts">RAPID-ts</a></p>
                        
                        <h2>Endpoints</h2>
                        <ul>
                            ${final.map(endpoint => `<li><a href="${prefix}/${endpoint.name}">${prefix}/${endpoint.name}</a> ${
                                endpoint.methods.map(method => {
                                    switch (method) {
                                        case "GET":
                                            return `<img src="https://img.shields.io/badge/-GET-brightgreen" alt="GET">`
                                        case "POST":
                                            return `<img src="https://img.shields.io/badge/-POST-yellow" alt="POST">`
                                        case "PUT":
                                            return `<img src="https://img.shields.io/badge/-PUT-blue" alt="PUT">`
                                        case "DELETE":
                                            return `<img src="https://img.shields.io/badge/-DELETE-red" alt="DELETE">`
                                        case "PATCH":
                                            return `<img src="https://img.shields.io/badge/-PATCH-purple" alt="PATCH">`
                                        default:
                                            return ""
                                    }
                                }).join(" ")
                            }</li>`).join("\n")}
                        </ul>
                    </main>
                </body>`)
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

    public addExpressEndpoint(endpoint: Endpoint, func: (req: Express.Request, res: Express.Response) => void) {
        switch (endpoint.method) {
            case "GET":
                this.app.get(this.prefix + "/" + endpoint.name, func)
                break
            case "POST":
                this.app.post(this.prefix + this.name + endpoint.name, func)
                break
            case "PUT":
                this.app.put(this.prefix + this.name + endpoint.name, func)
                break
            case "PATCH":
                this.app.patch(this.prefix + this.name + endpoint.name, func)
                break
            case "DELETE":
                this.app.delete(this.prefix + this.name + endpoint.name, func)
                break
        }

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

    private endpointCheck(endpoint: Endpoint, method: string) {
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
