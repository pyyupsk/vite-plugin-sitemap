import type { Route } from "@pyyupsk/vite-plugin-sitemap";

export default [
  // Breaking news article
  {
    url: "https://news.example.com/2025/01/breaking-tech-announcement",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2025-01-15T14:30:00Z",
      title: "Major Tech Company Announces Revolutionary Product",
      keywords: "technology, innovation, product launch",
    },
  },

  // Sports news
  {
    url: "https://news.example.com/2025/01/championship-finals-recap",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2025-01-14T22:00:00Z",
      title: "Championship Finals: Historic Victory for Underdogs",
      keywords: "sports, championship, finals",
    },
  },

  // Business news with stock tickers
  {
    url: "https://news.example.com/2025/01/market-analysis-q1",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2025-01-13T09:00:00Z",
      title: "Q1 Market Analysis: Tech Stocks Lead Recovery",
      keywords: "business, stocks, market analysis",
      stock_tickers: "NASDAQ:AAPL,NASDAQ:GOOGL,NYSE:MSFT",
    },
  },

  // International news in Spanish
  {
    url: "https://news.example.com/es/2025/01/elecciones-resultados",
    news: {
      publication: {
        name: "Example News España",
        language: "es",
      },
      publication_date: "2025-01-12T18:00:00Z",
      title: "Resultados de las Elecciones: Análisis Completo",
      keywords: "política, elecciones, resultados",
    },
  },

  // Opinion/Editorial piece
  {
    url: "https://news.example.com/2025/01/opinion-climate-policy",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2025-01-11T12:00:00Z",
      title: "Opinion: Why Climate Policy Needs Urgent Attention",
      keywords: "opinion, climate, policy, environment",
    },
  },

  // News article with images
  {
    url: "https://news.example.com/2025/01/photo-essay-wildlife",
    news: {
      publication: {
        name: "Example News",
        language: "en",
      },
      publication_date: "2025-01-10T08:00:00Z",
      title: "Photo Essay: Wildlife Conservation Success Stories",
    },
    images: [
      {
        loc: "https://news.example.com/images/wildlife-1.jpg",
        title: "Endangered Species Recovery",
        caption: "A family of tigers in their natural habitat",
      },
      {
        loc: "https://news.example.com/images/wildlife-2.jpg",
        title: "Marine Conservation",
        caption: "Coral reef restoration project results",
      },
    ],
  },
] satisfies Route[];
