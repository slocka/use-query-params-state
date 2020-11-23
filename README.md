# use-query-params-state (BETA)

React hooks to manage your application state using the URL query string ([search params](https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams)).

## Why use-query-params-state?

use-query-params-state aims to improve the end user experience by providing a solution helping developers creating more shareable React web application. It is doing so by making URL state management easy, reliable and type safe and therefore encouraging developers to use the URL query string more often.

Note: Not all the states of your application can/should be stored in the URL. use-query-params-state is typically suited to manage states corresponding to parameters manipulated by the user that influences the current page.

Example of URL state using use-query-params-state: 
```js
"/products-search?search=red+bike&page=10&pageSize=20&minRating=20&free_delivery=true"
```
### A better user experience

It is a common pattern for modern web applications to use the URL search query string to control the state of the current page. This pattern enables multiple things:
- Your application content can easily be shared across the web.
- Users can directly access a specific state of your application through a hyperlink.
- Users can undo/redo their actions through the browser history.
- Users can bookmark the page and come back later on the same or different device with the application in the state it was left in.
 
### A better developer experience

If managing your state through the URL can improve the user experience, the developer experience can quickly suffer from it. Implementing this pattern from scratch can be challenging and tedious as there are multiple things to manage:
- Keeping the URL and your React state in sync.
- Convert the query string to your React state when reading from the URL.
- Convert your React state to its query string representation when writing to the URL.
- Keeping track of the correct type of each param during encoding/decoding phase (everything in the URL is a string).
- Making sure the state defined by the URL hasn't been wrongly altered by the user or isn't corrupted.

use-query-params-state handles all those problems for you and offers a React hook solution similar to React `useState`.

### Other benefits
- SEO: By making the different states of your application accessible directly by a simple link, you are working towards making your content more discoverable by search engine crawlers and therefore potentially more optimized for SEO ranking.

## Features

- Typescript support.
- Always keep your React application state in sync with the URL query string.
- Auto serialization/de-serialization of the query string to the correct Javascript types based on defined schema.
- Use a default value when the query parameter is not present in the URL query string. The default value can also be dynamically computed at execution time.
- Validate the URL search parameters to verify that the URL is not corrupted or that the value of the query parameter is valid.
- Customize the serialization to handle more complex or custom param types.
- Offers some helper functions to create new query string for your internal hyperlinks.

## Getting started

---
**WARNING**

- This is still work in progress and the library is not yet stable. Please do not use in production.

- The current version is only compatible with React-router.

---


```
yarn add use-query-params-state
```
or
```
npm install use-query-params-state
```

### How to use?

### Defining your query params schema.

use-query-params-state relies on a schema definition defined by the developer to automatically transform the URL query string to its React state and vice versa. 

The QueryParamsSchema is a map between the name of the parameter and its definition (type, default value, validator). It is used to define what parameters are part of the state, and how to serialize/deserialize each of them.

The first step is to build your query param state schema:

```js
import { QPARAMS, VALIDATORS } from "use-query-params-state"

/**
 * Configure each param with:
 *  - A type.
 *  - An optional default value.
 *  - An optional validator function.
 */
const queryParamsSchema = {
    search: QPARAMS.string(),
    minRating: QPARAMS.number(0 /* default value*/),
    sizes: QPARAMS.arrayOfNumbers(),
    brands: QPARAMS.arrayOfStrings(null),
    sortDirection: QPARAMS.string("desc").validator(VALIDATORS.oneOf(["asc", "desc"])),
    sortBy: QPARAMS.string("price"),
    newOnly: QPARAMS.boolean(false)
}
```

QPARAMS object exposes the following factory functions to define each query param of your schema:

| QueryParamDef factory | Query param state type        | Query string format    | Query params state         |
|-----------------------|-------------------------------|------------------------|----------------------------|
| .number()             | number \| null \| undefined   | ?rating=4              | { rating: 4 }              |
| .string()             | string \| null \| undefined   | ?search="tennis+shoes" | { search: "tennis shoes" } |
| .boolean()            | boolean \| null \| undefined  | ?freeDelivery=true     | { freeDelivery: true }     |
| .arrayOfStrings()     | string[] \| null \| undefined | ?sizes=S,M,L           | { sizes: ["S", "M", "L"] } |
| .arrayOfNumbers()     | number[] \| null \| undefined | ?sizes=9,10,11         | { sizes: [9,10,11] }       |

