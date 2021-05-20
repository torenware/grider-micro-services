#! /usr/local/bin/bash

# Make the ingress related bug go away:
# kubectl delete -A ValidatingWebhookConfiguration ingress-nginx-admission
echo "Start skaffold with preprocessing..."
kubectl config use-context docker-desktop
tests/src/resolve_tmpl.py <skaffold.yaml | skaffold dev -f -
