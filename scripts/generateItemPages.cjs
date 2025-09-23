require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    jsx: 'react-jsx',
    baseUrl: '.',
    paths: {
      '@/*': ['src/*'],
    },
  },
});

try {
  require('./generateItemPages.ts');
} catch (error) {
  console.error('❌ Échec de la génération des pages items (loader CJS)');
  console.error(error);
  process.exit(1);
}
