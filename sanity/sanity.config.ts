import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'igor-broker-insights',
  title: 'Igor Broker — Insights',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'ho7l3gwr',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
