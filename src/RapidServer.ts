import express, {Express} from 'express';
import bodyParser from "body-parser";
import fs from "fs";
import {GenerateEndpointUtils} from './utils/generate-endpoint.utils';
import {FileUtils} from "./utils/file.utils";
import {IdStore} from "./stores/id.store";
import {RapidEndpoint} from "./types/rapid-endpoints";
import {RapidConfig} from "./types/rapid-config";
import {apiReference} from "@scalar/express-api-reference";
import {OpenApiSpecGenerator} from "./generator/open-api-spec.generator";

/**
 * The main class to start the server
 *
 * @class RapidServer
 */
export class RapidServer {
    private app: Express = express();
    private server: any;
    private hasBeenStarted: boolean = false;
    private readonly config: RapidConfig = {} as RapidConfig;

    /**
     * Creates an instance of RapidServer.
     * @param config The configuration for the server
     */
    constructor(config: RapidConfig) {
        if (config === undefined) {
            throw Error("Config couldn't be found")
        }

        this.config = config

        // check if storage folder exists
        if (!FileUtils.exists("./storage")) {
            fs.mkdirSync("./storage")
        }

        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: false}))
        
        this.app.get('/openapi.json', (req, res) => {
						res.setHeader('Content-Type', 'application/json');
          	res.send(OpenApiSpecGenerator.generateOpenApiSpec(this.config))
        })
        
        this.app.use('/api-spec', apiReference({
            spec: {
                url: '/openapi.json',
            }
        }))

        IdStore.check()

        const port = config.port
        if (port === undefined) {
            this.config.port = 3000
        }

        const prefix = config.prefix
        if (prefix === undefined) {
            this.config.prefix = ""
        }

        const overviewPage = config.overviewPage
        if (overviewPage === undefined) {
            this.config.overviewPage = {
                enable: true,
                theme: "LIGHT"
            }
        } else {
            if (overviewPage.enable === undefined) {
                this.config.overviewPage!.enable = true
            }

            if (overviewPage.theme === undefined) {
                this.config.overviewPage!.theme = "LIGHT"
            }
        }

        const name = config.name
        if (name === undefined) {
            throw Error("Api name couldn't be found inside the config")
        }

        const endpoints = config.endpoints
        if (endpoints === undefined) {
            throw Error("Endpoints couldn't be found inside the config")
        }
    }

    /**
     * Starts the server
     *
     * @memberof RapidServer
     * @returns {void}
     */
    public start(): void {
        for (let endpoint of this.config.endpoints) {
            this.generateEndpoint(endpoint)
        }

        this.server = this.listen()
        this.hasBeenStarted = true
    }

    private listen() {
        return this.app.listen(this.config.port, () => {
            console.log(`🪐 ${this.config.name} is ready!\n\n🔗 API is running at http://localhost:${this.config.port}${this.config.prefix}\n📜 API Spec is running at http://localhost:${this.config.port}/api-spec`);
        });
    }

    private generateEndpoint(endpoint: RapidEndpoint) {
        IdStore.get(endpoint.name)

        const endpointName = endpoint.name
        if (endpointName === undefined) {
            throw Error("Endpoint name couldn't be found inside one of the endpoints in the config.json")
        }

        if (!FileUtils.exists(`./storage/${endpointName}.json`)) {
            FileUtils.writeJsonFile(`./storage/${endpointName}.json`, [])
        }

        const methods = endpoint.methods
        if (methods === undefined) {
            throw Error("Endpoint methods couldn't be found inside the endpoint " + endpointName)
        }

        const objectReference = endpoint.objectReference
        if (objectReference === undefined) {
            throw Error("objectReference couldn't be found inside the endpoint " + endpointName)
        }

        for (let method of methods) {
            GenerateEndpointUtils.buildEndpoint(
                method,
                this.app,
                endpointName,
                objectReference,
                this.config.prefix!!,
                endpoint.interceptCreations,
                endpoint.interceptUpdates
            )
        }
    }

    /**
     * Stops the server
     *
     * @memberof RapidServer
     * @returns {void}
     */
    public stop(): void {
        if (!this.hasBeenStarted) {
            throw Error("The server hasn't been started yet!")
        }

        console.log(`🪐 [${this.config.name}]: Server is stopping...`)
        this.server.close()
        this.hasBeenStarted = false
    }

    /**
     * Restarts the server
     *
     * @memberof RapidServer
     * @returns {void}
     */
    public restart(): void {
        if (!this.hasBeenStarted) {
            throw Error("The server hasn't been started yet!")
        }

        console.log(`🪐 [${this.config.name}]: Server has been restarted!`)
        this.server.close()
        this.start()
    }
}