Each factory function can accept a default value. See [API reference guide](doc/API_REFERENCE.md#QPARAMS) to learn more about it.

### Read the query params state

Once your schema is defined, you can use the `useQueryParamsState` hook to access the current state of your query parameters.

```js
import { QPARAMS, VALIDATORS, useQueryParamsStates } from "use-query-params-state"

// Define the schema
const queryParamsSchema = {
    search: QPARAMS.string(),
    minRating: QPARAMS.number(0 /* default value*/),
    sizes: QPARAMS.arrayOfNumbers(),
    brands: QPARAMS.arrayOfStrings(null),
    sortDirection: QPARAMS.string("desc").validator(VALIDATORS.oneOf(["asc", "desc"])),
    sortBy: QPARAMS.string("price"),
    newOnly: QPARAMS.boolean(false)
}

function MyComponent() {
    // queryParamsState is the React state directly derived from the URL query string based on the provided schema.
    const [queryParamsState] = useQueryParamsState(queryParamsSchema)

    /**
     * In this example, if the URL is "/products-search?search=red+bike&brands=loulou&sortDirection=desc"
     * queryParamsState object will be:
     * {
     *  search: "red bike",
     *  minRating: 0,
     *  sizes: undefined,
     *  brands: ["loulou"],
     *  sortDirection: "desc",
     *  sortBy: "price",
     *  newOnly: false
     * }
     */
}
```

### Update the query params state

useQueryParamsState also exposes a setter function to update the state of your query params. The setter function applies a partial update by default, meaning that you only need to pass the query parameters that you want to change (other params will be preserved).  

```ts
// Define the schema
const queryParamsSchema = {
    search: QPARAMS.string(),
    minRating: QPARAMS.number(0 /* default value*/),
    sizes: QPARAMS.arrayOfNumbers(),
    brands: QPARAMS.arrayOfStrings(null),
    sortDirection: QPARAMS.string("desc").validator(VALIDATORS.oneOf(["asc", "desc"])),
    sortBy: QPARAMS.string("price"),
    newOnly: QPARAMS.boolean(false)
}

function MyComponent() {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState(queryParamsSchema)

    const onSearchChange = (newSearchValue: string) => {
        // Update the search param value in the URL and in the React state.
        setQueryParamsState({ search: newSearchValue })
    }
}
```

Note: When updating the query params state, the change is automatically reflected in the URL query string. In fact, use-query-params-state does not create any local state, it uses the URL as the only source of truth and derives the query params state from the current query string and the provided schema.

### Usage of useQueryParamsState across multiple components

If you want to call useQueryParamsState in multiple components and want to avoid having to specify the schema each time,
you can use the [createUseQueryParamsStateHook](doc/API_REFERENCE.md#createUseQueryParamsStateHook) factory.

```js
import { createUseQueryParamsStateHook, QPARAMS, VALIDATORS } from "use-query-params-state"

const queryParamsSchema = {
    search: QPARAMS.string(),
    minRating: QPARAMS.number(0 /* default value*/),
    sizes: QPARAMS.arrayOfNumbers(),
    brands: QPARAMS.arrayOfStrings(null),
    sortDirection: QPARAMS.string("desc").validator(VALIDATORS.oneOf(["asc", "desc"])),
    sortBy: QPARAMS.string("price"),
    newOnly: QPARAMS.boolean(false)
}

const useProductSearchFilters = createUseQueryParamsStateHook(queryParamsSchema)

function MyComponent1() {
    const [filters] = useProductSearchFilters()
}

function MyComponent2() {
    const [filters, setFilters] = useProductSearchFilters()
}
```

## use-query-params-state with class components

use-query-params-state solution is based on [React hooks](https://reactjs.org/docs/hooks-reference.html) and requires a version of React that support them (16.8+).

If your version of React is compatible but you prefer to use class components, use-query-params-state hooks can easily be converted into high order components using the [hocify](https://github.com/ricokahler/hocify) package.

```js
import hocify from "hocify"
import { QPARAMS, useQueryParamsState } from "use-query-params-state"

const queryParamsSchema = {
    sortBy: QPARAMS.string("myDefaultValue")
}

export const withQueryParams = hocify(() => {
    const [queryParams, setQueryParams] = useQueryParamsState(queryParamsSchema)

    return {
        queryParams,
        setQueryParams
    }
})
```

## API REFERENCE

[See the API_REFERENCE page for more information](doc/API_REFERENCE.md)