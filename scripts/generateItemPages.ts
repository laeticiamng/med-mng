import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.mjs';
import * as HelmetAsync from 'react-helmet-async';

const resolveHelmetProvider = () => {
  const module = HelmetAsync as {
    HelmetProvider?: typeof import('react-helmet-async').HelmetProvider;
    default?: { HelmetProvider?: typeof import('react-helmet-async').HelmetProvider };
  };
  return module.HelmetProvider ?? module.default?.HelmetProvider;
};

const HelmetProvider = resolveHelmetProvider();

import { ItemPageView } from '../src/pages/ItemPage.tsx';
import { getAllItemIds, getItemById } from '../src/data/ednItemStaticData.ts';

const cleanHead = (html: string) => {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta name="description"[^>]*>/i, '')
    .replace(/<meta property="og:title"[^>]*>/i, '')
    .replace(/<meta property="og:description"[^>]*>/i, '')
    .replace(/<meta name="twitter:title"[^>]*>/i, '')
    .replace(/<meta name="twitter:description"[^>]*>/i, '')
    .replace(/<link rel="canonical"[^>]*>/i, '');
};

const injectHead = (html: string, helmet: { title?: { toString(): string }; meta?: { toString(): string }; link?: { toString(): string }; script?: { toString(): string } }) => {
  const headTags = [
    helmet.title?.toString() ?? '',
    helmet.meta?.toString() ?? '',
    helmet.link?.toString() ?? '',
    helmet.script?.toString() ?? '',
  ].filter(Boolean).join('');

  const cleaned = cleanHead(html);
  return cleaned.replace('</head>', `${headTags}</head>`);
};

const injectAppHtml = (template: string, markup: string) =>
  template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception during item SSG');
  console.error(error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection during item SSG');
  console.error(reason);
});

async function generateItemPages() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const templatePath = path.join(distDir, 'index.html');

  let template: string;
  try {
    template = await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    console.error('❌ Impossible de lire dist/index.html. Lancez d\'abord "vite build".');
    throw error;
  }

  const ids = getAllItemIds();
  const generatedRoutes: string[] = [];

  for (const id of ids) {
    const item = getItemById(id);
    if (!item) {
      continue;
    }

    const helmetContext: Record<string, unknown> = {};
    let markup: string;
    const ProviderComponent = (HelmetProvider ?? (({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children))) as React.ComponentType<{ context?: Record<string, unknown>; children?: React.ReactNode }>;
    if (typeof ItemPageView !== 'function') {
      throw new Error('ItemPageView component is not a function.');
    }

    try {
      markup = renderToString(
        React.createElement(ProviderComponent, { context: helmetContext },
          React.createElement(StaticRouter, { location: `/item/${id}` },
            React.createElement(ItemPageView, { item })
          ),
        ),
      );
    } catch (error) {
      console.error(`❌ Rendu SSR impossible pour l'item ${id}`);
      console.error(error);
      throw error;
    }

    const helmet = (helmetContext as { helmet?: { title?: { toString(): string }; meta?: { toString(): string }; link?: { toString(): string }; script?: { toString(): string } } }).helmet;
    if (!helmet) {
      throw new Error('Helmet context missing during SSG rendering.');
    }

    const htmlWithApp = injectAppHtml(template, markup);
    const finalHtml = injectHead(htmlWithApp, helmet);

    const outputDir = path.join(distDir, 'item', id);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'index.html'), finalHtml, 'utf-8');

    generatedRoutes.push(`/item/${id}`);
  }

  await fs.mkdir(path.join(distDir, 'item'), { recursive: true });
  await fs.writeFile(
    path.join(distDir, 'item', 'routes.json'),
    JSON.stringify({ generated: generatedRoutes, timestamp: new Date().toISOString() }, null, 2),
    'utf-8',
  );

  console.log(`✅ Pages items pré-rendues : ${generatedRoutes.length}`);
}

generateItemPages().catch((error) => {
  console.error('❌ Génération des pages items échouée');
  console.error(error);
  process.exit(1);
});

