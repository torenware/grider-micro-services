#! /usr/local/bin/bash

echo "Starting skaffold using minikube's docker environment"
# Make the ingress related bug go away:
kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission

skaffold dev

