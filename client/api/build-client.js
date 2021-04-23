import axios from 'axios';

const builder = async ({ req }) => {
  if (typeof window === 'undefined') {
    // not in a browser. NodeJS.
    return axios.create({
      baseURL: 'http://ingress-nginx-controller.ingress-nginx',
      headers: req.headers
    });
  }
  else {
    return axios.create({
      baseURL: '/',
    });

  }
}


export default builder;