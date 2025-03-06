import {Express} from 'express';
import {ErrorUtils} from "./error.utils";
import {IdStore} from "../stores/id.store";
import {FileUtils} from "./file.utils";
import {InterceptCreationsFn, InterceptUpdatesFn} from "../types/rapid-endpoints";

export class GenerateEndpointUtils {
    public static buildEndpoint(
        method: string,
        app: Express,
        name: string,
        objectReference: any,
        prefix: string,
        interceptCreations: InterceptCreationsFn | undefined,
        interceptUpdates: InterceptUpdatesFn | undefined
    ) {
        let path: string = `./storage/${name}.json`
        let endpoint_name: string = prefix + "/" + name

        switch (method) {
            case "GET":
                app.get(endpoint_name, (req, res) => {
                    res.json(FileUtils.readJsonFile(path))
                })
                break;

            case "GET_BY_ID":
                app.get(endpoint_name + "/:id", (req, res) => {
                    const id = req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)
                    
                    const object = jsonFile.find((object: any) => object["id"] === +id)
                    if (object !== undefined) {
                        res.json(object)
                        return
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "POST":
                app.post(endpoint_name, (req, res) => {
                    let jsonFile = FileUtils.readJsonFile(path)
                    let body = req.body

                    const latestId = IdStore.get(name)
                    const id = latestId + 1

                    if (interceptCreations !== undefined) interceptCreations(body, {id})

                    if (!this.datatypeChecks(body, objectReference, res)) {
                        return;
                    }

                    IdStore.set(name, id)
                    body['id'] = id

                    if (!this.undefinedChecks(body, objectReference, res)) {
                        return;
                    }

                    jsonFile.push(body)
                    FileUtils.writeJsonFile(path, jsonFile)

                    res.status(201).json(body)
                })
                break;

            case "PUT":
                app.put(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)
                    let body = req.body

                    if (interceptUpdates !== undefined) interceptUpdates(body, {id, method: "PUT"})

                    if (!this.datatypeChecks(body, objectReference, res)) {
                        return;
                    }

                    if (!this.undefinedChecks(body, objectReference, res)) {
                        return;
                    }

                    // replace the object with the same id
                    for (let i = 0; i < jsonFile.length; i++) {
                        if (jsonFile[i]["id"] === id) {
                            body.id = id
                            jsonFile[i] = body
                            FileUtils.writeJsonFile(path, jsonFile)

                            res.json(body)
                            return
                        }
                    }

                    // if no object with the same id was found, throw an error
                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "DELETE":
                app.delete(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)

                    for (let i = 0; i < jsonFile.length; i++) {
                        if (jsonFile[i]["id"] === id) {
                            jsonFile.splice(i, 1)
                            FileUtils.writeJsonFile(path, jsonFile)

                            res.status(204).send()
                            return
                        }
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            case "PATCH":
                app.patch(endpoint_name + "/:id", (req, res) => {
                    const id: number = +req.params.id
                    let jsonFile = FileUtils.readJsonFile(path)
                    let body = req.body

                    if (interceptUpdates !== undefined) interceptUpdates(body, {id, method: "PATCH"})

                    for(let i = 0; i < jsonFile.length; i++) {
                        const object = jsonFile[i]
                        if (object["id"] === id) {
                            for (let property in body) {
                                if (typeof body[property] != typeof objectReference[property]) {
                                    ErrorUtils.jsonThrow("The property " + property + " is not of the type " + typeof objectReference[property], res)
                                    return
                                }

                                object[property] = body[property]
                            }

                            FileUtils.writeJsonFile(path, jsonFile)
                            res.json(object)
                            return
                        }
                    }

                    ErrorUtils.jsonThrow("Couldn't find object with id " + id, res)
                })
                break;

            default:
                throw new Error("Unknown method " + method + " in config file")
        }
    }

    private static undefinedChecks(object: any, objectReference: any, res: any) {
        for (let property in object) {
            if (object[property] === undefined) {
                ErrorUtils.jsonThrow("The property " + property + " is undefined", res)
                return false
            }
        }

        for (const key in objectReference) {
            if (!object.hasOwnProperty(key)) {
                ErrorUtils.jsonThrow("The property " + key + " is not defined", res)
                return false
            }
        }

        return true
    }

    private static datatypeChecks(body: any, objectReference: any, res: any) {
        for (let property in body) {
            if (objectReference[property] === undefined) {
                ErrorUtils.jsonThrow("The property " + property + " is not defined", res)
                return false
            }

            if (typeof body[property] != typeof objectReference[property]) {
                ErrorUtils.jsonThrow("The property " + property + " needs to be type of " + typeof objectReference[property], res)
                return false
            }
        }

        return true
    }
}
