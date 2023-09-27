## Node JS Project with TypeScript and TYPE ORM

## Setup for Debugging with `ngrok`

To use the provided launch settings, you'll need to set up `ngrok` and configure a few things:

### 1. Setting Up `ngrok`

Firstly, make sure you have `ngrok` installed.

### 2. Create the `start-ngrok.sh` Script

Create a file named `start-ngrok.sh` and paste the following contents:

```bash
#!/bin/bash
gnome-terminal -- ngrok http 4000

# Explicitly mention the full path to nodemon
[projectFolder]/node_modules/.bin/nodemon -r ts-node/register /[projectFolder]/src/server.ts
```

> **Note**: Make sure to modify the paths according to your system.

> **Note**: If You are Using Windows you need to create a .bat file.

### 3. Modify Script Permissions

Change the permissions to make the `.sh` file executable. This can typically be done using the command:

```bash
chmod +x start-ngrok.sh
```

### 4. Set Up `launch.json` in `.vscode`

Create (or modify) the `launch.json` file inside the `.vscode` directory of your project and paste the provided configuration.

### 5. Run and Debug

Save all the files. Now, your project should be in debug mode with `ngrok` providing access to anyone.

Happy debugging!

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

## Dependencies

- **bcrypt**: For password hashing and comparison.
- **class-transformer**: Transforms plain objects to classes and vice versa.
- **class-validator**: For validation of data.
- **cookie-parser**: Middleware to parse cookies.
- **cors**: Middleware to enable CORS with various options.
- **dotenv**: Loads environment variables from a `.env` file.
- **express**: Web application framework for creating the server.
- **jsonwebtoken**: For creating JWT tokens for authentication.
- **luxon**: Library for working with dates and times.
- **morgan**: HTTP request logger middleware.
- **pg**: PostgreSQL client for Node.js.
- **reflect-metadata**: Allows defining metadata on objects.
- **typeorm**: ORM for handling database operations.

## Environment Variables

For the application to function correctly, the following environment variables need to be set in the `.env` file:

- **ACCESS_TOKEN_SECRET**: Your secret for creating JWT access tokens.
- **REFRESH_TOKEN_SECRET**: Your secret for creating JWT refresh tokens.
- **PORT**: Port number for the application to listen on. E.g., `4000`.
- **MAX_LOGIN_ALLOWED**: Maximum number of concurrent logins allowed. E.g., `3`.
- **ACCESS_TOKEN_EXPIRES_IN**: Duration for the access token to expire, always in seconds. E.g., `300s`.
- **REFRESH_TOKEN_EXPIRES_IN**: Duration for the refresh token to expire, always in seconds. E.g., `86400s`.
- **JWT_COOKIE_MAX_AGE**: Maximum age for the JWT cookie, in milliseconds. E.g., `24 * 60 * 60 * 1000`.
- **Region**: Region for datetime calculations. E.g., `'Asia/Karachi'`.

> **Note**: Always ensure to keep your secrets private and never commit them to source control.
