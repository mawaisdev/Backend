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
