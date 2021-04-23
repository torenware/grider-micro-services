// This file is "magic" for next
import 'bootstrap/dist/css/bootstrap.css';

// next uses this Component to wrap the pages.
const wrapper = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default wrapper;