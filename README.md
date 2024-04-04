# Next.js Enterprise Boilerplate

![Project intro image](./project-logo.png)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rharkor/next-boilerplate/blob/main/LICENSE)

Welcome to the _Next.js Boilerplate_, an open-source template for all your nextjs projects! It's loaded with features that'll help you build a high-performance, maintainable, and enjoyable app. We've done all the heavy lifting for you, so sit back, relax, and get ready to conquer the world with your incredible app! 🌍
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
- 📝 **[Conventional commits git hook](https://www.conventionalcommits.org/)** - Keep your commit history neat and tidy
- 🎯 **[Absolute imports](https://nextjs.org/docs/advanced-features/module-path-aliases)** - No more spaghetti imports
- ⚕️ **[Health checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)** - Kubernetes-compatible for robust deployments
- 🤖 **[Renovate BOT](https://www.whitesourcesoftware.com/free-developer-tools/renovate)** - Auto-updating dependencies, so you can focus on coding
- 🩹 **[Patch-package](https://www.npmjs.com/package/patch-package)** - Fix external dependencies without losing your mind
- 🚀 **[GitHub Actions](https://github.com/features/actions)** - Pre-configured actions for smooth workflows, including check tests and deployment example
- 🚢 **[Semantic Release](https://github.com/semantic-release/semantic-release)** - for automatic changelog
- 💻 **[T3 Env](https://env.t3.gg/)** - Manage your environment variables with ease
- 📦 **[Unused dependencies checker](https://www.npmjs.com/package/depcheck)** - Keep your dependencies clean
- ✉️ **[Nodemailer](https://nodemailer.com/)** - Send emails with ease from any smtp server
- 🔗 **[Trpc](https://trpc.io/)** - Move Fast and Break Nothing. End-to-end typesafe APIs made easy.
- 🎨 **[Next ui](https://nextui.org/)** - Beautifully designed components
- 🗄️ **[Monorepo](https://docs.npmjs.com/cli/v7/using-npm/workspaces)** - Manage multiple packages in one repository
- 🌐 **Translation** - Translation module built in for intertionalization
- 🌈 **Theme** - Dark and light mode theme
- 📖 **[Documentation](https://docusaurus.io/)** - A modern static website generator
- 📅 **Cron jobs** - Schedule jobs to run at specific times
- 📄 **Landing Page** - A simple landing page to showcase your app

## Table of Contents

- [Next.js Enterprise Boilerplate](#nextjs-enterprise-boilerplate)
  - [📚 Features](#-features)
  - [Table of Contents](#table-of-contents)
  - [🎯 Getting Started](#-getting-started)
  - [🗄️ Monorepo packages](#️-monorepo-packages)
  - [🚀 Deployment](#-deployment)
  - [📃 Scripts Overview](#-scripts-overview)
  - [🐳 Container Stack](#-container-stack)
    - [Tanstack query](#tanstack-query)
  - [💻 Environment Variables handling](#-environment-variables-handling)
  - [📝 Development tips](#-development-tips)
    - [Internationalization](#internationalization)
      - [Client-side](#client-side)
      - [Server side](#server-side)
      - [Loading optimization](#loading-optimization)
      - [Traduction file](#traduction-file)
  - [☁️ Cloud deployment](#️-cloud-deployment)
    - [Build](#build)
    - [Build multi-architecture image](#build-multi-architecture-image)
    - [Debug in local](#debug-in-local)
    - [Deploy](#deploy)
  - [🤝 Contribution](#-contribution)
  - [Support](#support)
  - [📜 License](#-license)

## 🎯 Getting Started

_If you want to use the dev container, please follow the [container stack](#-container-stack) instructions._

To get started with this boilerplate, follow these steps:

1. Fork & clone repository:

```bash
## Don't forget to ⭐ star and fork it first :)
git clone --depth 1 https://github.com/rharkor/next-boilerplate
```

2. Install the dependencies:

```bash
npm install
```

3. Initialize the project:

```bash
npm run init
```

> If the project is already initialized and your are not in a dev container just run the following command to install git hooks:
>
> ```bash
> npm install --global git-conventional-commits
> git config core.hooksPath .git-hooks
> ```

4. Build the base packages:

```bash
turbo run build --filter='@next-boilerplate/*'^...
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗄️ Monorepo packages

This boilerplate uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to manage multiple packages in one repository.
The following packages are available:

- `apps/app`: The main application
- `apps/cron`: The cron jobs
- `apps/docs`: The documentation website
- `apps/landing`: The landing page

To run a script in a package, you can use the following command:

```bash
npm run <script> --workspace=<package>
```

For example, to run the `dev` script in the `app` package, you can use the following command:

```bash
npm run dev --workspace=apps/app
```

or

```bash
cd apps/app && npm run dev
```

Each package has its own `package.json` file, so you can add dependencies specific to a package.

Please make sure to add the dependencies to the `package.json` file of the package you want to use them in.
For example, if you want to add a dependency to the `app` package, you should add it to the `app/package.json` file with the following command:

```bash
npm install <package> --workspace=apps/app
```

or

```bash
cd apps/app
npm install <package>
```

> If you install a dependency in the root `package.json` file, it will be available in all packages and in most cases, you don't want that.

Port for each package:

- **App**: `3000`
- **Docs**: `3001`
- **Landing**: `3002`

## 🚀 Deployment

Easily deploy your Next.js app with [Vercel](https://vercel.com/new) by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frharkor%2Fnext-boilerplate&env=REDIS_USE_TLS,AUTH_ADMIN_EMAIL,AUTH_ADMIN_PASSWORD,GITHUB_CLIENT_ID,GITHUB_CLIENT_SECRET,NEXTAUTH_SECRET,PASSWORD_HASHER_SECRET&envDescription=Keys%20needed%20to%20start%20the%20application%2C%20please%20see%20other%20env%20required%20like%20database%20and%20redis&envLink=https%3A%2F%2Fgithub.com%2Frharkor%2Fnext-boilerplate%2Fblob%2Fmain%2F.env.example)

## 📃 Scripts Overview

The following scripts are available in the `package.json`:

- `init`: Initializes the project by setting up your information
- `dev`: Starts the development server (only the main application package)
- `build`: Builds the app for production
- `start`: Starts the production server
- `lint`: Lints the code using ESLint
- `lint:fix`: Automatically fixes linting errors
- `prettier`: Checks the code for proper formatting
- `prettier:fix`: Automatically fixes formatting issues
- `test`: Runs unit and integration tests
- `preinstall`: Ensures the project is installed with Npm
- `depcheck`: Checks for unused dependencies

## 🐳 Container Stack

The boilerplate comes with a pre-configured Docker container stack and a dev container. The stack includes the following services:

- **Next.js** - A React framework for building fast and scalable web applications
- **PostgreSQL** - A powerful, open-source relational database system
- **Redis** - An in-memory data structure store, used as a database, cache, and message broker

To start the development container in vsCode [see](https://code.visualstudio.com/docs/remote/containers#_quick-start-open-an-existing-folder-in-a-container).

Ports:

- Next.js: 3000
- Docs: 3001
- Landing: 3002
- PostgreSQL: 5432
- Redis: 6379

### Tanstack query

[Tanstack query](https://tanstack.com/query/latest) is a powerful, fast, and lightweight data fetching and caching library. It provides a concise, declarative API for fetching data that integrates seamlessly with React.

## 💻 Environment Variables handling

[T3 Env](https://env.t3.gg/) is a library that provides environmental variables checking at build time, type validation and transforming. It ensures that your application is using the correct environment variables and their values are of the expected type. You’ll never again struggle with runtime errors caused by incorrect environment variable usage.

Config file is located at `env.ts`. Simply set your client and server variables and import `env` from any file in your project.

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
});
```

If the required environment variables are not set, you'll get an error message:

```sh
  ❌ Invalid environment variables: { SECRET_KEY: [ 'Required' ] }
```

## 📝 Development tips

### Internationalization

#### Client-side

```tsx
import { useDictionary } from "@/contexts/dictionary/utils";

export default function Home() {
  const dictionary = useDictionary();
  return (
    <div>
      <h1>{dictionary.hello}</h1>
    </div>
  );
}
```

#### Server side

```tsx
import { Locale } from "@/lib/i18n-config";

import { getDictionary } from "@/lib/langs";

export default async function Home({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dictionary = await getDictionary(lang);

  return (
    <div>
      <h1>{dictionary.hello}</h1>
    </div>
  );
}
```

#### Loading optimization

The dictionary is loaded on the server and passed on the client only on the first load. If you make any changes to the dictionary, the server will see the difference and send the new dictionary to the client.

#### Traduction file

The files for traduction are located in `packages/app/src/langs` or `packages/landing/src/langs` depending on the package you want to use it in.
If you want to add a new language, you can add a new file in the `langs` folder then modify the file `i18n-config.ts` and `langs.ts`.

## ☁️ Cloud deployment

_Please note that the following steps are for deploying the any application package._

### Build

1. Build the docker image

```bash
docker build -t <image-name> -f <path-to-Dockerfile> .
```

Exemple (landing):

```bash
docker build -t next-boilerplate/landing -f apps/landing/Dockerfile .
```

2. Push the image to a container registry

```bash
docker push <image-name>
```

Exemple (landing):

```bash
docker tag next-boilerplate/landing:latest <registry-url>/next-boilerplate/landing:latest
docker push <registry-url>/next-boilerplate/landing:latest
```

### Build multi-architecture image

Exemple (landing):

```bash
buildx build -t "<registry-url>/next-boilerplate/landing:latest" -f apps/landing/Dockerfile --platform linux/amd64,linux/arm64 --push .
```

### Debug in local

After the build you can run the image in local to see if everything is working as expected.

```bash
docker run --rm -it -p 3000:3000 <image-name>
```

> See:
> https://www.docker.com/blog/multi-arch-images/ > https://aws.amazon.com/fr/blogs/containers/how-to-build-your-containers-for-arm-and-save-with-graviton-and-spot-instances-on-amazon-ecs/ > https://docs.docker.com/build/drivers/docker-container/

### Deploy

For development environment or low usage application please prefer "Fargate", for production environment or high usage application please prefer "EC2".

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
