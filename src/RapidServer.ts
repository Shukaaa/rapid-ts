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

export class RapidServer {
    private app: Express = express();
    private server: any;
    private hasBeenStarted: boolean = false;
    private name: string = "";
    private readonly config_path: string = "";
    private readonly objects: object = {};

    constructor(config_path: string, objects: object) {
        if (!JsonFileService.exists(config_path)) {
            throw Error("Config file couldn't be found")
        }

        if (objects == undefined) {
            throw Error("Objects couldn't be found")
        }

        this.config_path = config_path.replace(/\\/g, "/")
        this.objects = objects
    }

    public start() {
        const config_data = JsonFileService.readJsonFile(this.config_path);

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
            port = 3000
        }

        let prefix = config_data["prefix"]
        if (prefix == undefined) {
            console.log("Prefix couldn't be found inside the config.json, so it will be set to nothing")
            prefix = ""
        }

        const name = config_data["name"]
        if (name == undefined) {
            throw Error("Api name couldn't be found inside the config.json")
        }
        this.name = name

        const endpoints = config_data["endpoints"]
        if (endpoints == undefined) {
            throw Error("Endpoints couldn't be found inside the config.json")
        }

        let endpoints_for_html: EndpointHTML[] = []
        for (let endpoint of endpoints) {
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
            endpoints_for_html.push(endpoint_for_html)

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
                GenerateEndpointUtils.buildEndpoint(method, this.app, endpoint_name, object_class, hasId, prefix)
            }
        }

        this.createStartPage(prefix, this.name, endpoints_for_html)
        this.server = this.listen(port, this.name, prefix)
        this.hasBeenStarted = true
    }

    private listen(port: number, api_name: string, prefix: string) {
        return this.app.listen(port, () => {
            console.log(`🪐 [${api_name}]: Server is running at http://localhost:${port}${prefix}`);
        });
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

    public close() {
        if (!this.hasBeenStarted) {
            throw Error("The server hasn't been started yet!")
        }

        console.log(`🪐 [${this.name}]: Server is closing...`)
        this.server.close()
    }

    public restart() {
        if (!this.hasBeenStarted) {
            throw Error("The server hasn't been started yet!")
        }

        console.log(`🪐 [${this.name}]: Server has been restarted!`)
        this.server.close()
        this.start()
    }
}
