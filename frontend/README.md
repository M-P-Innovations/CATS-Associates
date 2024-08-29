### Set env variable
.env
```
PORT=8081
REACT_APP_API_URL = // pass the API URI link
REACT_APP_API_KEY = // pass the API KEY
REACT_APP_RECAPTCHA_KEY = // pass recaptcha key.
```

### Note:
Open `src/services/auth-header.js` and modify `return` statement for appropriate back-end (found in the tutorial).

### Project setup

In the project directory, you can run:

```
npm install
# or
yarn install
```

or

### Compiles and hot-reloads for development

```
npm start
# or
yarn start
```

Open [http://localhost:8081](http://localhost:8081) to view it in the browser.