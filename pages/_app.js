import "../styles/globals.css";
import "highlight.js/styles/stackoverflow-dark.css";
import Router from 'next/router';
import NextNProgress from "../components/ProgressBar/ProgressBar";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import SiteNavigation from "../components/SiteNavigation";
import { SessionProvider } from "next-auth/react";
import { configure } from 'nprogress';
TimeAgo.setDefaultLocale(en.locale);
TimeAgo.addLocale(en);

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <>
      <SessionProvider session={session}>
        <SiteNavigation></SiteNavigation>
        <NextNProgress />
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
}

export default MyApp;
