// This file is "magic" for next
import { useCookies } from 'react-cookie';
import 'bootstrap/dist/css/bootstrap.css';
import '../components/local.css';
import buildClient from '../api/build-client';
import Header from '../components/header';
import { useState, useEffect } from 'react';


const AppComponent = ({ Component, pageProps, currentUser }) => {
  const [showFlash, setShowFlash] = useState(false);
  console.log('flash in component', pageProps.flashItems);
  useEffect(() => {
    if (pageProps.flashItems) {
      setTimeout(() => {
        console.log('timed out');
        setShowFlash(false);
      }, 5 * 1000);
      setShowFlash(true);
    }
  }, [pageProps.flashItems]);


  const addFlash = (message) => {
    localStorage.setItem('flashItems', message);
  };

  const disappearingAlert = (msg) => {
    return (
      <div className='alert alert-primary disappear'>
        {msg}
      </div>
    );
  };

  return (
    <div>
      <Header currentUser={currentUser} />
      <div className='container'>
        {showFlash && disappearingAlert(pageProps.flashItems)}
        <Component addFlash={addFlash} currentUser={currentUser} {...pageProps} />
      </div>
    </div>
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
    console.error(err.stack);
    console.error(err.toString());
    throw err;
  }


  let pageProps = {};

  if (appContext.Component.getInitialProps) {
    // To save doing this in the wrapped Component, pass client
    // and currentUser to its pageProps.
    pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
  }


  // Handle flash data.
  if (typeof window !== 'undefined') {
    // console.log('state:', flashMessages);
    const flash = localStorage.getItem('flashItems');
    if (flash) {
      pageProps.flashItems = flash;
      localStorage.removeItem('flashItems');
    }
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;