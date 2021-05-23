// This file is "magic" for next
import Head from 'next/head'
import { CookiesProvider, useCookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.css';
import '../components/local.css';
import buildClient from '../api/build-client';
import Header from '../components/header';
import { useState, useEffect } from 'react';
import ErrorPage from './404';

const AppComponent = (props) => {
  const { Component, pageProps, currentUser } = props;
  const [cookies, setCookie] = useCookies("flash");

  if (pageProps.statusCode) {
    console.log('error via _app');
    return <ErrorPage />;
  }

  const [showFlash, setShowFlash] = useState(false);
  useEffect(() => {
    if (pageProps.flashItems) {
      setTimeout(() => {
        setShowFlash(false);
      }, 5 * 1000);
      setShowFlash(true);
    }
  }, [pageProps.flashItems]);

  const addFlash = (message) => {
    setCookie(message);
  };

  const disappearingAlert = (msg) => {
    return (
      <div className='alert alert-primary disappear'>
        {msg}
      </div>
    );
  };

  return (
    <CookiesProvider>
      <div>
        <Head>
          <title>Fake Tickets!</title>
        </Head>
        <Header currentUser={currentUser} />
        <div className='container'>
          {showFlash && disappearingAlert(pageProps.flashItems)}
          <Component addFlash={addFlash} currentUser={currentUser} {...pageProps} />
        </div>
      </div>
    </CookiesProvider>
  );
};

AppComponent.getInitialProps = async appContext => {

  const client = await buildClient(appContext.ctx);
  let data;
  try {
    const resp = await client.get('/api/users/currentuser');
    data = resp.data;
  }
  catch (err) {
    console.error('dying inside getInitialProps');
    const inServer = typeof window === 'undefined';
    if (inServer) {
      console.error('in server');
    }
    if (typeof window !== 'undefined') {
      throw err;
    }
  }

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    // To save doing this in the wrapped Component, pass client
    // and currentUser to its pageProps.
    try {
      pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
    }
    catch (err) {
      pageProps.statusCode = err.statusCode ? err.statusCode : 404;
    }
  }

  // Handle flash data.
  if (typeof window !== 'undefined') {
    const flash = cookies;
    if (flash) {
      pageProps.flashItems = flash;
      setCookies(null);
    }
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
