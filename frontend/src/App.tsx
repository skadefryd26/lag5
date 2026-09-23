import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { router } from "./router/router";

const theme = createTheme({
  primaryColor: "orange",
  fontFamily: "Georgia, 'Times New Roman', serif",
  defaultRadius: "md",
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
