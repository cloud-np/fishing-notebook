export const shareSocials = [
	{
		name: 'Share to Facebook.',
		url: 'https://www.facebook.com/sharer.php?u=[post-url]',
		icon: 'facebook',
	},
	{
		name: 'Share to X.',
		url: 'https://x.com/share?url=[post-url]&text=[post-title]',
		icon: 'x',
	},
	{
		name: 'Share to Pinterest.',
		url: 'https://pinterest.com/pin/create/bookmarklet/?media=[post-img]&url=[post-url]&is_video=[is_video]&description=[post-title]',
		icon: 'pinterest'
	},
	// {
	// 	name: 'Share to LinkedIn.',
	// 	url: 'https://www.linkedin.com/shareArticle?url=[post-url]&title=[post-title]',
	// 	icon: 'linkedin',
	// },
	// {
	// 	name: 'Share to Reddit.',
	// 	url: 'https://reddit.com/submit?url=[post-url]&title=[post-title]',
	// 	icon: 'reddit',
	// },
	// {
	//   name: 'Share to Telegram.',
	//   url: 'https://t.me/share/url?url=[post-url]&text=[post-title]',
	//   icon: 'mdi:telegram'
	// },
	{
		name: 'Email the Post.',
		url: 'mailto:?subject=[post-title]&body=[post-url]',
		icon: 'email',
	},
	// {
	//   name: 'Copy Link',
	//   url: '[post-url]',
	//   icon: 'mdi:content-copy'
	// },
	// {
	//   name: 'Save',
	//   url: '[post-url]',
	//   icon: 'mdi:bookmark'
	// },
] as const;
