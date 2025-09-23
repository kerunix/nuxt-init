import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { defineCommand, runMain } from "citty";
import { loadFile, parseExpression, writeFile } from "magicast";
import { addDependency, addDevDependency } from "nypm";
import { eslintConfig, ssrWidth, tailwindcss } from "./templates";
import { execInChildDir, execInCurrentDir, logger, outputLine } from "./utils";

export const main = defineCommand({
  meta: {
    name: "init",
  },
  args: {
    name: {
      type: "positional",
      description: "Project name",
      required: true,
    },
  },
  async run({ args }) {
    const cwd = `./${args.name}`;
    try {
      outputLine("Scaffolding new Nuxt project...");
      await execInCurrentDir("pnpm", ["dlx", "nuxi@latest", "init", "--gitInit", "--offline", "--packageManager", "pnpm", args.name]);

      outputLine("Installing eslint with antfu's config...");
      await addDevDependency(["eslint", "@antfu/eslint-config"], { cwd, silent: true });
      writeFileSync(`${cwd}/eslint.config.js`, eslintConfig);

      outputLine("Installing tailwindss and motion-v...");
      await addDependency(["tailwindcss", "@tailwindcss/vite", "motion-v"], { cwd, silent: true });
      outputLine("Creating tailwindcss config file...");
      mkdirSync(`${cwd}/app/assets/css/`, { recursive: true });
      writeFileSync(`${cwd}/app/assets/css/tailwind.css`, tailwindcss);

      outputLine("Updating nuxt.config with css path...");
      const configPath = `${cwd}/nuxt.config.ts`;
      const mod = await loadFile(configPath);

      mod.imports.$prepend({ from: "@tailwindcss/vite", imported: "default", local: "tailwindcss" });

      const config = mod.exports.default.$args[0];

      config.css = ["~/assets/css/tailwind.css"];

      outputLine("Updating nuxt.config with tailwind vite plugin...");
      config.vite = {
        plugins: [parseExpression("tailwindcss()")],
      };

      outputLine("Updating nuxt.config with shadcn config...");
      config.shadcn = {
        prefix: "Ui",
        componentDir: "./app/components/ui",
      };

      if (!config.modules) {
        config.modules = [];
      }
      outputLine("Updating nuxt.config with motion-v module...");
      config.modules.push("motion-v/nuxt");

      await writeFile(mod, configPath);

      outputLine("Installing shadcn-vue module...");
      await execInChildDir("pnpm", ["dlx", "nuxi@latest", "module", "add", "shadcn-nuxt"], cwd);

      outputLine("Installing vueuse module...");
      await execInChildDir("pnpm", ["dlx", "nuxi@latest", "module", "add", "vueuse"], cwd);

      outputLine("Creating provideSSRWidth plugin...");
      mkdirSync(`${cwd}/app/plugins/`, { recursive: true });
      writeFileSync(`${cwd}/app/plugins/ssr-width.ts`, ssrWidth);

      outputLine("Updating tsconfig...");
      const tsconfigPath = `${cwd}/tsconfig.json`;
      let tsconfigContent = readFileSync(tsconfigPath, "utf-8");

      tsconfigContent = tsconfigContent.replace(
        /\{\s*/,
        `{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"]
    }
  },
  `,
      );

      writeFileSync(tsconfigPath, tsconfigContent);

      outputLine("Running nuxi prepare...");
      await execInChildDir("pnpm", ["dlx", "nuxi", "prepare"], cwd);

      outputLine("Runnin shadcn-vue init...");
      await execInChildDir("pnpm", ["dlx", "shadcn-vue@latest", "init"], cwd, {
        nodeOptions: { stdio: "inherit" },
      });

      outputLine("Updating components.json...");
      const componentsJsonPath = `${cwd}/components.json`;
      const componentsJsonContent = readFileSync(componentsJsonPath, "utf-8");
      const componentsConfig = JSON.parse(componentsJsonContent);

      componentsConfig.aliases = {
        components: "@/components",
        composables: "@/composables",
        utils: "@/lib/utils",
        ui: "@/components/ui",
        lib: "@/lib",
      };

      writeFileSync(componentsJsonPath, JSON.stringify(componentsConfig, null, 2));

      outputLine("Moving ./lib...");
      const libPath = `${cwd}/lib`;
      const appLibPath = `${cwd}/app/lib`;
      if (existsSync(libPath)) {
        renameSync(libPath, appLibPath);
      }

      outputLine("DONE !");
    }
    catch (err) {
      logger.warn(`Failed to install Shadcn/vue: ${err}`);
    }
  },
});

runMain(main);
