#! /usr/local/bin/bash


# Since our ticketing resources expect this.
echo "Enter JWT secret"
read -r
JWT_KEY=$REPLY
kubectl create secret generic jwt-secret --from-literal JWT_KEY=$JWT_KEY

echo "Enter the stripe secret":
read -r
STRIPE_KEY=$REPLY
echo "Enter the stripe *public* key"
read -r
STRIPE_PUBLIC_KEY=$REPLY
kubectl create secret generic stripe-secret \
  --from-literal STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY \
  --from-literal STRIPE_KEY=$STRIPE_KEY

