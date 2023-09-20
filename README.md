## Node JS Project with TypeScript and TYPE ORM

## VS Code Configuration To Debug Typescript Applications Using Nodemon Easily

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debugg",
      "runtimeExecutable": "${workspaceFolder}/start-ngrok.sh",
      "console": "integratedTerminal", // This ensures nodemon starts in the VS Code terminal
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json"
      }
    }
  ]
}
```
