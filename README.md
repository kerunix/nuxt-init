# nuxt-init

A CLI tool to scaffold a Nuxt application with opinionated defaults including:

- ✨ ESLint with Anthony Fu's config
- 🎨 Tailwind CSS with Vite plugin
- 🧩 Shadcn/vue components
- 🎬 Motion-v animations
- 📁 Proper app directory structure
- 🔧 TypeScript paths configured

## Usage

```bash
# Using pnpm dlx (recommended)
pnpm dlx nuxt-init my-app

# Using npx
npx nuxt-init my-app

# Using yarn
yarn dlx nuxt-init my-app
```

## What it does

1. Scaffolds a new Nuxt 3 project
2. Installs and configures ESLint with @antfu/eslint-config
3. Sets up Tailwind CSS with proper configuration
4. Installs and configures Shadcn/vue with correct paths
5. Adds Motion-v for animations
6. Creates SSR width plugin
7. Configures TypeScript paths for better imports

## Requirements

- Node.js 18+
- pnpm, npm, or yarn

## License

MIT