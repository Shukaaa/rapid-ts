import {EndpointHTML} from "../interfaces/IEndpointHtml";

export function buildHtml(api_name: string, endpoints: EndpointHTML[], prefix: string) {
    return `
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
                            ${createEndpoints(endpoints, prefix)}
                        </ul>
                    </main>
                </body>`
}

function createEndpoints(final: EndpointHTML[], prefix: string) {
    return final.map(endpoint => `<li><a href="${prefix}/${endpoint.name}">${prefix}/${endpoint.name}</a> ${
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
    }</li>`).join("\n")
}
