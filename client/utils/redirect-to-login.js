import Router from 'next/router';

const redirectIfNotLoggedIn = (user) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!user || !user.id) {
    Router.push('/auth/signin');
  }
}

export default redirectIfNotLoggedIn;