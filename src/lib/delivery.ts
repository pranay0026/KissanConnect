import { User } from '@/models/schema';

interface Location {
    lat: number;
    lng: number;
}

export async function findBestPartner(pickupLocation: Location, serviceArea: string) {
    try {
        console.log('Finding best partner for:', { pickupLocation, serviceArea });

        // 1. Try to find partners with geospatial query (Preferred)
        // Note: This requires the 2dsphere index to be active.
        // If index is missing or query fails, we fallback to finding any available partner in the service area.

        let partners = await User.find({
            role: 'delivery',
            status: 'available',
            serviceArea: serviceArea,
            'currentLocation.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [pickupLocation.lng, pickupLocation.lat]
                    },
                    $maxDistance: 10000 // 10km radius
                }
            }
        }).limit(1);

        if (partners.length > 0) {
            console.log('Found partner via geospatial query:', partners[0]._id);
            return partners[0];
        }

        // 2. Fallback: Find any available partner in the service area (Round Robin / Load not handled here yet)
        console.log('No partner found via Geo query, falling back to Service Area check.');
        partners = await User.find({
            role: 'delivery',
            status: 'available',
            serviceArea: serviceArea
        }).limit(1);

        if (partners.length > 0) {
            console.log('Found partner via Service Area:', partners[0]._id);
            return partners[0];
        }

        console.log('No delivery partners available.');
        return null;

    } catch (error) {
        console.error('Error finding delivery partner:', error);

        // Final Fallback in case of geospatial error (e.g. index missing)
        try {
            const partner = await User.findOne({
                role: 'delivery',
                status: 'available',
                serviceArea: serviceArea
            });
            return partner;
        } catch (e) {
            return null;
        }
    }
}
