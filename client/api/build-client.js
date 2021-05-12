import axios from 'axios';
import https from 'https';

const builder = async ({ req }) => {
  if (typeof window === 'undefined') {
    // not in a browser. NodeJS.
    return axios.create({
      baseURL: 'https://ticketing.torensys.com',
      headers: req.headers,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
  }
  else {
    return axios.create({
      baseURL: '/',
    });

  }
}


export default builder;