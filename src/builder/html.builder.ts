import {HtmlEndpoint} from "../types/html-endpoint";
import {OverviewPageThemes} from "../types/overview-page-config";

const themeMap = {
    LIGHT: {
        background: "#fff",
        secondaryBackground: "#f5f5f5",
        color: "#333",
        borderColor: "#333",
        linkColor: "#3174b5"
    },
    DARK: {
        background: "#333",
        secondaryBackground: "#444",
        color: "#f5f5f5",
        borderColor: "#f5f5f5",
        linkColor: "#499ced"
    }
}

export function buildHtml(api_name: string, endpoints: HtmlEndpoint[], prefix: string, theme: OverviewPageThemes) {
    return `
                <head>
                    <style>
                        body {
                            font-family: sans-serif; 
                            background-color: ${themeMap[theme].background};
                            color: ${themeMap[theme].color};
                        }
                        a {
                            color: ${themeMap[theme].linkColor};
                        }
                        a:hover {
                            color: ${themeMap[theme].linkColor};
                        }
                        a:visited {
                            color: ${themeMap[theme].linkColor};
                        }
                        a:active {
                            color: ${themeMap[theme].color};
                        }
                        h2 {  margin-bottom: 0; }
                        ul, h1 { margin-top: 0; }
                        li { padding: 5px; }
                        main {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            padding: 20px;
                            border: 1px solid ${themeMap[theme].borderColor};
                            background-color: ${themeMap[theme].secondaryBackground};
                            border-radius: 5px;
                        }
                        img {
                            vertical-align: bottom;
                        }
                    </style>
                    <title>${api_name}</title>
                </head>
                <body>
                    <main>
                        <h1>${api_name} is running!</h1>
                        <p>created by: <a href="https://github.com/Shukaaa/rapid-ts">rapid-ts</a></p>
                        
                        <h2>Endpoints</h2>
                        <ul>
                            ${createEndpoints(endpoints, prefix)}
                        </ul>
                    </main>
                </body>`
}

function createEndpoints(final: HtmlEndpoint[], prefix: string) {
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
