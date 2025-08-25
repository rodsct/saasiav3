import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
// Temporarily removed CSS import to fix build errors - will restore after OAuth works
// import "../styles/index.css";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <div>
            <Header />
            {children}
            <Footer />
            <ScrollToTop />
          </div>
        </Providers>
      </body>
    </html>
  );
}
