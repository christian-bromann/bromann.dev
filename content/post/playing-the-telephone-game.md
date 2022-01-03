+++
author = "Christian Bromann"
title = "Sync App State across JS Sandboxes without Stumbling over postMessage & onMessage Playing “Telephone”"
date = "2021-12-23"
description = "In this post you will learn how to use the new JS/TS module Tangle to implement seamless event handling and app state sync across multiple JavaScript sandboxes without getting caught up in postMessage & onMessage synchronization dilemmas."
tags = [
    "vscode",
    "extension",
    "stateful",
]
categories = [
    "vscode",
    "stateful",
]
images = [
    "https://media.graphcms.com/HLTh3fPfQPS42DGLcb4Q"
]
series = ["VSCode Extension Development"]
+++

> This blog post was originally posted on the [Stateful blog](https://stateful.com/blog/telephone-game-of-postmessage).

In this post you will learn how to use the new JS/TS module [Tangle](https://github.com/stateful/tangle) to implement seamless event handling and app state sync across multiple JavaScript sandboxes without getting caught up in postMessage & onMessage synchronization dilemmas.

You've played it with your friends as a child: the telephone game, a little interactive exercise where it is important to understand a message from your left partner and transmit it correctly to your right one. The catch: you have to whisper it so that no one, other than the actual receiver understands the message. It feels a lot like trying to share events or a app state across different JavaScript sandboxes, e.g. between [Inline Frames](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe), [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API#web_workers_concepts_and_usage), [Worker Threads](https://nodejs.org/api/worker_threads.html) or webviews in [VS Code](https://code.visualstudio.com/) extensions.

The latter use case is particularly interesting for VS Code extension developers who work with multiple extension webviews and have to organise how app state is kept in sync between them. An all too common use case for custom editor implementations or views outside the native VS Code UI toolbox. Let’s say our example extension offers a todo list as a panel in the left sidebar of the workbench. The same todo list could also be viewed as a webview within the IDE editor area. Now both todo lists are rendered as separate webviews within their own respective sandbox environment. No shared javascript objects, no shared renderer, no shared memory.

This, without much effort, quickly becomes quite complex if you want to ensure that adding a todo item in one list immediately updates all other webviews. After all swift interaction responsiveness is a staple of excellent UX design. At [Stateful](https://stateful.com/) we faced this exact problem when we built [Marquee](https://marketplace.visualstudio.com/items?itemName=activecove.marquee), the missing homescreen for VS Code.

![Marquee VSCode Extension](https://media.graphcms.com/HLTh3fPfQPS42DGLcb4Q "Illustrate sync of app state across webviews and workbench (native-vscode) JS sandboxes as implemented in Marquee")

After solving this problem not just once, we wound up generalizing our implementation, packaged it up for you, to provide you with a high-level API to solve event/state sync for arbitrary JavaScript environments. With [Tangle](https://www.npmjs.com/package/tangle) you can initiate channels to manage state and/or event updates across multiple JavaScript sandboxes. It’s like an event emitter on steroids that is able to look beyond the universe of a single JavaScript sandbox. Once initialized you can both emit and listen to events as well as broadcast and subscribe to different state updates, in which state is just an arbitrary object with properties. If you wish, you can optionally use a TypeScript interface to formalize the state contract.

Let’s stick with the example mentioned above and share a list of todos across multiple webviews within a VS Code extension. Given that webviews, and their instances that allow us to post messages between them and the extension, are initialized at a random point in time, we found that working with observables is a perfect use case here, as it allows us to initialize the communication channel once webviews become available.

```ts
import {
    WebviewViewProvider,
    WebviewView,
    Webview,
    ExtensionContext,
    window
} from "vscode";
import { Subject } from 'rxjs';

class PanelViewProvider implements WebviewViewProvider {
    private _webview = new Subject<Webview>();

    resolveWebviewView(webviewView: WebviewView) {
        /**
         * trigger channel initiation
         */
        this._webview.next(webviewView.webview)

        // ...
    }

    public static register(context: ExtensionContext, identifier: string) {
        const panelProvider = new PanelViewProvider(context, identifier);
        context.subscriptions.push(window.registerWebviewViewProvider(identifier, panelProvider));
        return panelProvider;
    }

    /**
     * expose webview subject as observable to that the Tangle channel is
     * initiated once the webview exists
     */
    public get webview() {
        return this._webview.asObservable();
    }
}
```

Now when we create our webview panels in our extension `activate` method we just pass in all webviews into the Tangle initialization method to help it understand how to pass along messages.

```ts
export async function activate (context: vscode.ExtensionContext) {
    const examplePanel = TodoAppPanel.register(context, 'Panel1')
    const webviewPanel = vscode.window.createWebviewPanel(
        'column-one',
        'Example WebView Panel',
        vscode.ViewColumn.One,
        webviewOptions
    );

    const ch = new Channel('my-awesome-message-channel');
    const bus = await ch.registerPromise([
        examplePanel.webview,
        webviewPanel.webview,
    ])

    // ...
}
```

Lastly we just need to initiate a Tangle channel within our webview and everything is managed out of the box. The channel initiated in our main extension file acts as a hub and propagates messages from one webview to another. Within our webview we can access the instance by calling `acquireVsCodeApi`. Given this method can only be called once, you have pass in the result when initiating the communication channel, e.g.:

```ts
interface AppState {
    todos: string[]
}

const vscode = acquireVsCodeApi();
const channel = new Channel<AppState>(
    // channel name
    'my-awesome-message-channel',
    // default state
    { todos: [] }
);

const tangle = channel.attach(vscode);

tangle.listen('todos', (todos) => {
    // ... update todo list
});

// add new todo
$button.onClick = (todo) => tangle.broadcast({
    todos: [...tangle.state, todo]
});
```

Thanks to TypeScript we can formalize the contract of our app state via an TS interface to be sure that we emit only properties that have the correct type. There are two distinct differences between sharing events and sharing state:

- Sharing a state requires to provide a default state
- To listen and emit to state changes you have to use `listen` and `broadcast` while for events you have to use the event emitter interface where you have `on`, `once` and `emit` methods

We have experimented with various use cases which you can all find in our [examples](https://github.com/stateful/tangle/tree/main/examples) directory on GitHub. For example we applied the todo list use case to the well known TodoMVC example app which we put in separate iFrames. Updating the list in one frame automatically updates all other frames:

![Example showing Tangle using 4 iFrames](https://media.graphcms.com/8jvad9kFQuyl6RJHolNx "Example showing Tangle using 4 iFrames")

If you have ideas how we can extend Tangle to serve more use cases where sharing data is a problem, please [let us know](https://github.com/stateful/tangle/issues/new). For more documentation you can find the package on [NPM](https://www.npmjs.com/package/tangle) or [GitHub](https://github.com/stateful/tangle). We hope it will help some of you that have been dealing with this kind of edge case. It certainly helped us develop our Stateful VS Code extension where we help developers to understand their productivity through flow state. Come [check it out](https://marketplace.visualstudio.com/items?itemName=stateful.edge)!
