import { type CollectionEntry, getCollection } from "astro:content";
import readingTime from "reading-time";

// const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

export const getPosts = async (limit: number | undefined): Promise<Post[]> => {
	const rawPosts = await getCollection("blog");
	const sortedRawPosts = rawPosts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());

	const normalizedPosts = sortedRawPosts.map(rawPost => {
		// const { data, ...restOfRawPost } = rawPost;
		let readingTimeMinutes = Math.floor(readingTime(rawPost.body ?? "").minutes);

		if (readingTimeMinutes < 1) {
			readingTimeMinutes = 1;
		}

		const slug = generateSlug(rawPost.data.href);
		const post: Post = {
			...rawPost,
			// ...data as RawPostData,
			id: rawPost.id,
			slug,
			collection: rawPost.collection,
			href: getRawPostHref(slug),
			minutesRead: `${readingTimeMinutes}min`,
		};
		return post;
	});

	const posts = normalizedPosts.map((normPost, index) => {
		const post = {
			...normPost,
		};

		const prevPost = normalizedPosts[index + 1];
		if (prevPost) {
			post.next = {
				href: getRawPostHref(prevPost.slug),
				title: prevPost.data.title,
			};
		}

		const nextPost = normalizedPosts[index - 1];

		if (nextPost) {
			post.prev = {
				href: getRawPostHref(nextPost.slug),
				title: nextPost.data.title,
			};
		}
		return post;
	});

	if (limit) {
		return posts.slice(0, limit);
	}
	return posts;
};

const getRawPostHref = (slug: string): string => {
	return `/blog/${slug}`;
};

export function generateSlug(title: string) {
	return title
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

type RawPostWithOutData = Omit<CollectionEntry<"blog">, "data" | "body">;

interface RawPostData {
	title: string;
	titleImage: LoadedImage;
	previewImage: LoadedImage;
	publishedAt: Date;
	category: string;
	searchCategories: string[];
	personal: boolean;
	href: string;
	author?: string;
}

export interface Post extends RawPostWithOutData {
	href: string;
	data: RawPostData;
	minutesRead: string;
	slug: string;
	next?: PostLink;
	prev?: PostLink;
}

export interface PostLink {
	title: string;
	href: string;
}

export interface LoadedImage {
	src: string;
	width: number;
	height: number;
	format: "png" | "jpg" | "jpeg" | "tiff" | "webp" | "gif" | "svg" | "avif";
}
