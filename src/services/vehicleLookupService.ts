import { Env } from '@/libs/Env';

type DvlaVehicleResponse = {
  registrationNumber?: string;
  make?: string;
  model?: string;
  colour?: string;
  fuelType?: string;
  engineCapacity?: number;
  yearOfManufacture?: number;
  monthOfFirstRegistration?: string;
  revenueWeight?: number;
  taxStatus?: string;
  taxDueDate?: string;
  sorn?: boolean | string;
  co2Emissions?: number;
  dateOfLastV5CIssued?: string;
  wheelplan?: string;
  [key: string]: unknown;
};

type MotTest = {
  completedDate?: string;
  testResult?: string;
  expiryDate?: string;
  odometerValue?: number;
  odometerUnit?: string;
  odometerResultType?: string;
  motTestNumber?: string;
  rfrAndComments?: Array<{
    text?: string;
    type?: string;
    dangerous?: boolean;
  }>;
  [key: string]: unknown;
};

type MotHistoryResponse = {
  registration?: string;
  make?: string;
  model?: string;
  firstUsedDate?: string;
  fuelType?: string;
  primaryColour?: string;
  motStatus?: string;
  motExpiryDate?: string;
  motTests?: MotTest[];
  [key: string]: unknown;
};

const DVLA_VES_API_URL
  = Env.DVLA_VES_API_URL
    || 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles';

let motTokenCache:
  | {
    token: string;
    expiresAt: number;
  }
  | null = null;

const getNormalizedRegistration = (registration: string): string =>
  registration.trim().toUpperCase().replace(/\s+/g, '');

export async function fetchDvlaVehicle(
  registration: string,
): Promise<DvlaVehicleResponse | null> {
  const normalizedRegistration = getNormalizedRegistration(registration);

  if (!Env.DVLA_VES_API_KEY) {
    console.warn(
      '[DVLA] DVLA_VES_API_KEY is not set. Skipping DVLA vehicle lookup.',
    );
    return null;
  }

  try {
    const response = await fetch(DVLA_VES_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': Env.DVLA_VES_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registrationNumber: normalizedRegistration }),
      cache: 'no-store',
    });

    const text = await response.text();

    if (!response.ok) {
      // Try to parse JSON error if possible for better debugging
      let errorBody: unknown = text;
      try {
        errorBody = JSON.parse(text);
      } catch {
        // ignore JSON parse error, keep text
      }

      console.error(
        `[DVLA] Vehicle lookup failed with status ${response.status}`,
        errorBody,
      );
      throw new Error(
        `DVLA vehicle lookup failed with status ${response.status}`,
      );
    }

    let data: DvlaVehicleResponse;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[DVLA] Failed to parse DVLA response JSON', parseError);
      throw new Error('Failed to parse DVLA response JSON');
    }

    return data;
  } catch (error) {
    console.error('[DVLA] Vehicle lookup error:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

async function getMotAccessToken(): Promise<string | null> {
  if (
    !Env.MOT_HISTORY_TOKEN_URL
    || !Env.MOT_HISTORY_CLIENT_ID
    || !Env.MOT_HISTORY_CLIENT_SECRET
    || !Env.MOT_HISTORY_SCOPE
  ) {
    console.warn(
      '[MOT] MOT history OAuth environment variables are not fully configured. Skipping MOT lookup.',
    );
    return null;
  }

  const now = Date.now();
  if (motTokenCache && motTokenCache.expiresAt > now + 60_000) {
    return motTokenCache.token;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: Env.MOT_HISTORY_CLIENT_ID,
    client_secret: Env.MOT_HISTORY_CLIENT_SECRET,
    scope: Env.MOT_HISTORY_SCOPE,
  });

  try {
    const response = await fetch(Env.MOT_HISTORY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      cache: 'no-store',
    });

    const json = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      [key: string]: unknown;
    };

    if (!response.ok || !json.access_token) {
      console.error(
        `[MOT] Failed to obtain access token. Status: ${response.status}`,
        json,
      );
      throw new Error(
        `Failed to obtain MOT access token (status ${response.status})`,
      );
    }

    const expiresInSeconds
      = typeof json.expires_in === 'number' ? json.expires_in : 3600;

    motTokenCache = {
      token: json.access_token,
      // Subtract 60 seconds as a safety buffer
      expiresAt: now + (expiresInSeconds - 60) * 1000,
    };

    return json.access_token;
  } catch (error) {
    console.error('[MOT] Error obtaining access token:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function fetchMotHistory(
  registration: string,
): Promise<MotHistoryResponse | null> {
  const normalizedRegistration = getNormalizedRegistration(registration);

  if (!Env.MOT_HISTORY_VEHICLE_URL || !Env.MOT_HISTORY_API_KEY) {
    console.warn(
      '[MOT] MOT_HISTORY_VEHICLE_URL or MOT_HISTORY_API_KEY not set. Skipping MOT history lookup.',
    );
    return null;
  }

  const accessToken = await getMotAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const url = new URL(`${Env.MOT_HISTORY_VEHICLE_URL}/${normalizedRegistration}`);
    url.searchParams.set('registration', normalizedRegistration);
    console.log('MOT history URL:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-API-Key': Env.MOT_HISTORY_API_KEY,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const text = await response.text();

    if (!response.ok) {
      let errorBody: unknown = text;
      try {
        errorBody = JSON.parse(text);
      } catch {
        // ignore JSON parse error, keep text
      }

      console.error(
        `[MOT] MOT history lookup failed with status ${response.status}`,
        errorBody,
      );
      throw new Error(
        `MOT history lookup failed with status ${response.status}`,
      );
    }

    let data: MotHistoryResponse;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('[MOT] Failed to parse MOT history response JSON', parseError);
      throw new Error('Failed to parse MOT history response JSON');
    }

    return data;
  } catch (error) {
    console.error('[MOT] MOT history lookup error:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}
