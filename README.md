# Stockroom: Inventory Dashboard

A data-driven inventory dashboard built for Week 2 of the Zynvex Full Stack internship. It pulls a nested product feed from the [DummyJSON](https://dummyjson.com/docs/products) API, parses it into typed domain models, and manages it with Zustand.

**Live:** https://zynvex-inventory-dashboard.vercel.app

## Features

- **Typed data parser.** `src/lib/parse.ts` maps the raw nested feed into `Product`, `Category` and `Rating` models with a higher-order `mapFeed` helper. Bad records are skipped instead of crashing the page.
- **Async ingestion with resilience.** Requests time out, retry with backoff, and show loading, error and retry states. Errors are grouped into network, timeout, HTTP and parse failures.
- **Zustand store with slices** for the catalog, filters, UI and search. Products you add yourself persist in localStorage.
- **Debounced search with a query cache.** API search results are cached in localStorage with a time limit and least-recently-used eviction, so repeated searches return instantly.
- **Filters:** category sidebar, tag chips, stock status, sort and grid/table views.
- **Stats row** for product count, inventory value, items that need restocking and average rating.
- **Product form** using React Hook Form and Zod, with field errors, a tag input and a live preview.
- **Error boundaries** at route, global and section level, so one failing panel doesn't take down the page.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Zustand · React Hook Form · Zod · Vercel

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 29 unit tests (node:test via tsx)
```

Checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Structure

```
src/lib         types, parser, API client, filters, search cache, form schema
src/store       Zustand store (catalog, filter, UI and search slices)
src/components  dashboard, form and UI components
src/app         dashboard page, /products/new, error boundaries
```
