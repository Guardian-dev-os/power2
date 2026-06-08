import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // App is a Supabase-auth SPA: session lives in localStorage, so server
    // rendering can't hydrate auth state. Render everything on the client.
    defaultSsr: false,
  });

  return router;
};
