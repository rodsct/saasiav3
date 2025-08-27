import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import "../../styles/index.css";
import Providers from "../providers";

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();

  return (
    <html suppressHydrationWarning lang={locale}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <div>
              <Header />
              {children}
              <Footer />
              <ScrollToTop />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}