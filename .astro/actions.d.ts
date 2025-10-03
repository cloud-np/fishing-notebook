declare module "astro:actions" {
	type Actions = typeof import("/home/cloud/Programming/my-repos/fishing-notebook/src/actions/index.ts")["server"];

	export const actions: Actions;
}