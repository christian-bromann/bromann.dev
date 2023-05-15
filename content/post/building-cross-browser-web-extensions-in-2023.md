+++
author = "Christian Bromann"
title = "Building Cross Browser Web Extensions in 2023 - The Ultimate Guide"
date = "2023-05-15"
description = "In this post you will learn how to use the new JS/TS module Tangle to implement seamless event handling and app state sync across multiple JavaScript sandboxes without getting caught up in postMessage & onMessage synchronization dilemmas."
tags = [
    "browser",
    "web",
    "extension",
    "stateful",
]
categories = [
    "stateful",
]
images = [
    "https://media.graphassets.com/Dc5weLklTpCOBB2BR3Rg"
]
series = []
+++

> At Stateful I recently worked and launched a [web extension](https://github.com/stateful/runme-web-extension) that will help the company to bring [Runme](https://runme.dev) Notebook features into the browser. In this blog post I would like to share my learnings building a cross browser web extension.

The original version of this blog post was posted on the [Stateful blog](https://www.stateful.com/blog/debugging-github-workflows-with-vs-code).

The initial extension release currently adds a "Run with Runme" button to every repository and will help you to check out these projects and get up and running quickly. You can find it in the [Chrome Web Store](https://chrome.google.com/webstore/detail/runme-web-extension/lnihnbkolojkaehnkdmpliededkfebkk?hl=en&authuser=0) and for [Firefox](https://addons.mozilla.org/en-GB/firefox/addon/runme/).

I started based on a [template](https://github.com/akoskm/vite-react-tailwindcss-browser-extension) from [Akos Kemives](https://github.com/akoskm) and updated it based on current developments and new APIs that landed in the browser since the creation of the original template. You can find our current maintained [Web Extension Starter Kit](https://github.com/stateful/web-extension-starter-kit) on GitHub which can be your starting point for your extension.

![Run the Starter-Kit](https://media.graphassets.com/fUFX95mWRgSS1Qlvyvqg)

Let's have a look at how web extensions are set-up.

# Web Extension 1 on 1

Web extensions can enhance the browsing experience by adding features and functionality to the browser, providing things like Productivity tools, Web page content enrichment or Information aggregation. They are written with the same web technologies used to create web applications: HTML, CSS and JavaScript. An extension can consist of the following components:

- __The manifest:__ Located in the extensions root directory as manifest.json, this file defines important metadata information and resources, declares permissions, and identifies which files to run in the background and on the page.
- __The service worker:__ The extension service worker handles and listens for browser events. There are many types of events, such as navigating to a new page, removing a bookmark, or closing a tab. It can use all the browser APIs, but it cannot interact directly with the content of web pages; that’s the job of content scripts.
- __Content scripts:__ Content scripts execute Javascript in the context of a web page. They can also read and modify the DOM of the pages they're injected into. Content Scripts can only use a subset of the Chrome APIs but can indirectly access the rest by exchanging messages with the extension service worker.
- __The popup and other pages:__ An extension can include various HTML files, such as a popup, an options page, and other HTML pages. All these pages have access to Chrome APIs.

We will find all these components in our starter kit. You can remove them as you wish based on what your web extension is supposed to do.

# Start Developing
After you checked out the starter-kit repository using Runme, go ahead and install the dependencies through the Runme notebook. Next you can start the Chrome or Firefox browser with the extension loaded. You can make changes to the background, content or popup scripts and have them apply to the browser by reloading the extension, e.g. in Chrome on the `chrome://extensions/` page.

The demo extension showcases how the popup modal or a content script can make a request to an API through the same interface. It uses a [polyfill package](https://www.npmjs.com/package/webextension-polyfill) to ensure that the behavior is equal between Chrome and Firefox. Unfortunately this is currently still required as the [web standard for web extension](https://github.com/w3c/webextensions) shapes out.

The extension UI used in the injected content script as well as in the popup modal uses [React](https://react.dev/) with [TailwindCSS](https://tailwindcss.com/). If your extension heavily relies on injecting UI elements into a page, using a web-component would be the ideal choice as styling such an element in isolation assures that page styles don’t apply to the component. However browsers currently don’t have great support for [web-components in content scripts](https://github.com/w3c/webextensions/issues/210) which makes React with scoped TailwindCSS classes the best alternative solution.

You will notice that the project defines two separate `manifest.json` files. One that specifies a web extension according to the manifest version v3 and one with v2. This is required because Firefox currently does not support `web_worker` as background script. It overall seems that Firefox’s implementation of the manifest v3 API is way behind Chrome’s implementation which makes such setups necessary.

# Testing

The project has two different types of tests: UI component tests for our pop-up and content-script elements that get injected into the website as well as an end to end test that verifies whether the context script was actually injected properly into the website.

You can run the tests by calling `npm test` in your terminal or just pressing the Play Button in the Runme notebook view.

While the component test mock the interaction between UI component and backend script, the e2e tests actually validate the whole communication process between these interfaces. The `wdio.e2e.conf.ts` file that defines the e2e test run has a custom command defined called `openExtensionPopup` which finds your extension id and opens the popup window within a page frame to validate that the component behaves in the popup modal as expected.

## Releasing

In order to release our extension to [Google’s Web Store](https://chrome.google.com/webstore/category/extensions) and [Mozilla’s Addon platform](https://addons.mozilla.org/) (AMO) you can set-up a release action that automatically bundles and publishes it to these platforms. Make sure you create a developer account for both of them which in case of Google’s Web Store will cost you $5. They say the fee is to create better safeguards against fraudulent extensions in the gallery and limit the activity of malicious developer accounts.

For both platforms there are useful utility packages to manage extensions and allow publishing them from the command line or CI/CD:

- __Chrome Web Store:__ use the [fregante/chrome-webstore-upload](https://github.com/fregante/chrome-webstore-upload) package that can be used from the command line as well as within e.g. a GitHub Action. It comes with well written docs that also explain [how to obtain all necessary credentials](https://github.com/fregante/chrome-webstore-upload/blob/main/How%20to%20generate%20Google%20API%20keys.md#how-to-generate-google-api-keys) for publishing
- __Mozilla Addon:__ the Mozilla team maintains a handy command line tool for building, testing and publishing extensions called [web-ext](https://www.npmjs.com/package/web-ext)

You can find a ready to use Github workflow in the starter kit template that helps you to create new releases and have them automatically published to these platforms.

## Conclusion

When I began working on this project, I was filled with anticipation to witness the extent to which the standardization of building cross-platform browser extensions has progressed. Unfortunately it turned out that the development of the proposed APIs is far behind from what I would expect to be cross platform compatible. It seems that Chrome is ahead in the development of mentioned APIs compared to other browsers.

We intentionally left out Apple’s Safari completely because it seems to be most behind of all APIs and given its market share in the desktop space, which we believe our target audience for Runme to be in, it would not justify the effort.

After-all the biggest learning is that everyone attempting to build cross platform web extensions for browsers should be aware that there will be compatibility issues and workarounds needed to get to a satisfactory end result. While browser vendors are in process to standardize developing such extensions, more years will have to pass by until this experience becomes truly enjoyable.

We hope our starter kit will provide folks a good foundation to start building their extension with some useful scripts and commands that improve the developing experience.

Thanks for reading!
