#! /usr/local/bin/bash

echo "Enter the stripe secret":
read -r
STRIPE_KEY=$REPLY
echo "Enter the stripe *public* key"
read -r
STRIPE_PUBLIC_KEY=$REPLY
kubectl create secret generic stripe-secret \
  --from-literal STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY \
  --from-literal STRIPE_KEY=$STRIPE_KEY

