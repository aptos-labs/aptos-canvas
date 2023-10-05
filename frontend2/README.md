# Graffio Front-End: Anniversary Edition

## System Dependencies

- [Node 18](https://nodejs.org/) (runtime)
- [pnpm](https://pnpm.io/) (package manager)

## Getting Started

First, install all the project dependencies:

```bash
pnpm install
```

After the install is complete, `panda codegen` will be run automatically to generate the `src/styled-system` directory.

Next, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

While authoring your pages and components, it may be worth referencing the contents of `/panda-preset` to see what design-tokens are available to use in Panda CSS' styling functions.

If you edit `/panda.config.ts` or any of the files in `/panda-preset`, it is a good idea to run:

```bash
pnpm panda:clean
```

This will ensure that the functions and types in `/styled-system` are up to date with your changes.

## Learn More

### Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### Panda CSS

To learn more about Panda CSS, take a look at the following resources:

- [Panda CSS Documentation](https://panda-css.com/docs) - learn about Panda CSS features and API
- [Learn Panda CSS](https://panda-css.com/learn) - watch videos and tutorials about Panda CSS
