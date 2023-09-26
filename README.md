# Next.js Enterprise Boilerplate

![Project intro image](./project-logo.png)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rharkor/next-boilerplate/blob/main/LICENSE)

Welcome to the _Next.js Boilerplate_, an open-source template for all your nextjs projects! It's loaded with features that'll help you build a high-performance, maintainable, and enjoyable app. We've done all the heavy lifting for you, so sit back, relax, and get ready to conquer the world with your incredible app! 🌍
_Inspired by [Next enterprise](https://github.com/Blazity/next-enterprise/)_
<br />
<br />
You can test the demo [here](https://next-boilerplate-rharkor.vercel.app/).

> email: `test@mail.com`  
> password: `Azerty123!`

## 📚 Features

With this template, you get all the awesomeness you need:

- 🏎️ **[Next.js](https://nextjs.org/)** - Fast by default, with config optimized for performance
- 💅 **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework for rapid UI development
- ✨ **[ESlint](https://eslint.org/)** and **[Prettier](https://prettier.io/)** - For clean, consistent, and error-free code
- 🫙 **[Dev Container](https://code.visualstudio.com/docs/remote/containers)** - For a consistent development environment
- 🐳 **[Docker](https://www.docker.com/)** - For easy deployment
- 🐘 **[PostgreSQL](https://www.postgresql.org/)** - A powerful, open-source relational database system
- 🗃️ **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js and TypeScript
- ⚡ **[Redis](https://redis.io/)** - An in-memory data structure store, used as a database, cache, and message broker
- 🔑 **[Auth.js](https://authjs.dev/)** - A simple, lightweight authentication library
- 🛠️ **[Extremely strict TypeScript](https://www.typescriptlang.org/)** - With [`ts-reset`](https://github.com/total-typescript/ts-reset) library for ultimate type safety
- 📊 **[Bundle analyzer plugin](https://www.npmjs.com/package/@next/bundle-analyzer)** - Keep an eye on your bundle size
- 🧪 **[Jest](https://jestjs.io/)** and **[React Testing Library](https://testing-library.com/react)** - For rock-solid unit and integration tests
- 📝 **[Conventional commits git hook](https://www.conventionalcommits.org/)** - Keep your commit history neat and tidy
- 🎯 **[Absolute imports](https://nextjs.org/docs/advanced-features/module-path-aliases)** - No more spaghetti imports
- ⚕️ **[Health checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)** - Kubernetes-compatible for robust deployments
- 🧩 **[Radix UI](https://www.radix-ui.com/)** - Headless UI components for endless customization
- 💎 **[CVA](http://cva.style/)** - Create a consistent, reusable, and atomic design system
- 🤖 **[Renovate BOT](https://www.whitesourcesoftware.com/free-developer-tools/renovate)** - Auto-updating dependencies, so you can focus on coding
- 🩹 **[Patch-package](https://www.npmjs.com/package/patch-package)** - Fix external dependencies without losing your mind
- 🚀 **[GitHub Actions](https://github.com/features/actions)** - Pre-configured actions for smooth workflows, including Bundle Size and performance stats
- 💯 **Perfect Lighthouse score** - Because performance matters
- 🚢 **[Semantic Release](https://github.com/semantic-release/semantic-release)** - for automatic changelog
- 💻 **[T3 Env](https://env.t3.gg/)** - Manage your environment variables with ease
- 📦 **[Unused dependencies checker](https://www.npmjs.com/package/depcheck)** - Keep your dependencies clean
- ✉️ **[Nodemailer](https://nodemailer.com/)** - Send emails with ease from any smtp server
- 🔗 **[Trpc](https://trpc.io/)** - Move Fast and Break Nothing. End-to-end typesafe APIs made easy.
- 🎨 **[Shadcn](https://ui.shadcn.com/)** - Beautifully designed components

## Table of Contents

- [Next.js Enterprise Boilerplate](#nextjs-enterprise-boilerplate)
  - [📚 Features](#-features)
  - [Table of Contents](#table-of-contents)
  - [🎯 Getting Started](#-getting-started)
  - [🚀 Deployment](#-deployment)
  - [📃 Scripts Overview](#-scripts-overview)
  - [🐳 Container Stack](#-container-stack)
  - [🧪 Testing](#-testing)
    - [Running Tests](#running-tests)
  - [🎨 Styling and Design System](#-styling-and-design-system)
    - [CVA - A New Approach to Variants](#cva---a-new-approach-to-variants)
  - [💾 State Management](#-state-management)
    - [Tanstack query](#tanstack-query)
  - [💻 Environment Variables handling](#-environment-variables-handling)
  - [🤝 Contribution](#-contribution)
  - [Support](#support)
  - [📜 License](#-license)
  - [Contributors](#contributors)

## 🎯 Getting Started

_If you want to use the dev container, please follow the [container stack](#-container-stack) instructions._

To get started with this boilerplate, follow these steps:

1. Fork & clone repository:

```bash
## Don't forget to ⭐ star and fork it first :)
git clone https://github.com/rharkor/next-boilerplate
```

2. Create a `.env` file and add the following environment variables:

```bash
cp .env.example .env
```

3. Initialize the project:

```bash
npm run init
```

4. Install the dependencies:

```bash
npm install
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

7. This project uses a git hook to enforce [conventional commits](https://github.com/qoomon/git-conventional-commits). To install the git hook, run the following command in the root directory of the project:

```sh
brew install pre-commit
pre-commit install -t commit-msg
```

## 🚀 Deployment

Easily deploy your Next.js app with [Vercel](https://vercel.com/new) by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frharkor%2Fnext-boilerplate&env=REDIS_USE_TLS,AUTH_ADMIN_EMAIL,AUTH_ADMIN_PASSWORD,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,NEXTAUTH_SECRET,JWT_SECRET,PASSWORD_HASHER_SECRET&envDescription=Keys%20needed%20to%20start%20the%20application%2C%20please%20see%20other%20env%20required%20like%20database%20and%20redis&envLink=https%3A%2F%2Fgithub.com%2Frharkor%2Fnext-boilerplate%2Fblob%2Fmain%2F.env.example)

## 📃 Scripts Overview

The following scripts are available in the `package.json`:

- `init`: Initializes the project by setting up your information
- `dev`: Starts the development server with colorized output
- `build`: Builds the app for production
- `start`: Starts the production server
- `lint`: Lints the code using ESLint
- `lint:fix`: Automatically fixes linting errors
- `prettier`: Checks the code for proper formatting
- `prettier:fix`: Automatically fixes formatting issues
- `analyze`: Analyzes the bundle sizes for Client, Server and Edge environments
- `test`: Runs unit and integration tests
- `e2e:headless`: Runs end-to-end tests in headless mode
- `e2e:ui`: Runs end-to-end tests with UI
- `format`: Formats the code with Prettier
- `postinstall`: Applies patches to external dependencies
- `preinstall`: Ensures the project is installed with Npm
- `seed`: Seeds the database with test data
- `depcheck`: Checks for unused dependencies

## 🐳 Container Stack

The boilerplate comes with a pre-configured Docker container stack and a dev container. The stack includes the following services:

- **Next.js** - A React framework for building fast and scalable web applications
- **PostgreSQL** - A powerful, open-source relational database system
- **Redis** - An in-memory data structure store, used as a database, cache, and message broker

To start the development container in vsCode [see](https://code.visualstudio.com/docs/remote/containers#_quick-start-open-an-existing-folder-in-a-container).
You can also use [devPod](https://github.com/loft-sh/devpod) to easily start the development container.

[![Open in DevPod!](https://devpod.sh/assets/open-in-devpod.svg)](https://devpod.sh/open#https://github.com/rharkor/next-boilerplate)

Ports:

- Next.js: 3000
- PostgreSQL: 5432
- Redis: 6379
- Desktop (password: vscode): 6080

## 🧪 Testing

This boilerplate comes with various testing setups to ensure your application's reliability and robustness.

### Running Tests

- **Unit and integration tests**: Run Jest tests using `npm run test`

<img width="1392" alt="image" src="https://user-images.githubusercontent.com/28964599/233666655-93b7d08b-2fd8-406a-b43c-44d4d96cf387.png">

## 🎨 Styling and Design System

This boilerplate uses Tailwind CSS for styling and CVA for creating a powerful, easy-to-use design system. If you want to learn more about the setup, check out this fantastic video by Vercel:

### CVA - A New Approach to Variants

While CSS-in-TS libraries such as [Stitches](https://stitches.dev/) and [Vanilla Extract](https://vanilla-extract.style/) are great for building type-safe UI components, they might not be the perfect fit for everyone. You may prefer more control over your stylesheets, need to use a framework like Tailwind CSS, or simply enjoy writing your own CSS.

Creating variants using traditional CSS can be a tedious task, requiring you to manually match classes to props and add types. CVA is here to take that pain away, allowing you to focus on the enjoyable aspects of UI development. By providing an easy and type-safe way to create variants, CVA simplifies the process and helps you create powerful design systems without compromising on the flexibility and control of CSS.

## 💾 State Management

While this boilerplate doesn't include a specific state management library, we believe it's essential for you to choose the one that best suits your project's needs. Here are some libraries we recommend for state management:

### Tanstack query

[Tanstack query](https://tanstack.com/query/latest) is a powerful, fast, and lightweight data fetching and caching library. It provides a concise, declarative API for fetching data that integrates seamlessly with React.

## 💻 Environment Variables handling

[T3 Env](https://env.t3.gg/) is a library that provides environmental variables checking at build time, type validation and transforming. It ensures that your application is using the correct environment variables and their values are of the expected type. You’ll never again struggle with runtime errors caused by incorrect environment variable usage.

Config file is located at `env.mjs`. Simply set your client and server variables and import `env` from any file in your project.

```ts
export const env = createEnv({
  server: {
    // Server variables
    SECRET_KEY: z.string(),
  },
  client: {
    // Client variables
    API_URL: z.string().url(),
  },
  runtimeEnv: {
    // Assign runtime variables
    SECRET_KEY: process.env.SECRET_KEY,
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
})
```

If the required environment variables are not set, you'll get an error message:

```sh
  ❌ Invalid environment variables: { SECRET_KEY: [ 'Required' ] }
```

## 🤝 Contribution

Contributions are always welcome! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch with a descriptive name.
3. Make your changes, and commit them using the [Conventional Commits](https://www.conventionalcommits.org/) format.
4. Push your changes to the forked repository.
5. Create a pull request, and we'll review your changes.

## Support

For support, contact me on discord at `ryzer` or by email at `louis@huort.com`.

## 📜 License

This project is licensed under the MIT License. For more information, see the [LICENSE](./LICENSE) file.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
     <td align="center" valign="top" width="14.28%"><a href="https://bstefanski.com/"><img src="https://avatars.githubusercontent.com/u/28964599?v=4?s=100" width="100px;" alt="Bart Stefanski"/><br /><sub><b>Bart Stefanski</b></sub></a><br /><a href="https://github.com/Blazity/next-enterprise/commits?author=bmstefanski" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jjablonski-it"><img src="https://avatars.githubusercontent.com/u/51968772?v=4?s=100" width="100px;" alt="Jakub Jabłoński"/><br /><sub><b>Jakub Jabłoński</b></sub></a><br /><a href="#infra-jjablonski-it" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://louis.huort.com/"><img src="https://avatars.githubusercontent.com/u/70844594?v=4?s=100" width="100px;" alt="Louis Huort"/><br /><sub><b>Louis Huort</b></sub></a><br /><a href="https://github.com/rharkor/next-boilerplate/commits?author=rharkor" title="Code">💻</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
