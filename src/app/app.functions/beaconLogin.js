exports.main = async (context = {}) => {

    const beaconUsername = process.env.beaconUsername;
    const beaconPass = process.env.beaconPass;

    return {
        body: {
            beaconUsername: beaconUsername,
            beaconPass: beaconPass
        }
    }
}