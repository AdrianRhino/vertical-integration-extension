interface TokenCache {
  token: string;
  expiresAt: number;
}

interface SessionCache {
  cookie: string;
  expiresAt: number;
}

const tokenCache = new Map<string, TokenCache>();
const sessionCache = new Map<string, SessionCache>();

export async function getABCToken(
  clientId: string,
  clientSecret: string,
  authUrl: string
): Promise<string> {
  const cacheKey = `abc_${clientId}`;
  const cached = tokenCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ABC OAuth failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 600;
    const expiresAt = Date.now() + (expiresIn - 60) * 1000;

    tokenCache.set(cacheKey, {
      token: accessToken,
      expiresAt,
    });

    return accessToken;
  } catch (error: any) {
    throw new Error(`Failed to acquire ABC token: ${error.message}`);
  }
}

export async function getSRSToken(
  clientId: string,
  clientSecret: string,
  authUrl: string
): Promise<string> {
  const cacheKey = `srs_${clientId}`;
  const cached = tokenCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.token;
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
      scope: 'ALL',
    });

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SRS OAuth failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    const expiresAt = Date.now() + (expiresIn - 60) * 1000;

    tokenCache.set(cacheKey, {
      token: accessToken,
      expiresAt,
    });

    return accessToken;
  } catch (error: any) {
    throw new Error(`Failed to acquire SRS token: ${error.message}`);
  }
}

export async function getBeaconSession(
  username: string,
  password: string,
  loginUrl: string,
  apiSiteId: string
): Promise<string> {
  const cacheKey = `beacon_${username}`;
  const cached = sessionCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.cookie;
  }

  try {
    const loginPayload = {
      username: username,
      password: password,
      siteId: 'homeSite',
      persistentLoginType: 'RememberMe',
      userAgent: 'desktop',
      apiSiteId: apiSiteId || 'UAT',
    };

    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Beacon login failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    if (data.messageCode) {
      throw new Error(`Beacon login error: ${data.messageCode} - ${data.messageInfo || data.message}`);
    }

    const setCookie = response.headers.get('set-cookie');
    if (!setCookie) {
      throw new Error('Beacon login did not return session cookie');
    }

    const sessionCookie = setCookie.split(';')[0];
    const expiresAt = Date.now() + 55 * 60 * 1000;

    sessionCache.set(cacheKey, {
      cookie: sessionCookie,
      expiresAt,
    });

    return sessionCookie;
  } catch (error: any) {
    throw new Error(`Failed to acquire Beacon session: ${error.message}`);
  }
}
