#! /usr/local/bin/bash

# Set up docker env
source <(minikube -p grider docker-env)
echo "Starting skaffold using minikube's docker environment"
# Make the ingress related bug go away:
kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission

skaffold dev

