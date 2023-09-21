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

## API Endpoints

### 1. User Signup

- **Endpoint**: `/auth/signup`
- **Method**: `POST`

| Status Code | Name                  | Description                                     |
| ----------- | --------------------- | ----------------------------------------------- |
| 201         | Created               | The user was successfully created.              |
| 400         | Bad Request           | There were validation errors in the input data. |
| 500         | Internal Server Error | An unexpected server error occurred.            |

### 2. User Login

- **Endpoint**: `/auth/login`
- **Method**: `POST`

| Status Code | Name                  | Description                                            |
| ----------- | --------------------- | ------------------------------------------------------ |
| 201         | Created               | Login was successful and a new token has been created. |
| 400         | Bad Request           | There were validation errors or invalid credentials.   |
| 500         | Internal Server Error | An unexpected server error occurred.                   |

### 3. Refresh Token

- **Endpoint**: `/auth/refreshToken`
- **Method**: `GET`

| Status Code | Name         | Description                                                     |
| ----------- | ------------ | --------------------------------------------------------------- |
| 201         | Created      | A new token was successfully created.                           |
| 401         | Unauthorized | The user is unauthorized due to a missing or invalid JWT token. |

### 4. Logout

- **Endpoint**: `/auth/logout`
- **Method**: `POST`

| Status Code | Name                  | Description                          |
| ----------- | --------------------- | ------------------------------------ |
| 204         | No Content            | Logout was successful.               |
| 500         | Internal Server Error | An unexpected server error occurred. |

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
