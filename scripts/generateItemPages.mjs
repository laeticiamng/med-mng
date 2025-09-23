import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'esnext',
  moduleResolution: 'bundler',
  jsx: 'react-jsx',
  allowImportingTsExtensions: true,
  baseUrl: '.',
  paths: {
    '@/*': ['src/*'],
  },
});

register('ts-node/esm', pathToFileURL('./'));

try {
  await import('./generateItemPages.ts');
} catch (error) {
  console.error('❌ Échec de la génération des pages items (loader ESM)');
  console.error(error);
  process.exit(1);
}
