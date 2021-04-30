import needle from 'needle';

const HOST = "https://ticketing.local";

const login = async () => {
  const response = await needle.get(HOST);

  console.log(response);

}

export {login};
