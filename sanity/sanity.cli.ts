import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'ho7l3gwr',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
});
