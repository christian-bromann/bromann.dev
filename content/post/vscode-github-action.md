+++
author = "Christian Bromann"
title = "The GitHub Action You Need to Publish VS Code Extensions"
date = "2022-03-29"
description = "In this blog post we’d like to share how Stateful releases its Marquee extension to the VS Code Marketplace and OpenVSX Registry through GitHub Actions."
tags = [
    "vscode",
    "extension",
    "github",
    "action",
    "cicd"
]
categories = [
    "vscode",
    "stateful",
]
images = [
    "https://media.graphcms.com/QPSqGLfZS6G35baJBTrU"
]
series = ["VSCode Extension Development"]
+++

> In this blog post we’d like to share how Stateful releases its Marquee extension to the VS Code Marketplace and OpenVSX Registry through GitHub Actions.

The original version of this blog post was posted on the [Stateful blog](https://www.stateful.com/blog/the-github-action-you-need-to-publish-vscode-extensions).

The term continuous integration and continuous delivery (short CI/CD) is a common best practice for software developers, including the ones building VS Code extensions. With the [VS Code update](https://code.visualstudio.com/updates/v1_63#_pre-release-extensions) from last November users have now access to pre-releases that allow developers to ship regular updates and offer testing out the latest cutting edge features from their extension to receive early feedback. In this blog post we’d like to share how Stateful releases its Marquee extension to the VS Code Marketplace and OpenVSX Registry through GitHub Actions. You can find a full example in the [Marquee repository](https://github.com/stateful/vscode-marquee/blob/main/.github/workflows/release.yml), feel free to copy and adapt it for your own extension.

![GitHub Action You Need to Publish VS Code Extensions](https://media.graphcms.com/QPSqGLfZS6G35baJBTrU)

While this release workflow doesn’t seem to look much different from other release pipelines and contains common steps like: setup ➡ build ➡ test ➡ compile ➡ push, you will see some interesting details we'd like to highlight that are very specific to VS Code developers.

The [first section of the workflow](https://github.com/stateful/vscode-marquee/blob/588e34c77477c5fc8253b17a197f53e649c01759/.github/workflows/release.yml#L3-L38) definition contains, next to the workflow name, the trigger event for the workflow. In our case we’ve decided to have our maintainers manually trigger the release through the GitHub UI. This allows us to define a set of handy parameters to define the release type (e.g. patch, minor or major), the release channel and whether we release should be published to the marketplace.

![image1.png](https://media.graphcms.com/8FHoLUkRiK0u0vFt9I3D)

The first workflow steps are pretty common, they checkout the repository, setup the environment and install all dependencies:

```yaml
// ...
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Clone Repository
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Setup Node version
        uses: actions/setup-node@v1
        with:
          node-version: 16
      - name: Install dependencies
        run: yarn install --frozen-lockfile
// ...
```

Most of the steps that come next are dependent on whether we run a stable or edge release. Both are fairly similar but differ when it comes to compiling TypeScript and environment variables. This will become clear after looking at the next steps that build the extension code:

```yaml
// ...
- name: Build Package
  run: yarn build:dev
  env:
    NODE_ENV: development
    MARQUEE_INSTRUMENTATION_KEY: ${{ secrets.MARQUEE_INSTRUMENTATION_KEY }}
  if: ${{ github.event.inputs.releaseChannel == 'edge' }}
- name: Build Package
  run: yarn build:prod
  env:
    NODE_ENV: production
    MARQUEE_INSTRUMENTATION_KEY: ${{ secrets.MARQUEE_INSTRUMENTATION_KEY }}
  if: ${{ github.event.inputs.releaseChannel == 'stable' }}
// ...
```

Behind the build command is a set of calls that compile our TypeScript code and runs Webpack either in development or production mode depending on the release channel we picked in the beginning. After this step you can either run your automated tests or jump directly into the release process. We first generate a changelog based on the commit messages between the last release and last commit. If you create pull requests for every bigger change set and squash these the changelog becomes fairly comprehensive:

```yaml
// ...
- name: Create Changelog
  run: |
    git log $(git describe --tags --abbrev=0)..HEAD --oneline &> ${{ github.workspace }}-CHANGELOG.txt
    cat ${{ github.workspace }}-CHANGELOG.txt
// ...
```

In the next steps we define the new release version. This version depends again on the release type, e.g. stable release: `v1.2.3` or edge release: `v1.2.3-edge.0`. Given that the VS Code Marketplace currently [doesn’t support](https://github.com/microsoft/vscode-vsce/issues/148#issuecomment-271210031) edge release versions, we’ve built [a little script](https://github.com/stateful/vscode-marquee/blob/c0b56270cecd767d544f1c837b1fa585d2b5f0bd/.github/scripts/updateEdgeVersion.js) that updates the version to something like `v1.2.1646405133` in which we replace the patch version number with a timestamp. This ensures that pre-releases will have a higher version than stable ones and that we can continuously make new pre-releases.

```yaml
// ...
- name: Setup Git
  run: |
    git config --global user.name "stateful-wombot"
    git config --global user.email "christian+github-bot@stateful.com"
- name: Get Current Version Number
  run: |
    CURRENT_VERSION=$(cat package.json | jq .version | cut -d'"' -f 2)
    echo "CURRENT_VERSION=$CURRENT_VERSION" >> $GITHUB_ENV
- name: Compile New Version (Edge)
  run: |
    RELEASE_VERSION=$(npx semver $CURRENT_VERSION -i pre${{ github.event.inputs.releaseType }} --preid edge)
    echo "RELEASE_VERSION=$RELEASE_VERSION" >> $GITHUB_ENV
    echo "Bump to $RELEASE_VERSION"
  if: ${{ github.event.inputs.releaseChannel == 'edge' && !contains(env.CURRENT_VERSION, 'edge') }}
- name: Compile New Version (Edge)
  run: |
    RELEASE_VERSION=$(npx semver $CURRENT_VERSION -i prerelease)
    echo "RELEASE_VERSION=$RELEASE_VERSION" >> $GITHUB_ENV
    echo "Bump to $RELEASE_VERSION"
  if: ${{ github.event.inputs.releaseChannel == 'edge' && contains(env.CURRENT_VERSION, 'edge') }}
- name: Compile New Version (Stable)
  run: |
    RELEASE_VERSION=$(npx semver $CURRENT_VERSION -i github.event.inputs.releaseType)
    echo "RELEASE_VERSION=$RELEASE_VERSION" >> $GITHUB_ENV
    echo "Bump to $RELEASE_VERSION"
  if: ${{ github.event.inputs.releaseChannel == 'stable' }}
- name: Version Package
  run: |
    npm version $RELEASE_VERSION
    git tag -a $RELEASE_VERSION -m "$RELEASE_VERSION"
// ...
```

Lastly we will package and publish our extension using the [Visual Studio Code Extension Manager](https://github.com/microsoft/vscode-vsce) and a GitHub Action called [HaaLeo/publish-vscode-extension](https://github.com/HaaLeo/publish-vscode-extension). The advantage of having the packaging and publishing step separated is that we can attach the compiled `.vsix` file as an artifact to the workflow and offer it as download. Make sure to generate a token (named in the workflow as `VSC_MKTP_PAT` and `OPEN_VSX_TOKEN`) to allow GitHub to publish your extension.

```yaml
// ...
- name: Package Extension (Edge)
  if: ${{ github.event.inputs.releaseChannel == 'edge' }}
  run: |
    node .github/scripts/updateEdgeVersion.js
    yarn vsce package --pre-release --yarn --no-git-tag-version --no-update-package-json -o "./marquee-$RELEASE_VERSION.vsix" ${{ github.event.inputs.additionalFlags }}
- name: Package Extension (Stable)
  run: yarn vsce package $RELEASE_VERSION --yarn --no-git-tag-version --no-update-package-json -o "./marquee-$RELEASE_VERSION.vsix" ${{ github.event.inputs.additionalFlags }}
  if: ${{ github.event.inputs.releaseChannel == 'stable' }}
- name: Publish to Visual Studio Marketplace (Edge)
  run: yarn vsce publish --packagePath "./marquee-$RELEASE_VERSION.vsix" --pre-release --yarn --no-git-tag-version --no-update-package-json -p ${{ secrets.VSC_MKTP_PAT }} ${{ github.event.inputs.additionalFlags }}
  if: ${{ github.event.inputs.publishMarketplace == 'yes' && github.event.inputs.releaseChannel == 'edge' }}
- name: Publish to Visual Studio Marketplace (Stable)
  run: yarn vsce publish --packagePath "./marquee-$RELEASE_VERSION.vsix" --yarn --no-git-tag-version --no-update-package-json -p ${{ secrets.VSC_MKTP_PAT }} ${{ github.event.inputs.additionalFlags }}
  if: ${{ github.event.inputs.publishMarketplace == 'yes' && github.event.inputs.releaseChannel == 'stable' }}
- name: Publish to Open VSX Registry (Edge)
  uses: HaaLeo/publish-vscode-extension@v1
  if: ${{ github.event.inputs.publishOpenVSX == 'yes' && github.event.inputs.releaseChannel == 'edge' }}
  with:
    preRelease: true
    pat: ${{ secrets.OPEN_VSX_TOKEN }}
    extensionFile: ./marquee-${{ env.RELEASE_VERSION }}.vsix
- name: Publish to Open VSX Registry (Stable)
  uses: HaaLeo/publish-vscode-extension@v1
  if: ${{ github.event.inputs.publishOpenVSX == 'yes' && github.event.inputs.releaseChannel == 'stable' }}
  with:
    preRelease: false
    pat: ${{ secrets.OPEN_VSX_TOKEN }}
    extensionFile: ./marquee-${{ env.RELEASE_VERSION }}.vsix
// ...
```

To conclude our release workflow we push our release commit and the new git tag back to GitHub, as well as attach the compiled extension file to the workflow using the [ncipollo/release-action](https://github.com/ncipollo/release-action) GitHub Action. This is intentionally done at the end of the workflow so that in case something went wrong during the process we don’t mark it as a new release:

```yaml
// ...
- name: Push Tags
  run: |
    git log -1 --stat
    git push origin main --tags
- run: |
    export GIT_TAG=$(git describe --tags --abbrev=0)
    echo "GIT_TAG=$GIT_TAG" >> $GITHUB_ENV
- name: GitHub Release
  uses: ncipollo/release-action@v1
  with:
    artifacts: "./marquee-*"
    bodyFile: ${{ github.workspace }}-CHANGELOG.txt
    tag: ${{ env.GIT_TAG }}
    prerelease: ${{ github.event.inputs.releaseChannel == 'edge' }}
```

And that’s it! A fairly easy to adopt GitHub workflow that you can adapt to make continuous stable and pre-releases. Please find us on [GitHub](https://github.com/stateful/vscode-marquee), [Discord](https://discord.com/channels/878764303052865537/900787619728871484), or [Gitter](https://discord.com/channels/878764303052865537/900787619728871484) if you have questions or suggestions. Don't forget to [follow us on Twitter](https://twitter.com/statefulhq).
