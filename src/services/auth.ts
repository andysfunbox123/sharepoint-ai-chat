import { PublicClientApplication, AuthenticationResult, Configuration } from '@azure/msal-browser';
import { config } from '../config';

let msalInstance: PublicClientApplication | null = null;

const msalConfig: Configuration = {
  auth: {
    clientId: config.msalConfig.clientId,
    authority: config.msalConfig.authority,
    redirectUri: config.msalConfig.redirectUri,
    postLogoutRedirectUri: config.msalConfig.postLogoutRedirectUri,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

// Initialize MSAL immediately when the module loads
(async function initMsal() {
  try {
    msalInstance = new PublicClientApplication(msalConfig);
    await msalInstance.initialize();
    console.log('MSAL initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MSAL:', error);
  }
})();

const loginRequest = {
  scopes: ['User.Read', 'Files.Read.All', 'Sites.Read.All']
};

export async function login(): Promise<AuthenticationResult> {
  if (!msalInstance) {
    throw new Error('MSAL not initialized');
  }

  try {
    return await msalInstance.loginPopup(loginRequest);
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function getToken(): Promise<string> {
  if (!msalInstance) {
    throw new Error('MSAL not initialized');
  }

  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length === 0) {
    throw new Error('No account found');
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0]
    });
    return response.accessToken;
  } catch (error) {
    console.error('Error getting token:', error);
    throw error;
  }
}

export async function logout() {
  if (!msalInstance) {
    throw new Error('MSAL not initialized');
  }

  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length > 0) {
    try {
      await msalInstance.logoutPopup({
        account: accounts[0],
        postLogoutRedirectUri: config.msalConfig.postLogoutRedirectUri
      });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}