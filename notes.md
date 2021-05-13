# Notes on the Ticketing App (Grider Course)

## Setup for auth

- Set up with typescript:

```
yarn init
yarn add typescript ts-node-dev express @types/express
tsc --init
```

## Manual test auth

```bash
curl -X POST ticketing.local/api/users/signup -H "Content-Type: application/json" -d '{"password": "linuxize", "email": "linuxize@example.com"}
```

Improved:

```bash
curl -v --insecure -X POST https://ticketing.local/api/users/signup -H \
"Content-Type: application/json"  -d '{"password": "linuxize", "email": "linuxize@tester.org"}'
```

## Secret for JWT

```
k create secret generic jwt-secret --from-literal jwt=so-very-secret
```
