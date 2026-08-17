import { Html, Head, Main, NextScript } from "next/document";
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';

export default function Document() {
  return (
    <Html lang="en" {...mantineHtmlProps}>
      <Head>
        <meta name="google-site-verification" content="d_RwfGA1FSQ_7Ko7BGnLxmZy84GKdATmn73ZE9UrAvo" />
        <meta name="msvalidate.01" content="7E3B0334ABC046F872EC2D820C2384E7" />
        <ColorSchemeScript defaultColorScheme="auto" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
