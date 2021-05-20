#! /usr/local/bin/bash

DIRS="auth tickets orders expiration payments"

for proj in $DIRS; do
  echo "-----------------"
  echo $proj
  echo "-----------------"
  pushd $proj
  yarn test:ci 
  popd
done

