import { prisma } from './prisma';
import type { Organization } from '.prisma/client';

/**
 * Partial response that we receive from Crowdin's OAuth service when we
 * request an **app** token.
 */
interface CrowdinTokenData {
  access_token: string;
  expires_in: number;
}

/**
 * Exchange the application credentials for a short-lived Crowdin access token.
 *
 * Crowdin provides a dedicated **App Authorization Flow** which is slightly
 * different from the regular OAuth 2.0. We post the app credentials together
 * with the user-ID and organisation domain to obtain an access token that is
 * valid only for the requested organisation.
 *
 * On success the function returns the `access_token` value and its expiry time
 * expressed as an **absolute** unix timestamp (seconds). On failure it throws
 * a descriptive `Error`.
 */
export async function refreshCrowdinToken(orgData: {
  appId: string;
  appSecret: string;
  domain: string;
  userId: number;
}): Promise<{ accessToken: string; accessTokenExpires: number }> {
  const { CROWDIN_CLIENT_ID, CROWDIN_CLIENT_SECRET, AUTH_URL } = process.env;

  if (!CROWDIN_CLIENT_ID || !CROWDIN_CLIENT_SECRET || !AUTH_URL) {
    console.error('Missing environment variables for Crowdin OAuth in refreshCrowdinToken');
    throw new Error('Server configuration error related to Crowdin OAuth.');
  }

  const oauthPayload = {
    grant_type: 'crowdin_app',
    client_id: CROWDIN_CLIENT_ID,
    client_secret: CROWDIN_CLIENT_SECRET,
    app_id: orgData.appId,
    app_secret: orgData.appSecret,
    domain: orgData.domain,
    user_id: orgData.userId,
  };

  let tokenData: CrowdinTokenData;
  try {
    const tokenResponse = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(oauthPayload),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();

      console.error(
        `Error from Crowdin auth during token refresh: ${tokenResponse.status} ${errorText}`
      );

      throw new Error(`Failed to refresh Crowdin token. Status: ${tokenResponse.status}`);
    }

    tokenData = (await tokenResponse.json()) as CrowdinTokenData;
  } catch (error) {
    console.error('Network or other error during Crowdin token refresh:', error);

    throw error instanceof Error
      ? error
      : new Error('Authentication request failed during token refresh');
  }

  return {
    accessToken: tokenData.access_token,
    accessTokenExpires: Math.round(Date.now() / 1000) + tokenData.expires_in,
  };
}

/**
 * Retrieve a valid Crowdin access token for the given internal organisation.
 *
 * If the currently stored token is still valid (with at least 60 seconds
 * buffer) we reuse it. Otherwise we request a new token via
 * `refreshCrowdinToken`, persist it in the database and return the fresh
 * token.
 *
 * @param internalOrgId – The primary key of the organisation in our own DB.
 * @returns A short-lived Crowdin access token ready to be used in API calls.
 */
export async function getValidOrganizationToken(internalOrgId: string): Promise<string> {
  const organization: Organization | null = await prisma.organization.findUnique({
    where: { id: internalOrgId },
  });

  if (!organization) {
    console.error(`Organization with internal ID ${internalOrgId} not found.`);

    throw new Error('Organization not found for token retrieval.');
  }

  const nowInSeconds = Math.round(Date.now() / 1000);
  const tokenBufferSeconds = 60;

  if (
    organization.accessToken &&
    organization.accessTokenExpires &&
    organization.accessTokenExpires > nowInSeconds + tokenBufferSeconds
  ) {
    return organization.accessToken;
  }

  const newTokenData = await refreshCrowdinToken({
    appId: organization.appId,
    appSecret: organization.appSecret,
    domain: organization.domain || '',
    userId: organization.userId,
  });

  const updatedOrganization = await prisma.organization.update({
    where: { id: organization.id },
    data: {
      accessToken: newTokenData.accessToken,
      accessTokenExpires: newTokenData.accessTokenExpires,
    },
  });

  return updatedOrganization.accessToken;
}
