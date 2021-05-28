// This file is "magic" for next
import Head from 'next/head'
import { CookiesProvider, useCookies, Cookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.css';
import '../components/local.css';
import buildClient from '../api/build-client';
import Header from '../components/header';
import { useState, useEffect } from 'react';
import ErrorPage from './404';

const AppComponent = (props) => {
  const { Component, pageProps, currentUser } = props;
  const [cookies, setCookie, removeCookie] = useCookies(['flash']);

  // Catch random promise rejections.
  useEffect(() => {
    const handler = function (promiseRejectionEvent) {
      // this.alert('expose background console');
      console.log('promise threw', promiseRejectionEvent);
    };
    window.addEventListener("unhandledrejection", handler, false);

    return () => {
      window.removeEventListener("unhandledrejection", handler, false);
    };

  }, []);

  if (pageProps.statusCode) {
    console.log('error via _app');
    return <ErrorPage />;
  }

  const [showFlash, setShowFlash] = useState(false);
  useEffect(() => {
    if (cookies.flash) {
      if (!showFlash) {
        setShowFlash(cookies.flash);
        removeCookie('flash');
      }
      const timer = setTimeout(() => {
        setShowFlash(false);
      }, 8 * 1000);
    }
  }, [cookies]);

  const addFlash = (message) => {
    setCookie('flash', message, { sameSite: true });
    // But note that calling serialize directly 
    // *does* append the option:
    //console.log(cookie.serialize('flash', message, { sameSite: true }));
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
          {showFlash && disappearingAlert(showFlash)}
          <Component addFlash={addFlash} currentUser={currentUser} {...pageProps} />
        </div>
      </div>
    </CookiesProvider>
  );
};

AppComponent.getInitialProps = async appContext => {
  const client = buildClient(appContext.ctx);
  let data;
  try {
    if (client && process.env.NEXT_PHASE !== 'phase-production-build') {
      const resp = await client.get('/api/users/currentuser');
      data = resp.data;
    }
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
    // We need to use the OO interface for 
    // react-cookie, since we cannot see
    // into the main function.
    const cookies = new Cookies();
    const flash = cookies.get('flash');
    if (flash) {
      pageProps.flashItems = flash;
      cookies.remove('flash');
      console.log('unset the cookie in GIP')
    }
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
