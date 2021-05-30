import axios from 'axios';
import https from 'https';

const builder = ({ req }) => {
  if (typeof window === 'undefined') {
    // not in a browser. NodeJS.
    const base = process.env.NEXT_PUBLIC_BASE_URI;
    return axios.create({
      baseURL: `https://${base}`,
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

const fetcher = async url => {
  return axios({
    baseURL: url,
    method: 'get'
  })
    .then(res => {
      return res.data
    })
    .catch(err => {
      console.log('caught', err.toString());
      throw err;
    });
};

export { fetcher };

export default builder;