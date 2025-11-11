import type { Preview } from "@storybook/react";
import React from "react";
import { ThemeProvider } from '../src/components/ui/theme-provider';
import "../src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#f8fafc',
        },
        {
          name: 'dark',
          value: '#1e293b',
        },
      ],
    },
    // Configuration Chromatic pour tests visuels
    chromatic: {
      // Désactiver les animations pour des screenshots stables
      disableSnapshot: false,
      // Capturer les viewports différents
      viewports: [375, 768, 1280],
      // Capturer en light ET dark mode
      modes: {
        light: {
          theme: 'light',
        },
        dark: {
          theme: 'dark',
        },
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      // Appliquer le thème basé sur les paramètres Chromatic ou toolbar
      const theme = context.parameters.chromatic?.modes?.[context.viewMode]?.theme || context.globals.theme || 'light';
      
      return (
        <ThemeProvider defaultTheme={theme}>
          <div className="min-h-screen bg-background text-foreground p-4">
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
