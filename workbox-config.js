module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{html,xml,css,jpeg,png,ico,svg,jpg,js,json,txt,woff2,webmanifest}',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css'
	],
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	],
	swDest: 'public/sw.js'
};
