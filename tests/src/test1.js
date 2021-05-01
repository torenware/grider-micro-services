import axios from 'axios';
import https from 'https';
import fs, { promises } from 'fs';



const writeCookie = async (data) => {
  console.log('about to write');
  await promises.writeFile('./cookies.txt', data);
  console.log('done writing we hope');
};

const loadCookie = () => {
  const cookies = [];
  let data;
  try {
    data = fs.readFileSync('./cookies.txt');
    console.log('read it maybe');
    cookies.push(data);
    return cookies;
  }
  catch (err) {
    console.log('loadCookie:', err.toString());
  }
};

const options = {
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
};

const doGet = async () => {
  const url = 'https://ticketing.local/api/users/currentuser';
  try {
    const response = await axios.get(url, options);
    console.log('we returned');
    console.log(response.data, typeof response.data);
    console.log(response.headers);
    await writeCookie(response.headers['set-cookie'][0]);

  }
  catch (err) {
    console.log(err.toString());

  }
};

// https://gist.github.com/nzvtrk/ebf494441e36200312faf82ce89de9f2
const login = async () => {
  const url = 'https://ticketing.local/api/users/signup';

  try {
    const response = await axios.post(url, {
      email: 'test7@email.com',
      password: 'not-real-secure'
    }, options);

    console.log(response.data);
    console.log(response.headers);
    await writeCookie(response.headers['set-cookie'][0]);

  }
  catch (err) {
    console.log(err.toString());
  }
};

const cookie = loadCookie();
console.log(cookie);

