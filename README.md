## Node JS Project with TypeScript and TYPE ORM

## VS Code Configuration To Debug Typescript Applications Using Nodemon Easily

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch via Nodemon",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/nodemon",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/server.ts"],
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "TS_NODE_PROJECT": "${workspaceFolder}/tsconfig.json"
      }
    }
  ]
}
```
