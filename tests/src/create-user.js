import axios from 'axios';
import http from 'http';
const HOST = "https://ticketing.local";

const login = async () => {
  try {
    // const instance = axios.create({
    //   httpsAgent: new https.Agent({
    //     rejectUnauthorized: false
    //   })
    // });
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const instance = axios.create({
      url: '/api/users/currentuser',
      baseURL: HOST,
      method: 'GET',
      //timeout: 1000,
      rejectUnauthorized: false
    });

    const response = await instance.request({
      data: {
        email: 'test@email.org',
        password: 'a-password'
      }
    }, {
      httpsAgent
    });
    console.log('data:', response.data.json);
  }
  catch (err) {
    console.log('error path');
    console.log(typeof err);
    console.log(err.toString())
    if (err.isAxiosError) {
      console.log('its an error');
    }
    //console.log('err:', err.toJSON());
  }



}

export { login };
