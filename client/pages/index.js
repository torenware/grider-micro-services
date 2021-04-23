import axios from 'axios';

const LandingPage = (props) => {
  console.log('props:', props);
  return <h1>Landing Page</h1>;
};

//The static method getInitialProps(), if present, gets called before 
// rendering, the results getting passed down to components as they render
// as props.
LandingPage.getInitialProps = async ({ req }) => {
  // Weirdly enough, this *can* be executed browser side. So guard for it:
  console.log(req.headers);
  if (typeof window === 'undefined') {
    // NodeJS side!
    try {
      const { data } = await axios.get('http://ingress-nginx-controller.ingress-nginx/api/users/currentuser', {
        // headers: {
        //   // so the ingress controller knows which block to use:
        //   Host: 'ticketing.local'
        // }
        headers: req.headers
      });
      return data;
    }
    catch (err) {
      console.log('axios erred out', err)
      return {}
    }
  }
  else {
    const { data } = await axios.get('/api/users/currentuser');
    return data;
  }
}

export default LandingPage;
