import {
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AttributeType,
  MessageActionType
} from '@aws-sdk/client-cognito-identity-provider';
import { SignUpRequest, LoginRequest, LoginResponse, AuthUser } from '../types';

const cognito = new CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

export class AuthRepository {
  /**
   * Register a new user in Cognito
   */
  async signUp(userData: SignUpRequest): Promise<AuthUser> {
    try {
      // Create user attributes
      const userAttributes: AttributeType[] = [
        {
          Name: 'email',
          Value: userData.email,
        },
        {
          Name: 'email_verified',
          Value: 'true', // Auto-verify email for simplicity
        },
      ];

      // Create user in Cognito
      const command = new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: userData.username,
        UserAttributes: userAttributes,
        TemporaryPassword: userData.password,
        MessageAction: MessageActionType.SUPPRESS, // Don't send welcome email
      });

      const response = await cognito.send(command);

      if (!response.User) {
        throw new Error('Failed to create user in Cognito');
      }

      // Set permanent password immediately (avoid temporary password flow)
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: userData.username,
        Password: userData.password,
        Permanent: true,
      });

      await cognito.send(setPasswordCommand);

      // Get the sub (user ID) from the attributes
      const sub = response.User.Attributes?.find(attr => attr.Name === 'sub')?.Value;
      
      if (!sub) {
        throw new Error('User created but sub attribute not found');
      }

      return {
        userId: sub,
        username: userData.username,
        email: userData.email,
      };
    } catch (error) {
      console.error('Error signing up user:', error);
      throw error;
    }
  }

  /**
   * Login a user with Cognito
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const command = new AdminInitiateAuthCommand({
        UserPoolId: USER_POOL_ID,
        ClientId: CLIENT_ID,
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        AuthParameters: {
          USERNAME: credentials.username,
          PASSWORD: credentials.password,
        },
      });

      const response = await cognito.send(command);

      if (!response.AuthenticationResult) {
        throw new Error('Authentication failed - no auth result returned');
      }

      const { AccessToken, RefreshToken, ExpiresIn, IdToken } = response.AuthenticationResult;

      if (!AccessToken || !IdToken) {
        throw new Error('Authentication succeeded but tokens are missing');
      }

      // Get user details to include in response
      const userCommand = new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: credentials.username,
      });

      const userResponse = await cognito.send(userCommand);
      const userId = userResponse.UserAttributes?.find(attr => attr.Name === 'sub')?.Value;

      if (!userId) {
        throw new Error('User authenticated but ID not found');
      }

      return {
        token: IdToken,
        refreshToken: RefreshToken || '',
        expiresIn: ExpiresIn || 3600,
        userId,
        username: credentials.username,
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<AuthUser | null> {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
      });

      const response = await cognito.send(command);
      
      if (!response.UserAttributes) {
        return null;
      }

      const attributes = response.UserAttributes;
      const userId = attributes.find(attr => attr.Name === 'sub')?.Value;
      const email = attributes.find(attr => attr.Name === 'email')?.Value;

      if (!userId || !email) {
        return null;
      }

      return {
        userId,
        username,
        email,
      };
    } catch (error) {
      console.error(`Error getting user with username ${username}:`, error);
      // If user doesn't exist, return null instead of throwing
      if ((error as Error).name === 'UserNotFoundException') {
        return null;
      }
      throw error;
    }
  }
}

export default new AuthRepository();