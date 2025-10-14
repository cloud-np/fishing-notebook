import type { Location, Trip } from "@types";

class LocationState {
	location = $state<Partial<Location>>({
		carDifficulty: 0,
		walkDifficulty: 0,
		rating: 0,
	});

	reset() {
		this.location = {
			carDifficulty: 0,
			walkDifficulty: 0,
			rating: 0,
		};
	}

	set(newLocation: Partial<Location>) {
		this.location = { ...newLocation };
	}
}

class TripState {
	trip = $state<Trip | undefined>(undefined);

	set(newTrip: Trip | undefined) {
		this.trip = newTrip;
	}
}

export const locationState = new LocationState();
export const tripState = new TripState();
