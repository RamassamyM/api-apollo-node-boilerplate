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
