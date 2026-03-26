# Vistream Implementation

## 1. Create Routes for frontend

- /subscription
- /movies
  - /watch
- /tv
- /watchlist
- /vi+
- /login
- /signup
- /resetPassword
- (auth)-> implement to combine login signup and restpassword (nextjs don't cout auth before other child folder.. use for grouping)

## 2. Creating backend for this routes first

**controllers**
Discover
MovieController
TvController
authController
UserController[]
VideoController[]
PaymentController[]

**models**
User[]

**routes**
tv
movie
discover
auth
user

**utils**

\*\*

## 3. creating frontend Endpoints for the REST API of Vistream.

# Frontend Implementaion

[] login card
[] sheet
[] card
[] api integration
[] redux
[] watch list
[] forget password

### shadcn component .

1. sheet
   sheet is a overlay used it when u need a ui that overlay the exisiting ui and get triggered from element in a exisiting ui..
   Sheet
   SheetTrigger
   SheetContent

2. Card
   CardHeader
   CardTitle
   CardDiscription
   CardContent
   CardFooter

# Shadcn

### components

it give us components like
sheet
button
input
labels etc

### variants

we can create variants of that existing component as Shadcn uses cva libarary that allow us to create our own variants.

```js
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### modifying

we can easily modify the styling of any variant if we want to change as shadcn give cn funtion that merge the changed classes with existin.. from utils

```js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

<Comp
  data-slot="button"
  className={cn(buttonVariants({ variant, size, className }))}
  {...props}
/>;
```

impact -> we just need to write a tailwind class in classname and it will be applied on the component. as in componeent defination it uses cn function that merges the tw class.

### Cors

CORS -> Cross origin resource sharing

What it is: A security mechanism in web browsers that uses HTTP headers to allow or deny requests for resources from a different origin (domain, scheme, or port) than the one the webpage was served from.

Why it's needed: By default, web browsers enforce a "same-origin policy" to prevent malicious websites from accessing data from other domains. CORS provides a way for web servers to safely grant access to their resources to external sites.

how to use:
nodejs: cors is a middlware package..
npm i cors
const cors = require('cors');
now
app.use(cors()) -> allow all domain port and allow all the route of app.

optionConfig({

}) -> allow which port or domain you want to allow.

app.get('/home" cors(optionConfig))-> this will only allow only specific domain and only specific route.

```js
const corsOptions = {
  // Specify which origins are allowed to access the resource
  origin: "https://example.com",

  // Set to true to allow credentials (like cookies or HTTP authentication)
  credentials: true,

  // Define the allowed HTTP methods
  methods: ["GET", "POST", "PUT", "DELETE"],

  // Specify the allowed request headers
  allowedHeaders: ["Content-Type", "Authorization"],

  // Define which custom headers the browser can access
  exposedHeaders: ["X-Custom-Header"],

  // For preflight requests, provides a status code
  optionsSuccessStatus: 200,

  // How long preflight requests can be cached
  maxAge: 3600,
};
```

then use it on route or complete app as per your need.

you can config the origins to..

### API Integration

**_Fetch_**

```js
export const makeHardcodedFetchRequest = async (url) => {
  const hardcodedBody = {
    name: "Hardcoded Item",
    value: 123,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer DUMMY_TOKEN",
    },
    body: JSON.stringify(hardcodedBody),
    credentials: "include",
    mode: "cors",
    cache: "no-cache",
    redirect: "follow",
    referrer: "no-referrer",
  };

  const response = await fetch(url, options);

  const data = await response.json();

  return data;
};

export const makeHardcodedFetchRequest = async (url) => {
  const hardcodedBody = {
    name: "Hardcoded Item",
    value: 123,
  };

  const options = {
    // METHOD: Defines the type of HTTP request (e.g., GET, POST, DELETE).
    method: "POST",

    // HEADERS: Provides metadata about the request.
    headers: {
      // Content-Type: Tells the server the format of the data in the body (MUST be 'application/json' for JSON strings).
      "Content-Type": "application/json",
      // Accept: Tells the server the format of the response data the client expects.
      Accept: "application/json",
      // Authorization: Sends authentication tokens (e.g., Bearer Token) to verify the user's identity.
      Authorization: "Bearer DUMMY_TOKEN",
    },

    // BODY: The data payload being sent to the server. MUST be a JSON string.
    body: JSON.stringify(hardcodedBody),

    // CREDENTIALS: Controls whether cookies (if they exist) should be sent with the request.
    // 'include' is used for cross-origin requests that rely on cookies for session tracking.
    credentials: "include",

    // MODE: Controls whether the request can cross origins. 'cors' allows the request to be made to a different domain.
    mode: "cors",

    // CACHE: Defines how the request interacts with the browser's HTTP cache.
    // 'no-cache' ensures the browser always re-validates the resource with the server before using a cached copy.
    // Example: cache: 'no-cache' is useful for ensuring you always get the latest data.
    cache: "no-cache",

    // REDIRECT: Defines how the API handles server redirects (e.g., a 301 or 302 status).
    // 'follow' is the default and lets the request automatically follow the redirect chain.
    redirect: "follow",

    // REFERRER: Specifies the value of the HTTP Referer header.
    // 'no-referrer' is a security measure that prevents the URL of the page making the request from being sent.
    referrer: "no-referrer",
  };

  const response = await fetch(url, options);

  const data = await response.json();

  return data;
};
```



**_AXIOS_**

| Feature        | Axios Behavior                                                                                                        | Native fetch Behavior                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Error Handling | Throws an error immediately for any bad status code (4xx, 5xx), forcing you into the catch block.                     | Only throws an error for network failures. Requires manually checking if (!response.ok) for 4xx/5xx status codes. |
| Data Handling  | Automatically serializes JavaScript objects to JSON for the request body, and automatically parses the JSON response. | Requires manually calling JSON.stringify() on the body and response.json() on the response.                       |
| API Structure  | Provides clean, dedicated methods (.get(), .post(), .put()).                                                          | Requires setting the method inside a verbose options object.     
                                                 |




***AXIOS FULL SYNTAX WITH VALUE***
```js
import axios from 'axios';

