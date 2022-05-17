+++
author = "Christian Bromann"
title = "An Instant Development Environment for WebdriverIO"
date = "2022-05-16"
description = "I've took Gitpod for a spin to check out if I could create a perfect dev environment for WebdriverIO to lower the barrier for contributions and speed up the onboarding process. In this blog post I will share my experience and the results of this experiment."
tags = [
    "gitpod",
    "vscode",
    "development",
    "environment",
    "ephemeral",
    "devx"
]
categories = [
    "webdriverio",
    "devx"
]
images = ["/images/development-environment-for-webdriverio/hero.png"]
series = []
+++

Over the years the WebdriverIO project has grown in complexity especially with the move to a [Lerna](https://lerna.js.org/) monorepo and the transition to TypeScript. While we as core maintainer feel more or less comfortable in this environment, as we have been working with it for so long, we can __not__ expect this from every contributor of the project. Allowing everyone to make contributions is important to us and the time it takes to set up the project and get up and running quickly is critical to achieve this goal. That is why we are collaborating with [Gitpod](https://www.gitpod.io/) to provide instant ephemeral development environments for all 🙌

Gitpod is an open source developer platform that tries to remove all friction from the developer experience to be always ready-to-code and make software engineering more collaborative, joyful, and secure<sup>[1](https://www.gitpod.io/about)</sup>. They provide a [complimentary professional open source plan](https://www.gitpod.io/for/opensource) that allows all open source projects to leverage the capabilties of their platform for all your contributors.

I took this for a spin and configured the project so that everyone can develop through a Gitpod environment without having to setup anything. To get started all I needed was to create a [`.gitpod.yml`](https://github.com/webdriverio/webdriverio/blob/main/.gitpod.yml) file which you can find in the root directory of the project. This tells Gitpod to setup a Node.js environment with a set of predefined tasks. The container image is defined through Docker to ensure we have Chrome and other important dependencies installed. Thanks to Gitpods [prebuild feature](https://www.gitpod.io/docs/prebuilds) everything that is required to create this environment is already handled by Gitpod in the background so it is ready for you immediately.

## The New Setup 🌟

If you develop in VSCode like me, from now on you can start working on WebdriverIO by opening:

```txt
https://gitpod.io/#https://github.com/webdriverio/webdriverio
```

or if you like to review a pull request you can go straight to:

```txt
https://gitpod.io/#https://github.com/webdriverio/webdriverio/pull/6744
```

For now I prefer to code using the VSCode application rather than the browser which requires me to connect to the workspace through SSH within VSCode. Maybe at some point I completely switch to the browser as a dev application but for now I like my workflow using my [iTerm2](https://iterm2.com/) terminal setup with [Powerlevel10k](https://github.com/romkatv/powerlevel10k) and [tmux](https://github.com/tmux/tmux).

Once started the development container is ready to be worked on. A friendly terminal message gives the contributor an overview about the available services and which scripts they can run when working with the code:

![Start a dev environment](/images/development-environment-for-webdriverio/start.gif 'Start a dev environment')
<aside style="text-align: center">Starting a new dev environment with Gitpod.</aside>

In the background the environment is running everything needed to make changes to the documentation page, so every update can be viewed in the preview:

![Make Changes to Documentation Page](/images/development-environment-for-webdriverio/docs-change.gif 'Make Changes to Documentation Page')
<aside style="text-align: center">Making changes to the documentation files allows to preview them directly.</aside>

Lastly, a watch task runs tests for all files you change during the development and provides an overview about your code coverage:

![Preview Code Coverage](/images/development-environment-for-webdriverio/tests.gif 'Preview Code Coverage')
<aside style="text-align: center">Monitoring code coverage changes during development.</aside>

## Conclusion and Next Steps

I've never really used Gitpod before but after joining [Stateful](https://www.stateful.com/) I spend a lot of time looking into the IDE ecosystem and [DevX](https://redmonk.com/jgovernor/2022/02/21/what-is-developer-experience-a-roundup-of-links-and-goodness/) in general and found that ephemeral workspaces and intelligent development environments have a huge potential to change the way we build software. Gitpod has done a great job creating a developer experience that allows so set up these environments very easily. Even though everything is still a bit too slow and sometimes flaky, I am convinced the current setup can help folks making a contribution without going through the hastle of setting up the project.

<!-- Explain experience after one week of developing through ephemeral workspaces -->
