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

- **Endpoint**: `/auth/refresh-token`
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

### 5. Password Reset (Initiation & Completion)

- **Endpoint**: `/auth/reset-password`
- **Method**: `POST`

#### Scenario: Initiate Password Reset

When only the email is provided, the API initiates the password reset process.

| Status Code | Description                                            |
| ----------- | ------------------------------------------------------ |
| 200         | Password reset initiation successful.                  |
| 400         | Invalid request format or validation errors.           |
| 500         | An unexpected error occurred while processing request. |

#### Scenario: Complete Password Reset

When the email, token, and password are provided, the API completes the password reset process.

| Status Code | Description                                                                       |
| ----------- | --------------------------------------------------------------------------------- |
| 200         | Password reset completion successful.                                             |
| 400         | Invalid request format, validation errors, or invalid token/password combination. |
| 500         | An unexpected error occurred while processing request.                            |

#### Scenario: Invalid Request

For any other request format.

| Status Code | Description             |
| ----------- | ----------------------- |
| 400         | Invalid request format. |

### 6. Fetch User Profile

- **Endpoint**: `/profile`
- **Method**: `GET`

| Status Code | Name                  | Description                                       |
| ----------- | --------------------- | ------------------------------------------------- |
| 200         | OK                    | Successfully retrieved the user profile details.  |
| 401         | Unauthorized          | The user is unauthorized to access this endpoint. |
| 404         | Not Found             | The requested user profile was not found.         |
| 500         | Internal Server Error | An unexpected server error occurred.              |

### 7. Update Password

- **Endpoint**: `/profile/update-password`
- **Method**: `POST`

| Status Code | Name                  | Description                                      |
| ----------- | --------------------- | ------------------------------------------------ |
| 200         | OK                    | The password was successfully updated.           |
| 400         | Bad Request           | There were validation errors in the input data.  |
| 401         | Unauthorized          | The user is unauthorized to update the password. |
| 500         | Internal Server Error | An unexpected server error occurred.             |

### 8. Create Category

- **Endpoint**: `/category/`
- **Method**: `POST`

| Status Code | Name                  | Description                                     |
| ----------- | --------------------- | ----------------------------------------------- |
| 201         | Created               | The category was successfully created.          |
| 400         | Bad Request           | There were validation errors in the input data. |
| 404         | Not Found             | The user creating the category was not found.   |
| 500         | Internal Server Error | An unexpected server error occurred.            |

### 9. Get All Categories

- **Endpoint**: `/category/`
- **Method**: `GET`

| Status Code | Name                  | Description                          |
| ----------- | --------------------- | ------------------------------------ |
| 200         | OK                    | Successfully fetched all categories. |
| 500         | Internal Server Error | An unexpected server error occurred. |

### 10. Get Category by ID

- **Endpoint**: `/category/:id`
- **Method**: `GET`

| Status Code | Name                  | Description                          |
| ----------- | --------------------- | ------------------------------------ |
| 200         | OK                    | Successfully fetched the category.   |
| 404         | Not Found             | The category was not found.          |
| 500         | Internal Server Error | An unexpected server error occurred. |

### 11. Update Category

- **Endpoint**: `/category/:id`
- **Method**: `PATCH`

| Status Code | Name                  | Description                                      |
| ----------- | --------------------- | ------------------------------------------------ |
| 200         | OK                    | The category was successfully updated.           |
| 400         | Bad Request           | There were validation errors or an invalid user. |
| 500         | Internal Server Error | An unexpected server error occurred.             |

### 12. Delete Category

- **Endpoint**: `/category/:id`
- **Method**: `DELETE`

| Status Code | Name                  | Description                            |
| ----------- | --------------------- | -------------------------------------- |
| 200         | OK                    | The category was successfully deleted. |
| 404         | Not Found             | The category was not found.            |
| 500         | Internal Server Error | An unexpected server error occurred.   |

