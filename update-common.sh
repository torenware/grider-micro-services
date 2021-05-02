#! /usr/local/bin/bash

DIRS="auth tickets orders nats-test expiration payments"

for proj in $DIRS; do
  echo "-----------------"
  echo $proj
  echo "-----------------"
  pushd $proj
  yarn upgrade @grider-courses/common --latest
  popd
done

