/**
 * Earth's hemispheres.
 */
export enum Hemisphere {
	NORTHERN = "Northern",
	SOUTHERN = "Southern",
}

/**
 * Enumeration of lunar phases
 */
export enum LunarPhase {
	NEW = "New",
	WAXING_CRESCENT = "Waxing Crescent",
	FIRST_QUARTER = "First Quarter",
	WAXING_GIBBOUS = "Waxing Gibbous",
	FULL = "Full",
	WANING_GIBBOUS = "Waning Gibbous",
	LAST_QUARTER = "Last Quarter",
	WANING_CRESCENT = "Waning Crescent",
}

/**
 * Lunar month, time between two successive syzygies of the
 * same type: new moons or full moons
 */
export enum LunarMonth {
	ANOMALISTIC = "Anomalistic",
	DRACONIC = "Draconic",
	SIDEREAL = "Sidereal",
	SYNODIC = "Synodic",
	TROPICAL = "Tropical",
}

/**
 * Timestamp epoch, January 1, 1970, in Julian Days.
 */
export const EPOCH = 2440587.5;

/**
 * Lunation 1 as the first new moon of 1923 at approximately
 * 02:41 UTC, January 17, 1923 per Ernest William Brown's lunar theory.
 */
export const LUNATION_BASE_JULIAN_DAY = 2423436.6115277777;

/**
 * Length of one phase (1/8 of a synodic month) in Earth days.
 */
export const PHASE_LENGTH = 3.69132346322;

/**
 * Orbital period of the Moon from perigee to apogee and back to perigee
 */
export const ANOMALISTIC_MONTH = 27.55454988;

/**
 * Length of one synodic month - lunation, or days for the phases to complete a cycle.
 * Time between two identical syzygies, equivalent of 29.53059 Earth days.
 *
 * Based on Mean Synodic Month, 2000 AD mean solar days.
 */
export const SYNODIC_MONTH = 29.53058770576;

/**
 * Units of measure
 */
export enum Unit {
	EARTH_RADII = "Earth Radii",
	KILOMETERS = "km",
	MILES = "m",
}

/**
 * Enumeration of lunar phases as emoji for the Northern Hemisphere.
 */
export enum NorthernHemisphereLunarEmoji {
	NEW = "🌑",
	WAXING_CRESCENT = "🌒",
	FIRST_QUARTER = "🌓",
	WAXING_GIBBOUS = "🌔",
	FULL = "🌕",
	WANING_GIBBOUS = "🌖",
	LAST_QUARTER = "🌗",
	WANING_CRESCENT = "🌘",
}

/**
 * Enumeration of lunar phases as emoji for the Southern Hemisphere.
 */
export enum SouthernHemisphereLunarEmoji {
	NEW = "🌑",
	WAXING_CRESCENT = "🌘",
	FIRST_QUARTER = "🌗",
	WAXING_GIBBOUS = "🌖",
	FULL = "🌕",
	WANING_GIBBOUS = "🌔",
	LAST_QUARTER = "🌓",
	WANING_CRESCENT = "🌒",
}
