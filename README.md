# use-query-params-state (BETA)

React hooks to manage your application state using the URL query string ([search params](https://developer.mozilla.org/en-US/docs/Web/API/URL/searchParams)).

## Why use-query-params-state?

use-query-params-state aims to improve the developer experience and indirectly the user experience, by making URL state management easy, reliable and type safe.

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
- 
### A better developer experience

If managing your state through the URL can improve the user experience, the developer experience can quickly suffer from it. Implementing this pattern from scratch can be challenging and tedious as there are multiple things to manage:
- Keeping the URL and your React state in sync.
- Convert the query string to your React state when reading from the URL.
- Convert your React state to its query string representation when writing to the URL.
- Keeping track of the correct type of each param during encoding/decoding phase (everything in the URL is a string).
- Making sure the state defined by the URL hasn't been wrongly altered by the user or isn't corrupted.

use-query-params-state handles all those problems for you and offers a solution similar to the React `useState` hook.

## Features

- Typescript support.
- Always keep your React application state in sync with the URL query string.
- Auto serialization/de-serialization of the query string to the correct Javascript types based on defined schema.
- Use a default value when the query parameter is not present in the URL query string. The default value can also be dynamically computed at execution time.
- Validate the URL search parameters to verify that the URL is not corrupted or that the value of the query parameter is valid.
- Customize the serialization to handle more complex or custom param types.

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

#### useQueryParamsState(queryParamsSchema)

```js
import { QPARAMS, useQueryParamsState, VALIDATORS } from "use-query-params-state"

/**
 * Configure each param with:
 *  - A type.
 *  - An optional default value.
 *  - An optional validator function.
 */
const queryParamsSchema = {
    "search": QPARAMS.string(),
    "minRating": QPARAMS.number(0 /* default value*/),
    "sizes": QPARAMS.arrayOfNumbers(),
    "brands": QPARAMS.arrayOfStrings(null),
    "sortDirection": QPARAMS.string("desc").validator(VALIDATORS.oneOf(["asc", "desc"])),
    "sortBy": QPARAMS.string("price"),
    "newOnly": QPARAMS.boolean(false)
}

function MyComponent() {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState(queryParamsSchema)
}
```
Note: If you need to dynamically change your config base on your component props, you can also do it.

```js
function MyComponent(props) {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState({
        "sortBy": QPARAMS.string(props.userPreferences.defaultSortBy)
    })
}
```

#### createUseQueryParamsStateHook(queryParamsSchema)

If you want to call useQueryParamsState in multiple components and want to avoid having to specify the config
everywhere, you can use the createUseQueryParamsStateHook factory to create a hook with an embeded config.

```js
import { createUseQueryParamsStateHook, QPARAMS, VALIDATORS } from "use-query-params-state"

const queryParamsSchema = {
    "search": QPARAMS.string(),
    "minRating": QPARAMS.number(0 /* default value*/),
    "sizes": QPARAMS.arrayOfNumbers(),
    "brands": QPARAMS.arrayOfStrings(null),
    "sortDirection": QPARAMS.string("desc").validator(VALIDATORS.oneOf(["asc", "desc"])),
    "sortBy": QPARAMS.string("price"),
    "newOnly": QPARAMS.boolean(false)
}

const useProductSearchFilters = createUseQueryParamsStateHook(queryParamsSchema)

function MyComponent1() {
    const [filters] = useProductSearchFilters()
}

function MyComponent2() {
    const [filters, setFilters] = useProductSearchFilters()
}
```

### Defining your query params schema.

The QueryParamsSchema is a map between the name of the parameter and its definition (type, default value, validator). It is used to define what parameters are part of the state, and how to serialize/deserialize each of them.

#### Query parameters definition

#### Default value
Each parameter definition factory function can receive a default value as the first argument.
```js
function MyComponent() {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState({
        sortBy: QPARAMS.string("myDefaultValue")
    })
    console.log(queryParamsState.sortBy)
    // => "myDefaultValue" if "sortBy" doesn't exist in the URL query string.
}
```

The default value can also be a function that will be executed each time we need to re-evaluate the query param state.
```js
// Read from local storage,
function getSortByUserPreference() {
    const userPreferences = JSON.parse(localStorage.getItem("user_preferences"))
    return userPreferences.sortBy
}

function MyComponent() {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState({
        // Read default from local storage.
        sortBy: QPARAMS.string(getSortByUserPreference)
    })
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

