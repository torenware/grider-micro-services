
const LandingPage = ({ currentUser }) => {
  return currentUser ? <h1>Signed into the site</h1> : <h1>Not signed in</h1>;
};

//The static method getInitialProps(), if present, gets called before 
// rendering, the results getting passed down to components as they render
// as props.
LandingPage.getInitialProps = async (context) => {
  return {};
}

export default LandingPage;
