#! /usr/local/bin/bash

# Make the ingress related bug go away:
# kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission

echo "switch to docker context"
kubectl config use-context docker-desktop
skaffold dev

