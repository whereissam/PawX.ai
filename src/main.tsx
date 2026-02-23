import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "@/components/theme-provider";
import { KolSelectionProvider } from "@/hooks/use-kol-selection";
import { InteractionConfigProvider } from "@/hooks/use-interaction-config";
import { AuthProvider } from "@/hooks/use-auth";
import "./index.css";

const router = createRouter({ routeTree });

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <KolSelectionProvider>
            <InteractionConfigProvider>
              <RouterProvider router={router} />
            </InteractionConfigProvider>
          </KolSelectionProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
