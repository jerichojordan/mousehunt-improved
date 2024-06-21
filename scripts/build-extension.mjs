import * as esbuild from 'esbuild';
import copyPlugin from '@sprout2000/esbuild-copy-plugin'; // eslint-disable-line import/default
import fs from 'node:fs';
import path from 'node:path';

import { CSSMinifyTextPlugin, ImportGlobPlugin, parseArgs } from './shared.mjs';

const argv = await parseArgs(process.argv);

/**
 * Main build function.
 *
 * @param {string}  platform The platform to build for.
 * @param {boolean} watch    Whether to watch for changes.
 * @param {string}  release  Whether building for release.
 *
 * @return {Promise<void>} Esbuild build result.
 */
const buildExtension = async (platform, watch = false, release = false) => {
  fs.mkdirSync(path.join(process.cwd(), `dist/${platform}`), { recursive: true });

  // Copy manifest.json and inject the version number.
  const manifest = JSON.parse(fs.readFileSync(
    path.join(process.cwd(), `src/extension/manifest-${platform}.json`), 'utf8'
  ));

  fs.writeFileSync(
    path.join(process.cwd(), `dist/${platform}/manifest.json`),
    JSON.stringify({
      ...manifest,
      version: process.env.npm_package_version,
    }, null, 2)
  );

  const opts = {
    entryPoints: ['src/index.js'],
    platform: 'browser',
    format: 'iife',
    globalName: 'mhui',
    bundle: true,
    minify: false,
    metafile: true,
    sourcemap: true,
    target: [
      'es6',
      'chrome58',
      'firefox57'
    ],
    outfile: `dist/${platform}/main.js`,
    plugins: [
      ImportGlobPlugin,
      CSSMinifyTextPlugin,
      copyPlugin.copyPlugin({ // eslint-disable-line import/no-named-as-default-member
        src: 'src/extension',
        dest: `dist/${platform}`,
        /**
         * Don't copy the screenshots dir or any dotfiles.
         * We don't copy the manifest because we're copying a modified version of it above.
         *
         * @param {string} file The file to filter.
         *
         * @return {boolean} Whether to filter the file.
         */
        filter: (file) => {
          return (
            ! file.startsWith('screenshots') &&
            ! file.startsWith('.') &&
            ! file.startsWith('manifest-')
          );
        }
      }),
    ],
    banner: {
      js: [
        `const mhImprovedVersion = '${process.env.npm_package_version}';`,
        `const mhImprovedPlatform = '${platform}';`,
      ].join('\n'),
    },
    define: {
      __SENTRY_DSN__: JSON.stringify(release ? 'https://a677b0fe4d2fbc3a7db7410353d91f39@o4506582061875200.ingest.sentry.io/4506781071835136' : ''),
    }
  };

  console.log(watch ? 'Watching for changes...' : 'Building extension...'); // eslint-disable-line no-console
  if (watch) {
    opts.logLevel = 'info';
    const ctx = await esbuild.context(opts);
    return await ctx.watch();
  }

  return await esbuild.build(opts);
};

await buildExtension(argv.platform, argv.watch, argv.release);
