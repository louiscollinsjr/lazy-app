import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.VITE_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.VITE_TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "static",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "static",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
      {
        name: 'article',
        label: 'Articles',
        path: 'content/articles',
        format: 'md',
        fields: [
          { type: 'string', name: 'article_id', label: 'Article ID', required: true },
          { type: 'string', name: 'title', label: 'Title', required: true },
          { type: 'string', name: 'slug', label: 'Slug', required: true },
          { type: 'string', name: 'description', label: 'Description' },
          { type: 'image', name: 'featured_image', label: 'Featured Image' },
          { type: 'string', name: 'category', label: 'Category' },
          { type: 'string', name: 'tags', label: 'Tags', list: true },
          { type: 'datetime', name: 'publishedDate', label: 'Published Date' },
          { type: 'string', name: 'author', label: 'Author' },
          { type: 'boolean', name: 'draft', label: 'Draft' },
          { type: 'string', name: 'sources', label: 'Sources', list: true }
        ],
      },
    ],
  },
});
