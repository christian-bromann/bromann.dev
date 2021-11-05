module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{html,xml,css,jpeg,png,ico,svg,jpg,js,json,txt,woff,woff2,webmanifest}'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'public/sw.js'
};
