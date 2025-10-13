import type { Location } from "@types";

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

export const locationState = new LocationState();
