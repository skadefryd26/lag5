import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { router } from "./router/router";

const theme = createTheme({
  primaryColor: "orange",
  fontFamily: "'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  defaultRadius: "md",
  colors: {
    dark: [
      "#c7cdf5",
      "#a6afe8",
      "#7c86cf",
      "#5860a8",
      "#3a4180",
      "#242a5e",
      "#171c48",
      "#10143a",
      "#0a0f2e",
      "#060b2e",
    ],
  },
});

const queryClient = new QueryClient();

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
