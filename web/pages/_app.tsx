import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import theme from "../theme/theme";
import Layout from "../components/Layout/Layout";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

import type { ReactElement } from "react";

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </SessionProvider>
  );
}
