# Installation

```bash
npm install
# or
yarn install
```

## Publishing

The framework builds to both ESM and CJS outputs. Create the npm package with:

```bash
npm run build
npm pack
```

This generates a tarball ready for publishing to the npm registry.

## Available Scripts

In the project root you can use the following scripts:

* `npm run dev`: Run the application in development mode with automatic rebuilds on file changes.
* `npm run build`: Build the application for production. Output is placed in the `dist` directory.
* `npm run clean`: Remove the `dist` directory.
* `npm run lint`: Check code style with ESLint.
* `npm run format`: Automatically format code using Prettier.
* `npm test`: Run unit tests using Jest.
* `npm run test:watch`: Run Jest in watch mode to re-run tests on changes.
* `npm run test:cov`: Generate a test coverage report using Jest.
