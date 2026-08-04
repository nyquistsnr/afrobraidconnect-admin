"use client";

import { ToastContainer } from "react-toastify";
import { useTheme } from "@/components/theme/theme-provider";

export function AppToastContainer() {
  const { resolvedTheme } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      theme={resolvedTheme}
      autoClose={5000}
      newestOnTop
    />
  );
}
