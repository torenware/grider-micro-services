#! /usr/local/bin/bash

minikube -p grider start --driver virtualbox
minikube -p grider addons enable ingress
minikube -p grider addons enable metrics-server
minikube -p grider ip

# Since our ticketing resources expect this.
kubectl create secret generic jwt-secret --from-literal JWT_KEY=supah-secret

echo "Enter the stripe secret":
read -r
STRIPE_KEY=$REPLY
kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=$STRIPE_KEY

