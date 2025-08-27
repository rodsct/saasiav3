"use client";

import AuthProvider from "@/components/Auth/AuthProvider";
import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        defaultTheme="dark"
        forcedTheme="dark"
      >
        <Toaster 
          toastOptions={{
            style: {
              background: '#3f3f3f',
              color: '#fff',
              border: '1px solid #4f4f4f'
            }
          }}
        />

        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
