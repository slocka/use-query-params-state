# use-query-params-state

React hooks based on react-router to manage your application state through the URL query parameters.

## Why use-query-params-state?
Very often a page uses some parameters to control the state of your application. Using the URL
to manage some parts of the state offers multiple advantages:
- Users can access directly a specific state of your application through a hyperlink.
- Your content becomes easy to share across the web.
- Users can undo/redo their actions through the browser history.
- Users can easily come back later on the same or different device with your application in the same state as they left it.

Example of url using use-query-params-state: 
`/products-search?search=red bike&page=10&pageSize=20&minRating=20`

On the other hand, managing the state through the URL can be challenging and tedious as there are multiple things to consider:
- Keeping the URL in sync with your state
- Making sure the URL hasn't been altered by the user
- All you state needs to be stored as a string.
- There is no native function easily to manage the query string of a URL. 


## Features
- Always keep your application state in sync with the URL query parameters
- Auto serialization/de-serialization of the query string based on param type you defined.
- Customize the serialization to handle more complex param types.
- Query params validation to verify that the URL is not corrupted.
- Use default value if param is not defined in the URL query string.

## Getting started

`yarn add qs use-query-params-state`
or
`npm install qs use-query-params-state`

### How to use?

#### useQueryParamsState(config)

```js
// Configure each param
const queryParamsConfig = {
    "search": { type: PARAM_TYPES.STRING, defaultValue: "" },
    "minRating": { type: PARAM_TYPES.NUMBER, defaultValue: 0 },
    "size": { type: PARAM_TYPES.ARRAY__NUMBERS },
    "brands": { type: PARAM_TYPES.ARRAY__STRINGS, defaultValue: null },
    "sortDirection": { defaultValue: "desc", validator: VALIDATORS.oneOf(["asc", "desc"])},
    "sortBy": { defaultValue: "price" },
    "newOnly": { type: PARAM_TYPES.BOOLEAN, defaultValue: false }
}

function MyComponent() {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState(config)
}
```
Note: If you need to dynamically change your config base on your component props, you can also do it.

```js
function MyComponent(props) {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState({
        "sortBy": { type: PARAM_TYPES.STRING, defaultValue: props.userPreferences.defaultSortBy }
    })
}
```

#### createUseQueryParamsStateHook(config)

If you want to call useQueryParamsState in different components and want to avoid having to specify the config
everywhere, you can use the createUseQueryParamsStateHook factory to create a hook with an embeded config.

```js
import { createUseQueryParamsStateHook, PARAM_TYPES, VALIDATORS } from "use-query-params-state"

const queryParamsConfig = {
    "search": { type: PARAM_TYPES.STRING, defaultValue: "" },
    "minRating": { type: PARAM_TYPES.NUMBER, defaultValue: 0 },
    "size": { type: PARAM_TYPES.ARRAY__NUMBERS },
    "brands": { type: PARAM_TYPES.ARRAY__STRINGS, defaultValue: null },
    "sortDirection": { defaultValue: "desc", validator: VALIDATORS.oneOf(["asc", "desc"])},
    "sortBy": { defaultValue: "price" },
    "newOnly": { type: PARAM_TYPES.BOOLEAN, defaultValue: false }
}

const useProductSearchFilters = createUseQueryParamsStateHook(queryParamsConfig)

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
    const [minRating, setMinRating] = useQueryParam("minRating", PARAM_TYPES.NUMBER, 0)
    const [search, setSearch] = useQueryParam("search")
}
```

### useQueryParamsState / createUseQueryParamsStateHook config options

The configuration is an object where each key is the name of the query param to use to read/write in the URL.


```js
// Runtime config overwrite
const queryParamsConfig = [
    { param: "sortBy", defaultValue: () => {
        const userPreferences = JSON.parse(localStorage.getItem("user_preferences"))
        return userPreferences.sortBy
    } }
]

function MyComponent() {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState("", URL_PARSERS.)
}
```