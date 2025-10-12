import { Moon } from "../Moon";
import { Hemisphere, LunarPhase } from "../lunar.const";

/**
 * Example usage of the Moon static functions
 */

// Example 1: Get current moon information
console.log("=== Current Moon Information ===");
const date = new Date();

const age = Moon.lunarAge(date).toFixed(2);

const agePercent = `${(Moon.lunarAgePercent(date) * 100).toFixed(2)}%`;
const lunation = Moon.lunationNumber(date);
const distance = Moon.lunarDistance(date).toFixed(2);
const phase = Moon.lunarPhase(date);
const phaseEmoji = Moon.lunarPhaseEmoji(date);
const isWaxing = Moon.isWaxing(date);
const isWaning = Moon.isWaning(date);

// Example 2: Compare hemispheres
console.log("\n=== Hemisphere Comparison ===");
const northernEmoji = Moon.lunarPhaseEmoji(date, { hemisphere: Hemisphere.NORTHERN });
const southernEmoji = Moon.lunarPhaseEmoji(date, { hemisphere: Hemisphere.SOUTHERN });
console.log(`Northern Hemisphere: ${northernEmoji}`);
console.log(`Southern Hemisphere: ${southernEmoji}`);

// Example 3: Historical date - First moon landing
console.log("\n=== Apollo 11 Moon Landing (July 20, 1969) ===");
const apollo11 = new Date("1969-07-20T20:17:40Z");
console.log(`Lunar Age: ${Moon.lunarAge(apollo11).toFixed(2)} days`);
console.log(`Phase: ${Moon.lunarPhase(apollo11)}`);
console.log(`Emoji: ${Moon.lunarPhaseEmoji(apollo11)}`);
console.log(`Lunation Number: ${Moon.lunationNumber(apollo11)}`);
console.log(`Distance: ${Moon.lunarDistance(apollo11).toFixed(2)} Earth radii`);

// Example 4: Moon phases throughout a month
console.log("\n=== Moon Phases - Next 30 Days ===");
for (let i = 0; i < 30; i += 3) {
	const futureDate = new Date();
	futureDate.setDate(futureDate.getDate() + i);

	const phase = Moon.lunarPhase(futureDate);
	const emoji = Moon.lunarPhaseEmoji(futureDate);
	const age = Moon.lunarAge(futureDate);

	console.log(`Day +${i}: ${emoji} ${phase.padEnd(16)} (Age: ${age.toFixed(1)} days)`);
}

// Example 5: Get emoji for specific lunar phases
console.log("\n=== All Lunar Phase Emojis (Northern Hemisphere) ===");
const allPhases = [
	LunarPhase.NEW,
	LunarPhase.WAXING_CRESCENT,
	LunarPhase.FIRST_QUARTER,
	LunarPhase.WAXING_GIBBOUS,
	LunarPhase.FULL,
	LunarPhase.WANING_GIBBOUS,
	LunarPhase.LAST_QUARTER,
	LunarPhase.WANING_CRESCENT,
];

allPhases.forEach(phase => {
	const emoji = Moon.emojiForLunarPhase(phase, { hemisphere: Hemisphere.NORTHERN });
	console.log(`${emoji} ${phase}`);
});

// Example 6: Find next full moon (approximate)
console.log("\n=== Finding Next Full Moon ===");
let searchDate = new Date();
let foundFullMoon = false;

for (let i = 0; i < 30; i++) {
	searchDate.setDate(searchDate.getDate() + 1);
	const phase = Moon.lunarPhase(searchDate);

	if (phase === LunarPhase.FULL && !foundFullMoon) {
		foundFullMoon = true;
		console.log(`Next Full Moon: ${searchDate.toLocaleDateString()}`);
		console.log(`  Age: ${Moon.lunarAge(searchDate).toFixed(2)} days`);
		console.log(`  Distance: ${Moon.lunarDistance(searchDate).toFixed(2)} Earth radii`);
		console.log(`  Lunation: ${Moon.lunationNumber(searchDate)}`);
		break;
	}
}

// Example 7: Fishing trip planning - check moon phases for specific dates
console.log("\n=== Fishing Trip Moon Conditions ===");
const tripDates = [new Date("2025-10-15"), new Date("2025-10-20"), new Date("2025-10-25")];

tripDates.forEach(date => {
	const phase = Moon.lunarPhase(date);
	const emoji = Moon.lunarPhaseEmoji(date);
	const isWaxing = Moon.isWaxing(date);
	const age = Moon.lunarAge(date);

	console.log(`\n${date.toLocaleDateString()}:`);
	console.log(`  ${emoji} ${phase}`);
	console.log(`  ${isWaxing ? "Waxing 🔼" : "Waning 🔽"}`);
	console.log(`  Age: ${age.toFixed(1)} days`);
	console.log(`  Distance: ${Moon.lunarDistance(date).toFixed(1)} Earth radii`);
});
