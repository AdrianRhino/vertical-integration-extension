exports.main = async (context = {}) => {
  try {
    // Support both camelCase (serverless.json) and UPPER_SNAKE (HubSpot Secrets convention)
    const beaconUsername = process.env.beaconUsername || process.env.BEACON_USERNAME;
    const beaconPass = process.env.beaconPass || process.env.BEACON_PASSWORD;

    return {
      statusCode: 200,
      body: {
        beaconUsername: beaconUsername ?? null,
        beaconPass: beaconPass ?? null,
      },
    };
  } catch (error) {
    console.error('beaconLogin error:', error.message);
    return {
      statusCode: 500,
      body: {
        error: { message: error.message || 'Beacon login failed', code: 'BEACON_LOGIN_ERROR' },
      },
    };
  }
};