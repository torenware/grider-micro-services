import axios from 'axios';
import https from 'https';
import fs, { promises } from 'fs';

const options = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }),
  timeout: 10 * 1000
};

const loadOptions = () => {
  const cookie = loadCookie();
  const optionsWithCookie = { ...options };
  if (cookie) {
    optionsWithCookie['headers'] = {
      cookie
    };
  }
  return optionsWithCookie;
};


const writeCookie = async (data) => {
  await promises.writeFile('./cookies.txt', data);
};

const loadCookie = () => {
  let data;
  try {
    if (!fs.existsSync('./cookies.txt')) {
      console.log('No cookie file found.')
      return null;
    }
    data = fs.readFileSync('./cookies.txt');
    return data;
  }
  catch (err) {
    console.log('loadCookie:', err.toString());
  }
  return null;
};


export const currentUser = async () => {
  const url = 'https://ticketing.local/api/users/currentuser';

  try {
    const response = await axios.get(url, loadOptions());
    console.log(response.data);

  }
  catch (err) {
    console.log(err);
    console.log(err.toString());

  }
};

export const createTicket = async (title, price) => {
  const data = {
    title,
    price: parseFloat(price)
  }
  const url = 'https://ticketing.local/api/tickets';
  try {
    const response = await axios.post(url, data, loadOptions());
    // axios does not implement await correctly; you *always*
    // get back a Promise<Pending>. This sucks. WTF?
    return await response.data;
  }
  catch (err) {
    console.error('threw in createTicket');
    console.error(err.toString());
  }
  return {};
};

export const createOrder = async (ticketId) => {
  const data = {
    ticketId
  };
  const url = 'https://ticketing.local/api/orders';
  try {
    const response = await axios.post(url, data, loadOptions());
    // axios does not implement await correctly; you *always*
    // get back a Promise<Pending>. This sucks. WTF?
    return await response.data;
  }
  catch (err) {
    console.error('threw in createTicket');
    console.error(err.toString());
  }
  return {};
};

// https://gist.github.com/nzvtrk/ebf494441e36200312faf82ce89de9f2
export const signUp = async (email, password) => {
  const url = 'https://ticketing.local/api/users/signup';

  try {
    const response = await axios.post(url, {
      email,
      password
    }, options);

    await writeCookie(response.headers['set-cookie'][0]);

  }
  catch (err) {
    console.log(err.toString());
  }
};

export const signIn = async (email, password) => {
  const url = 'https://ticketing.local/api/users/signin';

  try {
    const response = await axios.post(url, {
      email,
      password
    }, options);

    console.log(response.data);
    console.log(response.headers);
    await writeCookie(response.headers['set-cookie'][0]);

  }
  catch (err) {
    console.log(err.toString());
  }
};

export const signOut = () => {
  // Just toss the cookie.
  if (fs.existsSync('./cookies.txt')) {
    fs.unlinkSync('./cookies.txt');
    console.log('deleted cookie file');
  }
}

// signUp('yaya@yayas.org', 'yayayayaya');

currentUser();
const data = createTicket('Show That Never Ends', 42);
const ticket = await data;
console.log('awaiting ticket at top level:', ticket);
data.then(rslt => {
  console.log(rslt);
  const ticketId = rslt.id;
  const orderPromise = createOrder(ticketId);
  orderPromise.then(order => {
    console.log('Order:', order);
  })
});

