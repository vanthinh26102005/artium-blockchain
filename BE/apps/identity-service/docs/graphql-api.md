# Identity Service GraphQL API

This document outlines the GraphQL API for the Identity Service.

## Queries

- **me: UserPayload**
  - **Description**: Retrieves the profile of the currently authenticated user.
  - **Authentication**: Requires JWT token.
  - **Returns**: The user's profile information.

- **findById(userId: String!): UserPayload**
  - **Description**: Finds a user by their unique ID.
  - **Arguments**:
    - `userId` (String!): The ID of the user to find.
  - **Returns**: The user's profile information, or `null` if the user is not found.

## Mutations

- **loginByEmail(loginInput: EmailLoginInput!): LoginResponse**
  - **Description**: Authenticates a user with their email and password.
  - **Arguments**:
    - `loginInput` (EmailLoginInput!): The email and password of the user.
  - **Returns**: A `LoginResponse` containing the access and refresh tokens.

- **loginWithGoogle: LoginResponse**
  - **Description**: Authenticates a user with their Google account.
  - **Authentication**: Requires Google OAuth2 token.
  - **Returns**: A `LoginResponse` containing the access and refresh tokens.

- **initiateUserRegistration(input: UserRegisterInput!): RequestOtpResponse**
  - **Description**: Initiates the user registration process by sending an OTP to the user's email.
  - **Arguments**:
    - `input` (UserRegisterInput!): The user's registration information (e.g., email, password).
  - **Returns**: A response indicating whether the OTP was sent successfully.

- **completeEmailRegistration(input: CompleteUserRegisterInput!): LoginResponse**
  - **Description**: Completes the email registration process by verifying the OTP and creating the user.
  - **Arguments**:
    - `input` (CompleteUserRegisterInput!): The user's registration information, including the OTP.
  - **Returns**: A `LoginResponse` containing the access and refresh tokens.

- **requestPasswordReset(input: RequestPasswordResetInput!): RequestPasswordResetResponse**
  - **Description**: Initiates the password reset process by sending a reset link to the user's email.
  - **Arguments**:
    - `input` (RequestPasswordResetInput!): The user's email address.
  - **Returns**: A response indicating whether the reset instructions were sent.

- **verifyPasswordReset(input: VerifyPasswordResetInput!): VerifyPasswordResetResponse**
  - **Description**: Verifies the password reset token.
  - **Arguments**:
    - `input` (VerifyPasswordResetInput!): The password reset token.
  - **Returns**: A response indicating whether the token is valid.

- **confirmNewPassword(input: ConfirmPasswordResetInput!): LoginResponse**
  - **Description**: Confirms a new password for the user after a password reset.
  - **Arguments**:
    - `input` (ConfirmPasswordResetInput!): The new password and the reset token.
  - **Returns**: A `LoginResponse` containing the access and refresh tokens.
