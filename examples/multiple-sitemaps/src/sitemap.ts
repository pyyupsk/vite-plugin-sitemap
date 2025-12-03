import type { Route } from "@pyyupsk/vite-plugin-sitemap";

// Default export creates sitemap.xml
export default [
  { url: "https://example.com/" },
  { url: "https://example.com/about" },
  { url: "https://example.com/contact" },
  { url: "https://example.com/pricing" },
] satisfies Route[];

// Named export creates sitemap-blog.xml
export const blog: Route[] = [
  { url: "https://example.com/blog" },
  { url: "https://example.com/blog/hello-world" },
  { url: "https://example.com/blog/getting-started" },
  { url: "https://example.com/blog/advanced-tips" },
  { url: "https://example.com/blog/best-practices" },
];

// Named export creates sitemap-products.xml
export const products: Route[] = [
  { url: "https://example.com/products" },
  { url: "https://example.com/products/widget-a" },
  { url: "https://example.com/products/widget-b" },
  { url: "https://example.com/products/gadget-x" },
  { url: "https://example.com/products/gadget-y" },
];

// Named export creates sitemap-docs.xml
export const docs: Route[] = [
  { url: "https://example.com/docs" },
  { url: "https://example.com/docs/installation" },
  { url: "https://example.com/docs/configuration" },
  { url: "https://example.com/docs/api-reference" },
  { url: "https://example.com/docs/examples" },
  { url: "https://example.com/docs/faq" },
];
