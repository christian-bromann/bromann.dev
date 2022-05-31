+++
author = "Christian Bromann"
title = "An Instant Development Environment for WebdriverIO"
date = "2022-05-16"
description = "I've taken Gitpod for a spin to check out if I could create a perfect dev environment for WebdriverIO to lower the barrier for contributions and speed up the onboarding process. In this blog post I will share my experience and the results of this experiment."
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

> I've taken Gitpod for a spin to check out if I could create a perfect dev environment for WebdriverIO to lower the barrier for contributions and speed up the onboarding process. In this blog post I will share my experience and the results of this experiment.

Over the years the WebdriverIO project has grown in complexity especially with the move to a [Lerna](https://lerna.js.org/) monorepo and the transition to TypeScript. While we as core maintainers feel more or less comfortable in this environment, as we have been working with it for so long, we can __not__ expect this from every contributor of the project. Allowing everyone to make contributions is important to us and the time it takes to set up the project and get up and running quickly is critical to achieve this goal. That is why we are collaborating with [Gitpod](https://www.gitpod.io/) to provide instant ephemeral development environments for all 🙌

Gitpod is an open source developer platform that tries to remove all friction from the developer experience to be always ready-to-code and make software engineering more collaborative, joyful, and secure<sup>[1](https://www.gitpod.io/about)</sup>. They provide a [complimentary professional open source plan](https://www.gitpod.io/for/opensource) that allows all open source projects to leverage the capabilities of their platform for all your contributors.

I took this for a spin and configured the project so that everyone can develop through a Gitpod environment without having to setup anything. To get started all I needed was to create a [`.gitpod.yml`](https://github.com/webdriverio/webdriverio/blob/main/.gitpod.yml) file which you can find in the root directory of the project. This tells Gitpod to setup a Node.js environment with a set of predefined tasks. The container image is defined through Docker to ensure we have Chrome and other important dependencies installed. Thanks to Gitpods [pre-build feature](https://www.gitpod.io/docs/prebuilds) everything that is required to create this environment is already handled by them in the background so it is ready for you (almost) immediately.

## The New Setup 🌟

If you develop in VSCode like me, from now on you can start working on WebdriverIO by opening:

```txt
https://gitpod.io/#https://github.com/webdriverio/webdriverio
```

or if you like to review a pull request you can go straight to, e.g.:

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

## Conclusion

I've never really used Gitpod before but after joining [Stateful](https://www.stateful.com/) I spend a lot of time looking into the IDE ecosystem and [DevX](https://redmonk.com/jgovernor/2022/02/21/what-is-developer-experience-a-roundup-of-links-and-goodness/) in general and found that ephemeral workspaces and intelligent development environments have a huge potential to change the way we build software. From ephemeral workspaces provided by [Gitpod](https://www.gitpod.io/) and [GitHub Codespaces](https://github.com/features/codespaces) to new kind of IDEs like [Zed](https://zed.dev/) there is a lot of development in the space.

While writing this blog post I had the chance to test Gitpod thoroughly for over 2 weeks now. Overall I have to say it is a great experience, if there wouldn't be so many little issues here and there that kind of ruin it overall and might be the reason why I haven't seen so many folks using it. That said, Gitpod provides the better platform overall and is not only [cheaper](https://blog.okikio.dev/github-codespaces-vs-gitpod-choosing-the-best-online-code-editor) than Codespaces but also much simpler to setup. I particularly like the fact that you can have multiple ["tasks"](https://github.com/webdriverio/webdriverio/blob/main/.gitpod.yml#L4-L28) defined that later show up in the terminal view in VSCode. This allows to have certain processes running for the user when they open the workspace like a static server for the website or your unit test runner as described above. Unfortunately the [`devcontainer.json`](https://code.visualstudio.com/docs/remote/devcontainerjson-reference) format doesn't allow for that though has some other neat capabilities like [devcontainer features](https://code.visualstudio.com/docs/remote/containers#_dev-container-features-preview) that help you install some dependencies easily.

Overall I see two major drawbacks that let me doubt whether it is a good idea to __only__ work in ephemeral workspaces from now on. First, it is incredibly difficult to set up a proper terminal in the workspace. While both Gitpod and Codespaces allow you to define a [dotfiles repository](https://wiki.archlinux.org/title/Dotfiles), there aren't many resources or tools that help you get comfortable on the remote machine. I am myself a [p10k](https://github.com/romkatv/powerlevel10k) user and spend many hours to get it running. It however still fails to render [Nerd Fonts](https://github.com/ryanoasis/nerd-fonts) properly on both browser and native VSCode. At the end of the day the terminal often is the developers closest friend and if that one feels foreign than the whole experience suffers.

Lastly, while the VSCode team has done a tremendous job to create such a great remote development experience, I still feel we are a bit early and bugs inevitably sneak in impacting the development experience. At one point my terminal [broke](https://github.com/microsoft/vscode-js-debug/issues/629) for random reasons and didn't allow me to run any command anymore which made me very nervous as it seemed I've lost all my changes. Furthermore random connection issues can lead to annoying lags where the TypeScript compiler and intellisense becomes very unreliable. I think all those issues will soon vanish as technology matures.

I am very much looking forward to seeing if folks use the new ephemeral workspace provided by Gitpod to contribute to the project and whether this has an impact on the contributing count. I also very much appreciate Gitpod for their open source initiative.

Thank you for reading!
