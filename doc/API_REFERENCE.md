# API REFERENCE

## QPARAMS
QPARAMS is an object containing a factory function for each type definition that you can use to build your final schema.

```ts
const QPARAMS: {
    number: (defaultValue?: DefaultValue<number>) => QueryParamDef<number>;
    string: (defaultValue?: DefaultValue<string>) => QueryParamDef<string>;
    boolean: (defaultValue?: DefaultValue<boolean>) => QueryParamDef<boolean>;
    arrayOfNumbers: (defaultValue?: DefaultValue<number[]>) => QueryParamDef<number[]>;
    arrayOfStrings: (defaultValue?: DefaultValue<string[]>) => QueryParamDef<string[]>;
}
```

Each factory follow the same function signature:

*Note: `T` represent the actual type of the value (number | string | boolean | string[] | number[]), depending on the factory function used.*

### Arguments
 - **defaultValue? (T | DefaultValueFunction<T> | null | undefined)**: Serve as a substitute to the param value when the param is not present in the query string. When defaultValue is a function, the provided function will be executed each time we need to read the state and its return value will be used as a default value

### Returns
- **(QueryParamDef<T>)**: A QueryParamDef instance is defining what type the associated parameter should be. This is necessary to automatically stringify/parse the parameter to/from the URL and perform some type checking (Typescript + Javascript) when getting/setting the param . `QueryParamDef<T>` will only accept the value to be set to `T | null | undefined`.

### Example

```js
const schema = {
    numberParam: QPARAMS.number(0 /* default value*/),
    stringParam: QPARAMS.string(),
    // The default value can be a function that will be executed each time the query param state needs to be re-evaluated.
    booleanParam: QPARAMS.boolean(() => JSON.parse(localStorage.getItem("isTrue")),
    arrayOfStringsParam: QPARAMS.arrayOfStrings(),
    arrayOfNumbersParam: QPARAMS.arrayOfNumbers(null),
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

## useQueryParamsState

Hook to manipulate your query params state.

### Arguments

- **queryParamsSchema (Record<string, QueryParamDef<any>>)**: Object representing the schema for you query params. The key is the name of your param, value is a QueryParamDef instance created through one of the factory function available on QPARAMS object.
  
### Returns

- **([QueryParams, QueryParamsSetter])**: Tuple where the first index is the state representing the current query params state, and the second one is the function to update this query params state (and therefore the URL query string).

#### QueryParams
Object following the shape defined in your schema representing the current state. The key is the name of your parameter and the value is the current value of the parameter. When one parameter does not currently exist in the query string, its value will be `undefined` or the default value you potentially provided when creating the schema. 

### QueryParamsSetter
Function to call when updating the state of your query parameters. Calling that function will update the current URL query string and will automatically re-render your components with the new query params state.

The function has the following signature:

#### Arguments
- **newQueryParams (Partial<QueryParams>)**: Object with the query params key/value you want to update.
- **isPartialUpdate? (boolean)**: Define if the update should be applied on top of the current query params state or not. Default to true
  - If true, the new query params will be applied on top of the current query params state (i.e: `const newState = { ...oldState, ...newQueryParams }`.
  - If false, the new query params will be applied on top of an empty object, (i.e: `const newState = { ...newQueryParams }`). This can also be used to reset the state.


### Example

```ts
// Current URL is https://localhost:8000?search=wallet
const queryParamsSchema = {
    "search": QPARAMS.string(),
    "minRating": QPARAMS.number(0 /* default value*/),
}

function MyComponent() {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState(queryParamsSchema)
    // queryParamsState => { search: "wallet", minRating: 0 }

    const onMinRatingChange = () => {
        setQueryParamsState({ minRating: 4 })
        // URL will be updated to https://localhost:8000?search=wallet&minRating=4
        // Next render will have queryParamsState => { search: "wallet", minRating: 4 }
    }


    const onResetFilters = () => {
        // Reset all query params
        setQueryParamsState({}, false /* (isPartialUpdate) */ )
        // URL will be updated to https://localhost:8000
        // Next render will have queryParamsState => { search: undefined, minRating: 0 }
    }

    ...
}
```

If you need to dynamically change your config base on your component props, you can also do it.

```js
function MyComponent(props) {
    const [queryParamsState, setQueryParamsState] = useQueryParamsState({
        "sortBy": QPARAMS.string(props.userPreferences.defaultSortBy)
    })
}
```

## useQueryParam

Sometimes it's just easier to treat each query param as an independent state, you can achieve that using `useQueryParam`.

### Arguments
- **paramName (string)**: The name/key of the query parameter.
- **queryParamDef (QueryParamDef<T>)**: The object defining the parameter value, generated from one of the type factory function of [QPARAMS](#QPARAMS)
- **contextData?** (any): The context data

### Returns
- **([T | null | undefined, (value?: T | null | undefined) => void)**: Tuple where the first index is the value of the query param and the second one is the function to set a new value to the parameter.

### Example
```js
import { useQueryParam } from "use-query-params-state"

// Current URL is https://localhost:8000?search=wallet

