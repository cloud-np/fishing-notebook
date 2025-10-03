export namespace Helpers {
	export const formatDate = (date: Date): string => (
		new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	export const slugify = (str: string): string => (
		str
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '')
	)

	export const generateCategoryData = (categories: Set<string>): { name: string, slug: string }[] => (
		[...categories].map(category => ({
			name: category,
			slug: `${slugify(category)}`,
		}))
	)

	export const normalizeIndex = (nonNormalIndex: number, arrLen: number): number => {
		if (nonNormalIndex >= arrLen) {
			return arrLen - 1;
		} else if (nonNormalIndex < 0) {
			return 0;
		}
		// At this point is safe/normal
		return nonNormalIndex;
	}

}