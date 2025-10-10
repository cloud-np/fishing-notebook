import { parse, HTMLElement } from "node-html-parser";
import { Barometric } from "./parser.const";

export class HTMLParser {
	private root: HTMLElement;

	constructor(html: string) {
		this.root = parse(html);
	}

	getElementById(id: string): HTMLElement | null {
		return this.root.querySelector(`#${id}`);
	}

	querySelector(selector: string): HTMLElement | null {
		return this.root.querySelector(selector);
	}
	querySelectorAll(selector: string): HTMLElement[] {
		return this.root.querySelectorAll(selector);
	}

	/**
	 * Parse barometer graphics elements
	 * Returns the three barometer states: ascending, stable, descending
	 */
	parseBarometerGraphics() {
		const ascending = this.getElementById(Barometric.Ascending);
		const stable = this.getElementById(Barometric.Stable);
		const descending = this.getElementById(Barometric.Descending);

		return {
			ascending: {
				element: ascending,
				text: ascending?.text?.trim() || null,
				html: ascending?.innerHTML || null,
				attributes: ascending?.attributes || {},
			},
			stable: {
				element: stable,
				text: stable?.text?.trim() || null,
				html: stable?.innerHTML || null,
				attributes: stable?.attributes || {},
			},
			descending: {
				element: descending,
				text: descending?.text?.trim() || null,
				html: descending?.innerHTML || null,
				attributes: descending?.attributes || {},
			},
		};
	}
}

/**
 * Helper function to quickly parse barometer graphics from HTML string
 */
export function parseBarometerGraphics(html: string) {
	const parser = new HTMLParser(html);
	return parser.parseBarometerGraphics();
}
