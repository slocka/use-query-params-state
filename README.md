# use-query-params-state (BETA)

React hooks to manage your application state using the URL query parameters.
The current version is only compatible with React-router.

## Why use-query-params-state?
Very often a page uses some parameters to control the state of your application. Using the URL
to manage some parts of the state offers multiple advantages:
- Your application content becomes easy to share across the web.
- Users can access a specific state of your application through a hyperlink.
- Users can undo/redo their actions through the browser history.
- Users can easily come back later on the same or different device with your application in the same state as they left it.

Example of url using use-query-params-state: 
```js
"/products-search?search=red+bike&page=10&pageSize=20&minRating=20&free_delivery=true"
```

On the other hand, managing your state through the URL can be challenging and tedious as there are multiple things to manage:
- Keeping the URL in sync with your application state.
- Decoding the query string to your URLs state when reading from the URL.
- Encoding your javascript state to its query string representation when writing into the URL.
- Converting each param into the correct javascript type during encoding/decoding phase (everything in the URL is a string).
- Making sure the state defined by the URL hasn't been wrongly altered by the user or isn't corrupted.


## Features
- Always keep your React application state in sync with the URL query parameters.
- Auto serialization/de-serialization of the query string to the correct Javascript types based on your configuration.
- Use a default value if the query parameter is not present in the URL query string. The default value can also be dynamically computed at execution time.
- Query params validation to verify that the URL is not corrupted or that the value of the query parameter is valid.
  - Validate the query parameter type.
  - Validate the param based on the value of other query params.
  - Validate the param based on other data provided at execution time.
- Customize the serialization to handle more complex param types.
- Typescript support.


## Getting started

---
**WARNING**

This is still work in progress and the library is not yet stable. Please do not use in production.

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
    const [queryParamsState, setQueryParamsState] = useQueryParamsState(config)
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

If you want to call useQueryParamsState in different components and want to avoid having to specify the config
everywhere, you can use the createUseQueryParamsStateHook factory to create a hook with an embeded config.

```js
import { createUseQueryParamsStateHook, PARAM_TYPES, VALIDATORS } from "use-query-params-state"

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

#### useQueryParam()

Sometimes it's just easier to treat each query param as an independent state, you can achieve that using `useQueryParam`.


```js
function MyComponent() {
    const [minRating, setMinRating] = useQueryParam("minRating", QPARAMS.number(0))
    const [search, setSearch] = useQueryParam("search")
}
```

### Defining your query params schema.

The QueryParamsSchema is a map between the name of the parameter and its definition (type, default value, validator). It is used to define what parameters are part of the state, and how to serialize/deserialize each of them.

#### Query parameters definition

QPARAMS contains a factory function for each type:
```js
QPARAMS.number()
QPARAMS.string()
QPARAMS.boolean()
QPARAMS.arrayOfStrings()
QPARAMS.arrayOfNumbers()
QPARAMS.date() // not yet available!
QPARAMS.object() // not yet available!

// Note: All those types also accept `undefined` and `null` as a value.
```

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

You can also access "context data" inside your default value function:

```js
const queryParamsSchema = {
    "sortBy": QPARAMS.string((contextData) => {
        contextData.defaultSortBy
    }),
}

const useProductSearchFilters = createUseQueryParamsStateHook(queryParamsSchema)

function MyComponent1(props) {
    const contextData = {
        defaultSortBy: props.defaultSortBy
    }
    // Context data will be available inside the function calculating
    // the default value of the "sortBy" query param.
    const [filters] = useProductSearchFilters(contextData)
}
```

#### Validator

@TODO