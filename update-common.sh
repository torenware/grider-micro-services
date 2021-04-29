#! /usr/local/bin/bash

DIRS="auth tickets orders nats-test"

for proj in $DIRS; do
  echo $proj
  pushd $proj
  yarn upgrade @grider-courses/common
  popd
done

