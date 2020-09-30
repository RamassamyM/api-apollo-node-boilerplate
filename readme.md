# Api-graphql(apollo)-node-boilerplate

## Development
### Project setup
```
yarn install
```
### Compiles and hot-reloads for development
```
yarn dev
```
### Launch tests
```
yarn test
```
### Generate code coverage report web report
```
yarn coverage
```
Access in folder /coverage/Icov-report/index.html

### Generate code documentation web server
```
yarn doc
```
Access in folder /jsdoc/server/1.0.0/index.html

### Apply linter ESLINT on code
```
yarn eslint
```
### Seed available for dev
```
yarn md-seed run --dropdb
```

## API documentation server
API documentation for graphQL is running on port <http://localhost:3000/playground>

## Production setup
Note : After pushing code in production, launch `release.sh` for generating secrets after build
```
yarn build
bash release.sh
yarn start
```

With heroku : (automatic when pushing to heroku)
```
yarn heroku-postbuild
```
To clean the build folder : 
```
yarn clean
```
### Seed available for prod
```
yarn md-seed run users
```

## Author
This app was made by Michael Ramassamy
