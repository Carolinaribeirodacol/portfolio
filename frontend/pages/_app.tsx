import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { MantineProvider, createTheme, MantineColorsTuple, Container } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import { HeaderMenu } from "@/components/HeaderMenu";

const purple: MantineColorsTuple = [
  '#f6eeff',
  '#e7d9f7',
  '#cab1ea',
  '#ad86dd',
  '#9462d2',
  '#854bcb',
  '#7d3fc9',
  '#6b31b2',
  '#5f2ba0',
  '#52238d'
];

const theme = createTheme({
  colors: {
    purple,
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <HeaderMenu />

      <Container px="auto">
        <Component {...pageProps} />
      </Container>
    </MantineProvider>
  );
}
