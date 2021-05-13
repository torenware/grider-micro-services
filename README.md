# My Take on Ticketing

This app was designed by Stephen Grider for his [Microservices With NodeJS and React](https://www.udemy.com/course/microservices-with-node-js-and-react/) course on [Udemy](https://www.udemy.com). I recommend the course highly, especially if you're interested in getting a gentle introduction in Kubernetes and in the workings of microservices on that and similar platforms.

The app as built up in Stephen's course has a suite of microservices built around a ticket selling and buying community, and has a NextJS frontend with server side rendering that consumes the API implemented through the express.js servers. That's all here, although I tended to try to write the features before he taught them, so my implementations can be subtly different. But I've added a few things that aren't in the original app:

* I have scripts I used to handle things like rebuilding clusters and exercising the API. Postman is fine, but really testing the services is tedious if you don't automate it.
* The API has been expanded so the UI can track the state of tickets, and to assign a numerical serial number to the tickets.
* I've implemented Let's Encrypt certificate support to make it easier use the app. In addition to Ingress Nginx (which is part of the course), this used CertManager with Route53 support, so I could use a domain set up in AWS's DNS.
* I'm using NextJS environment variable injection to move things like public keys out of the source and into files that don't go in Github. This includes a .env.local file, which sits in the root of the client/ directory and looks something like this:

```
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51ImnsGKlT5z4v76H...
NEXT_PUBLIC_BASE_URI=ingress-nginx-controller.ingress-nginx
NEXT_TELEMETRY_DISABLED=1
```
* The client build with Github Actions injects the `NEXT_PUBLIC_*` variables into the Dockerfile. It's also a production build.
* More Jest tests, 'cause I _like_ automated tests.
* Flash alerts for more feedback in the UI, with useEffect to make the alerts go away, and CSS animation to make them fade away before they do that.
