#! /usr/local/bin/bash

if minikube -p grider status > /dev/null; then
		echo "Minikube is running as grider"
else
		# 
		echo "Start up minikube"
		minikube -p grider start
fi

# Set up docker env
source <(minikube -p grider docker-env)
echo "Starting skaffold using minikube's docker environment"
# Make the ingress related bug go away:
kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission

skaffold dev

