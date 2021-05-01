#! /usr/local/bin/bash

minikube -p grider start --driver virtualbox
minikube -p grider addons enable ingress
minikube -p grider addons enable metrics-server
minikube -p grider ip

# Since our ticketing resources expect this.
kubernetes create secret generic jwt-secret --from-literal JWT_KEY=supah-secret

