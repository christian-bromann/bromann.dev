+++
author = "Christian Bromann"
title = "Component Testing with SafeTest vs. Cypress vs. WebdriverIO"
date = "2024-03-04"
description = "Netflix's recent launch of SafeTest, a component testing tool that gained rapid attention on social media, prompted a detailed comparison with Cypress by our friend Gleb Bahmutov, inspiring me to also evaluate it against WebdriverIO."
tags = [
    "browser",
    "web",
    "component testing",
    "webdriverio",
]
categories = [
    "webdriverio",
]
images = [
    "/images/safetest-cypress-webdriverio/safetest-vs-cypress-vs-webdriverio.png"
]
series = []
+++

> Netflix's recent launch of SafeTest, a component testing tool that gained rapid attention on social media, prompted a detailed comparison with Cypress by our friend Gleb Bahmutov, inspiring me to also evaluate it against WebdriverIO.

In the last year I've spend a lot of time working on component testing capabilities in WebdriverIO and we have come a long way to build out a strong set of feature that can compete with alternative solutions in the space. It was to my surprise that Netflix announced a new tool called [SafeTest](https://github.com/kolodny/safetest) which is build on top of Playwright. Generally a totally normal thing, especially in the JavaScript world where people love to build new tools. Seeing Gleb Bahmutov's [insightful comparison](https://glebbahmutov.com/blog/cypress-vs-safetest/#overrides-providers-etc) of the tool with Cypress sparked my curiosity, compelling me to undertake a similar analysis.

Let's use the same comparison framework Gleb laid out which looks into the following features:

- [Is it dev or prod dependency?](#is-it-dev-or-prod-dependency)
- [Installation](#installation)
- [Hello World Test](#hello-world-test)
- [Test speed](#test-speed)
- [Mocks and Spies](#mocks-and-spies)
- [Overrides and Providers](#overrides-and-providers)
- [Snapshot Support](#snapshot-support)
- [Dev Experience](#dev-experience)
- [Dev Support](#dev-support)
- [The final tally](#the-final-tally)

So let's get started 👏!

# Is it dev or prod dependency?

We'll start by looking at the [SafeTest example](https://github.com/kolodny/safetest/tree/main/examples) section where it seems that all examples define SafeTest as dependency, e.g.:

```json
{
  "dependencies": {
    "safetest": "file:../.."
  }
}
```

I think this is just a mistake on the author side as there is no indication that SafeTest actually needs to be a dependency. Gleb correctly points out that testing tools should remain a development dependency and should not be defined otherwise. This is how also WebdriverIO recommends it.

| Feature         | SafeTest | Cypress Component Testing (CT) | WebdriverIO |
|-----------------|----------|--------------------------------|-------------|
| __Dependency__  | ⚠️ prod   | 👍 dev                         | 👍 dev       |

# Installation

The setup guide provided in SafeTest's project readme falls short of being a comprehensive, step-by-step manual for initiating a simple component. It leaves several critical questions unaddressed, such as the specifics of the required tsconfig.json, the rationale behind using [Create React App](https://create-react-app.dev/) which has been deprecated by the React community, and the implications for projects utilizing ESM. My attempt to piece together the example files was ultimately abandoned due this error:

> Error: You cannot use --inspect without "--no-file-parallelism", "poolOptions.threads.singleThread" or "poolOptions.forks.singleFork"

I might have eventually navigated the setup successfully, but my aim was to gauge how user-friendly the process is, and unfortunately, it's far from being straightforward. Considering that the project is quite new, it's understandable that they haven't perfected an effortless onboarding experience yet.

Cypress on the other side stands out for offering an excellent developer experience during the onboarding process. Its well-designed user interface offers a seamless interaction, allowing users to intuitively assemble everything with ease. Similarly, WebdriverIO also delivers a straightforward and user-friendly setup, providing an equally accessible entry point for setting up a WebdriverIO project by running:

```sh
npm init wdio@latest .
```

Executing this command launches a configuration wizard that swiftly sets you up with a tailor-made configuration and sample component files for various frameworks. I've create a [tutorial video](https://www.youtube.com/watch?v=5vp_3tGtnMc) about this where I walk through this process within less than a minute.

| Feature           | SafeTest                | Cypress Component Testing (CT) | WebdriverIO       |
|-------------------|-------------------------|--------------------------------|-------------------|
| Dependency        | ⚠️ prod                  | 👍 dev                         | 👍 dev            |
| __Installation__  | 👎 manual               | 👍 auto                        | 👍 auto           |

# Hello World Test

All frameworks look very similar when it comes to simple examples like this one:

```ts
// SafeTest example
import { describe, it, expect } from 'safetest/vitest';
import { render } from 'safetest/react';

describe('a SafeTest example', () => {
  it('simple test', async () => {
    const { page } = await render(<div>Test1</div>);
    await expect(page.locator('text=Test1')).toBeVisible();
  });
});
```

or:

```ts
// Cypress example
describe('a Cypress example', () => {
  it('simple test', () => {
    cy.mount(<div>Test1</div>)
    cy.contains('Test1').should('be.visible')
  })
})
```

which looks very similar to WebdriverIO which using the very popular [Testing Library](https://testing-library.com/) project to render any element on the page:

```ts
// WebdriverIO example
import React from 'react'
import { expect, $ } from '@wdio/globals'
import { render } from '@testing-library/react'

describe('a WebdriverIO example', () => {
    it('simple test', async () => {
        const { container } = render(<div>Test1</div>)
        await expect($(container)).toHaveText('Test1')
    })
})
```

In a more complex scenario where we click on a button 500 times, all frameworks perform similarly, though I personally prefer WebdriverIO's syntax but that is my personal preference:

```tsx
// safetest-example/src/App.safetest.tsx
it('can do many interactions fast', async () => {
  const Counter = () => {
    const [count, setCount] = React.useState(0);
    return (
      <div>
        <button onClick={() => setCount(count + 1)}>Count is {count}</button>
      </div>
    );
  };
  const { page } = await render(<Counter />);
  await expect(page.locator('text=Count is 0')).toBeVisible();
  for (let i = 1; i <= 500; i++) {
    await page.locator('button:not(a)').click();
    await expect(page.locator(`text=Count is ${i}`)).toBeVisible();
  }
});
```

The equivalent Cypress component test:

```tsx
// cypress-example/src/App.cy.tsx
it('can do many interactions fast', () => {
  const Counter = () => {
    const [count, setCount] = React.useState(0)
    return (
      <div>
        <button onClick={() => setCount(count + 1)}>Count is {count}</button>
      </div>
    )
  }
  cy.mount(<Counter />)
  cy.contains('Count is 0').should('be.visible')
  for (let i = 1; i <= 500; i++) {
    cy.get('button:not(a)').click()
    cy.contains(`Count is ${i}`).should('be.visible')
  }
})
```

Finally, the WebdriverIO example:

```tsx
// webdriverio-example/src/App.test.tsx
it('can do many interactions fast', async () => {
    const Counter = () => {
        const [count, setCount] = React.useState(0)
        return (
            <div>
                <button onClick={() => setCount(count + 1)}>Count is {count}</button>
            </div>
        )
    }
    const { container } = render(<Counter />)
    await expect($(container)).toHaveText('Count is 0')
    for (let i = 1; i <= 500; i++) {
        await $('button').click()
        await expect($(container)).toHaveText(`Count is ${i}`)
    }
})
```

Now if you run this test, you might recognize that it takes approximately `11830ms` to finish. This is because WebdriverIO uses WebDriver for automation and relays the command to the Node.js environment where it is being forwarded to a browser driver. This ensures that all operations are done in a standardized way and there are no surprises between browser. Generally emulating a click through JavaScript has its downsides which is why WebdriverIO uses WebDriver for all automation.

Now, since the test runs in the browser you can also do all automation without leaving the environment by e.g. using Testing Library for it:

```ts
it('can do many interactions faster', () => {
    const Counter = () => {
        const [count, setCount] = React.useState(0)
        return (
            <div>
                <button onClick={() => setCount(count + 1)}>Count is {count}</button>
            </div>
        )
    }
    render(<Counter />)
    const component = screen.getByText(/count is 0/i)
    expect(component).toBeInTheDocument()
    for (let i = 1; i <= 500; i++) {
        await fireEvent.click(component)
        expect(component).toHaveTextContent(`Count is ${i}`)
    }
})
```

With `36ms` this runs the test as fast as in e.g. Cypress.

Lastly, the next challenge was to dynamically change the state of the reducer and quick jump to a certain state within the component. While SafeTest uses some sort of "bridge" to enable this feature, Cypress as well WebdriverIO can just directly call it:

```ts
it('can bridge into the component directly', async () => {
    let count = 0;
    let forceNumber: (num: number) => void = () => {};
    const Counter = () => {
        const forceRender = React.useReducer(() => count, 0)[1];
        forceNumber = (n) => {
        count = n;
        forceRender();
        };
        return (
        <div>
            <button
            onClick={() => {
                count++;
                forceRender();
            }}
            >
            Count is {count}
            </button>
        </div>
        );
    };

    const { container } = render(<Counter />)
    await expect($(container)).toHaveText('Count is 0')
    await $('button').click()
    await expect($(container)).toHaveText('Count is 1')
    forceNumber(50);
    await expect($(container)).toHaveText('Count is 50')
    await $('button').click()
    await expect($(container)).toHaveText('Count is 51')
})
```

As Cypress uses a promise chain to keep commands executed sequentially, the Cypress test needs to mix sync and asynchronous Promise syntax like so:

```ts
cy.contains('Count is 0')
cy.get('button').click()
cy.contains('Count is 1').then(() => {
    forceNumber(50)
})
cy.contains('Count is 50')
```

I definitely prefer to __not__ mix synchronous and asynchronous execution together as it can lead to confusion and raise condition. Cypress has [workarounds](https://glebbahmutov.com/blog/replace-and-remove-cy-then-command/) for this but I'ld favor WebdriverIO syntax here.

| Feature                    | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| Dependency                 | ⚠️ prod                         | 👍 dev                         | 👍 dev              |
| Installation               | 👎 manual                      | 👍 auto                        | 👍 auto             |
| __Test syntax__            | 👍 easy                        | 👍 easy                        | 👍 easy             |
| __Execution environment__  | 👎 mix of Node and browser     | 👍 browser                     | 👍 both possible    |
| __Sync vs Async__          | 👍 async only                  | 👎 promise chain               | 👍 async only       |


# Test Speed

Comparing the execution of a test in this context is the favorite thing that comparison blog posts get wrong as it leaves out a lot of context. Run this single test results in the following results:

| SafeTest                   | Cypress Component Testing (CT) | WebdriverIO     |
|----------------------------|--------------------------------|-----------------|
| 1253ms                     | 301ms                          | 790ms           |

Cypress is faster for this single test as it runs all automation in the browser while WebdriverIO favors to go through WebDriver for consistency and reliability. That said, with WebdriverIO you can totally run all automation in the browser if you are interested in speed. For instance, Eslint runs `1485` browser tests within just `8.4s`:

![Eslint Test](/images/safetest-cypress-webdriverio/eslint.png 'Eslint Test')

Given that all frameworks allow some sort of sharding and parallelization, you can scale your test suite while keeping the execution time low. Therefore all frameworks can be seen as equally fast.

| Feature                    | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| Dependency                 | ⚠️ prod                         | 👍 dev                         | 👍 dev              |
| Installation               | 👎 manual                      | 👍 auto                        | 👍 auto             |
| Test syntax                | 👍 easy                        | 👍 easy                        | 👍 easy             |
| Execution environment      | 👎 mix of Node and browser     | 👍 browser                     | 👍 both possible    |
| Sync vs Async              | 👍 async only                  | 👎 promise chain               | 👍 async only       |
| __Speed__                  | 👍 fast                        | 👍 fast                        | 👍 fast             |


# Mocks and Spies

SafeTest provides Jest mocks and spies which is similar to WebdriverIO. Therefore the WebdriverIO example for this use case looks very similar:

```ts
import { fn } from '@wdio/browser-runner'

it('can use mocks and spies', async () => {
    const clickMock = fn()
    render(<button onClick={clickMock}>Test1</button>)
    await $('button').click()
    await expect(clickMock).toHaveBeenCalledTimes(1)
})
```

| Feature                    | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| Dependency                 | ⚠️ prod                         | 👍 dev                         | 👍 dev              |
| Installation               | 👎 manual                      | 👍 auto                        | 👍 auto             |
| Test syntax                | 👍 easy                        | 👍 easy                        | 👍 easy             |
| Execution environment      | 👎 mix of Node and browser     | 👍 browser                     | 👍 both possible    |
| Sync vs Async              | 👍 async only                  | 👎 promise chain               | 👍 async only       |
| Speed                      | 👍 fast                        | 👍 fast                        | 👍 fast             |
| __Spies and stubs__        | 👍 present                     | 👍 present                     | 👍 present          |

# Overrides and Providers

SafeTest enables you to define different [providers and contexts](https://github.com/kolodny/safetest?tab=readme-ov-file#providers-and-contexts) for your React component to modify the behavior of the application under test. This seems to overly complicate tests though and requires a lot of duplicated code within the application and your tests. Cypress and WebdriverIO however allow you to mock directly the network request and define a custom response, e.g.:

```ts
// see full demo in https://github.com/christian-bromann/wdio-demo
describe('LoginComponent with mocked fetch', () => {
    before(() => { window.fetch = fn() })

    it('failed log in with wrong credentials', async () => {
        render(<LoginComponent />)
        mocked(window.fetch).mockResolvedValue({
            json: fn().mockResolvedValue({ error: 'Invalid credentials' })
        } as any)

        await $('aria/Email').setValue('invalid@email.com')
        await $('aria/Password').setValue('wrong-password')
        await $('aria/Log In').click()
        await expect($('aria/Email')).toHaveElementClass('is-invalid')
        await expect($('aria/Password')).toHaveElementClass('is-invalid')
    })
})
```

WebdriverIO also allows you to fully mock out the dependency that is responsible for the state change in your component, e.g.:

```ts
// see full demo in https://github.com/christian-bromann/wdio-demo
import React from 'react'
import { fn, mocked, mock } from '@wdio/browser-runner'
import { render } from '@testing-library/react'

import { login } from './api.js'
import LoginComponent from './Login'

mock('./api.js', () => ({
    login: fn()
}))

describe('LoginComponent with mocked API', () => {
    it('failed log in with wrong credentials', async () => {
        render(<LoginComponent />)
        mocked(login).mockResolvedValue({ error: 'Invalid credentials' })

        await $('aria/Email').setValue('invalid@email.com')
        await $('aria/Password').setValue('wrong-password')
        await $('aria/Log In').click()
        await expect($('aria/Email')).toHaveElementClass('is-invalid')
        await expect($('aria/Password')).toHaveElementClass('is-invalid')
    })
})
```

While Cypress allows to mock out network requests, it is not possible to stub individual modules or dependencies without complex workarounds. WebdriverIO is the only framework for component testing that uses the power of [Vite](https://vitejs.dev/) to provide very dynamic mocking capabilities of your component dependencies. You can read more about WebdriverIOs mocking capabilities in the [project docs](https://webdriver.io/docs/component-testing/mocking).

| Feature                    | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| Dependency                 | ⚠️ prod                         | 👍 dev                         | 👍 dev              |
| Installation               | 👎 manual                      | 👍 auto                        | 👍 auto             |
| Test syntax                | 👍 easy                        | 👍 easy                        | 👍 easy             |
| Execution environment      | 👎 mix of Node and browser     | 👍 browser                     | 👍 both possible    |
| Sync vs Async              | 👍 async only                  | 👎 promise chain               | 👍 async only       |
| Speed                      | 👍 fast                        | 👍 fast                        | 👍 fast             |
| Spies and stubs            | 👍 present                     | 👍 present                     | 👍 present          |
| __Overrides__              | 👎 present but limited         | 👎 present but limited         | 👍 versatile        |

# Snapshot Support

Although Gleb's initial post overlooked this aspect, I believe it's essential that we don't dismiss the significance of this feature set, merely because SafeTest is based on Playwright. The capability to capture snapshots of a component holds considerable value, as it effectively consolidates numerous assertions into a single, potent assertion. While Cypress supports [visual testing](https://docs.cypress.io/guides/tooling/visual-testing) for the end-to-end use-case, they __don't__ support it for component testing.

SafeTest and WebdriverIO both support visual snapshot testing for components, e.g.:

```ts
// SafeTest example
import { describe, it, expect } from 'safetest/vitest';
import { render } from 'safetest/react';

describe('visual test', () => {
    it('simple visual test', async () => {
        const { page } = await render(<Header />);
        expect(await page.screenshot()).toMatchImageSnapshot();
    })
})
```

WebdriverIO even allows you to combine [visual](https://webdriver.io/docs/visual-testing) and text based snapshots in a single test for both, component and end-to-end tests:

```tsx
it('supports snapshot testing', async () => {
    const Counter = () => {
        const [count, setCount] = React.useState(0)
        return (
            <div>
                <button onClick={() => setCount(count + 1)}>Count is {count}</button>
            </div>
        )
    }
    const { container } = render(<Counter />)
    await expect(container).toMatchElementSnapshot('counter')
    await expect($('button')).toMatchInlineSnapshot(
        `"<button>Count is 0</button>"`)
})
```

| Feature                    | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| Dependency                 | ⚠️ prod                         | 👍 dev                         | 👍 dev              |
| Installation               | 👎 manual                      | 👍 auto                        | 👍 auto             |
| Test syntax                | 👍 easy                        | 👍 easy                        | 👍 easy             |
| Execution environment      | 👎 mix of Node and browser     | 👍 browser                     | 👍 both possible    |
| Sync vs Async              | 👍 async only                  | 👎 promise chain               | 👍 async only       |
| Speed                      | 👍 fast                        | 👍 fast                        | 👍 fast             |
| Spies and stubs            | 👍 present                     | 👍 present                     | 👍 present          |
| Overrides                  | 👎 present but limited         | 👎 present but limited         | 👍 versatile        |
| __Snapshot Testing__       | ⚠️ limited support              | 👎 not supported               | 👍 supported        |

# Dev Experience

When it comes to writing tests, everyone has their own preference. Without doing extensive research here I have to give Cypress and SafeTest/Playwright the point in this category given their great set of features especially when it comes to their time travel feature. However WebdriverIO offers a _watch mode_ that allows to keep your component test running in the background while developing your component and even gives you the chance to write your test in the console before writing writing it into a test:

![WebdriverIO Dev Experience](/images/safetest-cypress-webdriverio/dev-experience.gif 'WebdriverIO Dev Experience')

Now, while this an amazing way to write component tests it can't quite compete with Cypress and Playwrights time travel feature. That said, the WebdriverIO team already works on a similar feature and we hope to be able to announce something soon.

| Feature                    | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| Dependency                 | ⚠️ prod                         | 👍 dev                         | 👍 dev              |
| Installation               | 👎 manual                      | 👍 auto                        | 👍 auto             |
| Test syntax                | 👍 easy                        | 👍 easy                        | 👍 easy             |
| Execution environment      | 👎 mix of Node and browser     | 👍 browser                     | 👍 both possible    |
| Sync vs Async              | 👍 async only                  | 👎 promise chain               | 👍 async only       |
| Speed                      | 👍 fast                        | 👍 fast                        | 👍 fast             |
| Spies and stubs            | 👍 present                     | 👍 present                     | 👍 present          |
| Overrides                  | 👎 present but limited         | 👎 present but limited         | 👍 versatile        |
| Snapshot Testing           | ⚠️ limited support              | 👎 not supported               | 👍 supported        |
| __Dev Experience__         | 👍 good                        | 👍 good                        | 🤷 ok               |

# Dev Support

SafeTest was [announced by Netflix](https://netflixtechblog.com/introducing-safetest-a-novel-approach-to-front-end-testing-37f9f88c152d) but the project is owned and governed by its developer [`@kolodny`](https://github.com/kolodny). This does not give the impression of being officially endorsed by Netflix, nor does it assure the project's longevity, which would justify the effort involved in migration. Cypress, as Gleb mentioned in his blog post, has de-prioritized component testing capabilities so further support is unknown.

WebdriverIO is an open governed, open source project by the [OpenJS Foundation](https://openjsf.org/). It strives to provide long time support for many years to come and does not depend on a single company, nor rely on a single contributor. This makes it less likely that the project will be deprecated any time soon. Therefore I am voting in favor of WebdriverIO on this matter:

| Feature                    | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| Dependency                 | ⚠️ prod                         | 👍 dev                         | 👍 dev              |
| Installation               | 👎 manual                      | 👍 auto                        | 👍 auto              |
| Test syntax                | 👍 easy                        | 👍 easy                        | 👍 easy              |
| Execution environment      | 👎 mix of Node and browser     | 👍 browser                     | 👍 both possible     |
| Sync vs Async              | 👍 async only                  | 👎 promise chain               | 👍 async only        |
| Speed                      | 👍 fast                        | 👍 fast                        | 👍 fast              |
| Spies and stubs            | 👍 present                     | 👍 present                     | 👍 present           |
| Overrides                  | 👎 present but limited         | 👎 present but limited         | 👍 versatile         |
| Snapshot Testing           | ⚠️ limited support              | 👎 not supported               | 👍 supported        |
| Dev Experience             | 👍 good                        | 👍 good                        | 🤷 ok                |
| Backed by                  | 👎 single maintainer           | 👎 single company              | 👍 OpenJS Foundation |

# The final tally

We have covered a lot in this blog post. I have to thank [Gleb Bahmutov](https://www.linkedin.com/in/bahmutov/) for putting the initial comparison blog post out which helped me align to a common comparison framework. The final results therefor are:

|                            | SafeTest                       | Cypress Component Testing (CT) | WebdriverIO         |
|----------------------------|--------------------------------|--------------------------------|---------------------|
| All Features               | 5 👍   4 👎                     | 7 👍   4 👎                    | 10 👍  0 👎          |

And the winner is 🥁 WebdriverIO 🎉 no surprise, he? Jokes aside, I think WebdriverIO has a solid offering for component testing. If you have a good SafeTest or Cypress component test and want to see how it looks like with WebdriverIO, please send it [my way](https://twitter.com/bromann)!

That said, kudos to [`@kolodny`](https://github.com/kolodny) and Netflix for building out a framework and making it open source. We all can learn greatly from nuances and different approaches other people have on a problem. I am definitely gonna dig deeper into SafeTest but already got some great ideas how I can improve WebdriverIO component tests thanks to some solutions they provide.

Thanks for reading!
