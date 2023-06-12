import { Express } from 'express';

export class GenerateEndpointUtils {
    public static buildEndpoint(method: string, app: Express, name: string, object_class: any) {
        switch (method) {
            case "GET":
                app.get("/" + name, (req, res) => {
                    res.send("GET")
                })
                break;

            case "POST":
                app.post("/" + name, (req, res) => {
                    res.send("POST")
                })
                break;

            case "PUT":
                app.put("/" + name, (req, res) => {
                    res.send("PUT")
                })
                break;

            case "DELETE":
                app.delete("/" + name, (req, res) => {
                    res.send("DELETE")
                })
                break;

            case "PATCH":
                app.patch("/" + name, (req, res) => {
                    res.send("PATCH")
                })
                break;
        
            default:
                throw new Error("Unknown method " + method + " in config file")
        }
    }
}