// 1. Create an instance to define the base URL and global timeout.
const api = axios.create({
    baseURL: 'https://api.example.com/v1',
    timeout: 8000,
});

/**
 * Performs a highly configured POST request using the generic axios(config) syntax.
 * All configuration properties are defined inside the single config object.
 */
export const makeFullConfiguredRequest = async () => {
    
    // The data payload for the POST request
    const payload = {
        productName: 'Ultimate Widget',
        quantity: 1
    };

    try {
        // The single generic call to the Axios instance
        const response = await api({
            
            // -----------------------------------------------------------------
            // I. Request Fundamentals
            // -----------------------------------------------------------------
            url: '/orders', // Final URL: https://api.example.com/v1/orders
            method: 'POST', // Must be specified here for the generic call

            // The data object (Axios automatically handles JSON.stringify())
            data: payload, 

            // Parameters added to the query string (?userId=123&env=prod)
            params: {
                userId: 123,
                env: 'prod'
            },

            // -----------------------------------------------------------------
            // II. Headers and Authentication
            // -----------------------------------------------------------------
            headers: {
                // Tells the server what Content-Type is being sent
                'Content-Type': 'application/json',
                // Example of sending an API key via a header
                'Authorization': 'Bearer DUMMY_JWT_TOKEN',
                // Custom header for tracking
                'X-Client-Trace': 'web-app-v2',
            },

            // Enables the use of session cookies across different domains
            withCredentials: true, 
            
            // HTTP Basic Auth credentials (will be base64 encoded by Axios)
            auth: {
                username: 'api-user',
                password: 'secure-password'
            },

            // -----------------------------------------------------------------
            // III. Data Transformation & Format
            // -----------------------------------------------------------------
            responseType: 'json', // Expects the server to return JSON

            // Defines the cookie that holds the CSRF token
            xsrfCookieName: 'CSRF_TOKEN', 
            // Defines the header name where Axios should put the CSRF token
            xsrfHeaderName: 'X-CSRF-TOKEN', 

            // Functions to transform request data before sending
            transformRequest: [
                (data) => {
                    // Custom logic: Add a timestamp to every outgoing body
                    data.timestamp = new Date().toISOString();
                    // Must return the data object (or string)
                    return data; 
                }
            ],
            
            // Functions to transform response data after receiving
            transformResponse: [
                (data) => {
                    // Custom logic: Convert any 'price' strings to numbers
                    if (data && data.price) {
                        data.price = parseFloat(data.price);
                    }
                    return data; 
                }
            ],

            // -----------------------------------------------------------------
            // IV. Status and Error Control
            // -----------------------------------------------------------------

            // Custom function to determine which status codes reject the promise.
            // Here, we resolve (don't throw an error) for 2xx and 4xx status codes,
            // but still reject for 5xx server errors.
            validateStatus: (status) => {
                return status < 500; // Resolve if status is less than 500
            },
        });

        console.log(`Request complete. Status: ${response.status}`);
        return response.data;

    } catch (error) {
        // Axios automatically handles network errors and rejected status codes (5xx in this case)
        console.error("The API call failed:", error.message);
        throw error;
    }
};


```

### UserProfile after login and logout
***Redux implementation***
userSlice( slice name, initial state , reducer fucntion  export slice and actions) -> store -> provider -> layout -> useInCompoenent( useSelector and useDispatch);

***in profile sheet update the ui***


***Remove password from backend response***


### Forget Reset Integration 


### Payment Integration 


### Streaming 


### watchlist.



### STYLING OF HEADER AND LAYOUT

| Responsibility                                   | Goes Where      |
| ------------------------------------------------ | --------------- |
| **Height, margin, padding, flex-grow**           | Parent / Layout |
| **Content structure, typography, icons, colors** | Component       |
| **Position (fixed/sticky/absolute)**             | Layout          |
| **Spacing between internal items**               | Component       |


