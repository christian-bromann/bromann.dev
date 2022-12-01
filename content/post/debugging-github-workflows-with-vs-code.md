+++
author = "Christian Bromann"
title = "But it works on MY machine! Debugging GitHub Workflows with VS Code"
date = "2022-12-01"
description = "Plagued by a test that passes locally but fails when run in CI? Learn how you can debug such flaky tests by attaching to a running Github workflow."
tags = [
    "vscode",
    "github",
    "action",
    "workflow",
    "cicd"
]
categories = [
    "vscode",
    "github",
]
images = [
    "https://media.graphassets.com/hASMTTSQRPiC72E29ZUG"
]
series = ["VSCode Extension Development"]
+++

> Plagued by a test that passes locally but fails when run in CI, learn how you can debug such flaky tests by attaching to a running Github workflow.

The original version of this blog post was posted on the [Stateful blog](https://www.stateful.com/blog/debugging-github-workflows-with-vs-code).

Any developer is probably familiar with the "flip the table" moment, when the well crafted test that you're ready merge into `main` fails with an error related to the CI environment. Why why why.

![Please don't try this at home](https://media.graphassets.com/Kj8EmL3ZSfRyNlGoHn1w)
> Please don't try this at home, seriously don't

Generally unit tests are less susceptible to this kind of failure, but as you add more layers of abstraction around your application or for integration testing things become increasingly brittle. Especially end-to-end tests are sensitive to the often absent GPU in CI workflows. The added complexity and the remote nature of CI jobs make the process of debugging difficult, slow, and cumbersome.

This problem is particularly important to us in our development experience at Stateful, because we are constantly pushing the boundaries of VS Code extensions and want end-to-end confidence when shipping every release. While our extensions tests technically run in a consistent "VS Code environment", the reality is that VS Code can behave very differently depending on how it's being used, particularly when running as Electron as opposed to a browser-based webapp on consumer hardware, data center servers, or, what's even more likely, inside a container leveraging a virtual frame buffer (e.g. `xvfb`).

![Attach VS Code to your running Github workflow](https://media.graphassets.com/IDN5qA7TfqcVqzhecUPg)
> Attach VS Code to your running Github workflow

Fortunately, a great solution just became available that utilizes VS Code's ability to connect to remote workspaces. Using the [Visual Studio Code Server](https://code.visualstudio.com/docs/remote/vscode-server) you can configure your Github workflow to start a VS Code server process that makes it easy connecting to the remote workflow execution to debug the problem. Yes, this sounds slightly mind-bending, however, you will indeed be able to use a hosted VS Code instance to tap into a running GitHub workflow. The VS Code Server leverages tunneling to connect both remote instances, the running workflow and the hosted VS Code web UX, transparently. Here's how we made this super easy for you:

Over at Stateful we created the [stateful/vscode-server-action](https://github.com/stateful/vscode-server-action) GitHub action to take advantage of a Github Action's lifecycle hook to just trigger a VS Code session when your tests fail. This action provides you with a configurable time window how long after tests failed you will be able to connect to the machine. If you don't connect in time, the workflow continues. Here is an example how you can apply it in your workflow:

```yaml
jobs:
 test:
   name: Test
   runs-on: ubuntu-latest
   permissions:
     actions: read
     contents: read
   steps:
   - ...
   - name: 🧪 Test
     run: yarn run test
   - name: 🐛 Debug Build
     uses: stateful/vscode-server-action@v1
     if: failure()
```

In the event of a failed build the action attempts to start a VS Code Server on the build machine and requests your authorization:

```
To grant access to the server, please log into https://github.com/login/device and use code 0328-F81A
```

If you don't authorize the machine until the timeout is hit, the build just continues. However if you do, a VS Code Server is started and it prints an URL to connect to, e.g.:

```
Open this link in your browser https://insiders.vscode.dev/+ms-vscode.remote-server/myMachine/github/workspace
```

You can also connect to it through your local VS Code application. Just open the URL, open the command palette and enter `Open in VS Code`. And voilà you are connected to GitHubs machine and can start debugging your tests:

![What it does](https://media.graphassets.com/xlXDcFBqT1yT2PMHVWl7)
> Try this at home instead: Fully integrated demo of the Github Action

This little action has helped us tremendously when it came to drilling into issues that only seem to occur in Github's CI. It's probably not hard to adapt the approach for other CI/CD platforms and serves as a poster-child how convenient and powerful VS Code remote debugging is.

One caveat is that bringing up the VS Code Server is currently coupled to Docker which does not allow it to be used with Windows and Mac runners (yet). There is [an open issue](https://github.com/stateful/vscode-server-action/issues/7) to unlock support for non-Docker environments.

Thanks for reading!