function MyComponent() {
    const [minRating, setMinRating] = useQueryParam("minRating", QPARAMS.number(0))
    // minRating => 0

    /** Second param will use QPARAMS.string() by default */
    const [search, setSearch] = useQueryParam("search")
    // Search => "wallet"

    const onMinRatingChange = () => {
        setMinRating(4)
        // URL will be updated to https://localhost:8000?search=wallet&minRating=4
        // Next render will have minRating => 4 and search => "wallet"
    }
}
```

## createUseQueryParamsStateHook

This is a simple shortcut to create a useQueryParamsState hook with the schema already embeded. This allow to use the same hook in multiple components without having to always specify the schema.

### Arguments

- **queryParamsSchema (Record<string, QueryParamDef<any>>)**: Object representing the schema for you query params. The key is the name of your param, value is a QueryParamDef instance created through one of the factory function available on QPARAMS object.

### Returns

- **((context: any) => [QueryParams, QueryParamsSetter])**: Hook equivalent to [useQueryParamsState](#usequeryparamsstate) but for which you don't need to specify the schema. 

### Example

```js
import { createUseQueryParamsStateHook, QPARAMS, VALIDATORS } from "use-query-params-state"

const queryParamsSchema = {
    ...
}
const useProductSearchFilters = createUseQueryParamsStateHook(queryParamsSchema)
``` 

The snippet above is basically equivalent to:

```js
import { useQueryParamsState, QPARAMS, VALIDATORS } from "use-query-params-state"

const queryParamsSchema = {
    ...
}

const useProductSearchFilters = () => {
    return useQueryParamsState(queryParamsSchema)
}
```



## buildQueryString

Create a new query string based on the provided schema and a matching query params state object. 
An error will be thrown if the param does not match the type defined in the schema.

### Arguments
- **queryParamsSchema (QueryParamsSchema)**: The query params schema defining your query string.
- **newQueryParams (Partial<QueryParams<QueryParamsSchema>>)**: The query parameters you want to add to the query string and are part of the schema.
- **contextData? (any)**: Context data
- **otherRawParams? (Record<string, string | null | undefined>)**: Optional other query parameters you want to add to the query string but don't belong to the schema. Each parameter value is expected to already be in its string format as those parameters won't be validated nor transformed.

### Returns

- **(string)**: The new query string.

### Example
```ts
const schema = {
    search: QPARAMS.string(),
    minRating: QPARAMS.number(0),
    sortBy: QPARAMS.string("price"),
}

const queryString1 = buildQueryString(schema, { search: "sport shoes", sortBy: "rating" })
// => "search=sport+shoes&sortBy=rating"

const queryString1 = buildQueryString(schema, { search: "sport shoes", sortBy: "rating" }, undefined, { utm_source="facebook" })
// => "utm_source=facebook&search=sport+shoes&sortBy=ratings"

const queryString2 = buildQueryString(schema, { search: 3 })
// => Error: search was expecting a string but received a number.
```


## useBuildQueryStringFromCurrentURL

React hook returning a function to build a new query string from the current URL location query string. This is useful if you want to create a new query string while preserving some parameters from the current one.

### Arguments
- **queryParamsSchema (QueryParamsSchema)**: The query params schema defining your query string.

### Returns
- **(QueryStringBuilderFunction<QueryParamsSchema>)**: A function to build the query string.

The returned function has the following signature:

#### Arguments
 - **newQueryParams? (Partial<QueryParams<QueryParamsSchema>>)**: The query parameters you want to add to the query string and are part of the schema.
 - **buildStrategy? (QS_BUILD_STRATEGY)**: Define what strategy you want to use to preserve query parameters from the current query string to the new query one. Default to QS_BUILD_STRATEGY.PRESERVE_ALL
 - **contextData? (any)**: Context data

```ts
export enum QS_BUILD_STRATEGY {
  /**
   * Create a new query string from new params and preserve all pre-existing params.
   */
  PRESERVE_ALL,
  /**
   * Create a new query string from new params and only preserve pre-existing params that are not
   * outside the schema.
   */
  PRESERVE_EXTERNAL_ONLY,
  /**
   * Create a new query string from new params, preserve all pre-existing params, and add params defined in schema
   * but are missing from the query string. (For those, the param value will be the default value).
   */
  PRESERVE_ALL_WITH_DEFAULT,
  /**
   * Create a new query string from new params only.
   * This is equivalent to using the buildQueryString(...) helper.
   */
  PRESERVE_NONE,
}
```

#### Returns

- **(string)**: The new query string.

### Example

```ts
const queryParamsStateSchema = {
    booleanParam: QPARAMS.boolean(),
    stringParam: QPARAMS.string()
    numberParam: QPARAMS.number(42)
};

// Current URL is https://localhost:8000?booleanParam=true&utm_source=facebook
...
const buildQueryStringFromURL = useBuildQueryStringFromCurrentURL(queryParamsStateSchema)

/** Using QS_BUILD_STRATEGY.PRESERVE_ALL by default */
const queryStringPreserveAll = buildQueryStringFromURL(
    { stringParam: "hello world" }
) // => "booleanParam=true&stringParam=hello+world&&utm_source=facebook"

const queryStringPreserveExternalOnly = buildQueryStringFromURL(
    { stringParam: "hello world" },
    QS_BUILD_STRATEGY.PRESERVE_EXTERNAL_ONLY
) // => "stringParam=hello+world&utm_source=facebook"

const queryStringPreserveAllWithDefault = buildQueryStringFromURL(
    { stringParam: "hello world" },
    QS_BUILD_STRATEGY.PRESERVE_ALL_WITH_DEFAULT
) // => "booleanParam=true&stringParam=hello+world&numberParam=42&utm_source=facebook"
```

## Errors

TODO

### QueryParamsValidationError

## VALIDATORS

TODO

### .oneOf

Returns a validator function that checks if the paramValue is shallow equal to one of the provided `possibleValues`.

```ts
<T>(possibleValues: T[]) => (paramValue: any) => T;
```

