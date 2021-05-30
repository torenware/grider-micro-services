#! /usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $SCRIPT_DIR/client
if [ -d .next ]; then
  echo "Deleting .next/"
  rm -rf .next
else
  echo "No .next dir found"
fi
kubectl exec  $(kubectl get po -l app=client -o name --no-headers) -- tar -cf - .next | tar -xf -
