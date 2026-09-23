import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { ClaimGauntletScreen } from "../features/claim-gauntlet/components/ClaimGauntletScreen";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ClaimGauntletScreen,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
