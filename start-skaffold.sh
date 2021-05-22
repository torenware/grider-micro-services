#! /usr/local/bin/bash

while read line;
do
    echo $line
     f1=$(echo $line | cut -f 1 -d =)
     f2=$(echo $line | cut -f 2 -d =)

     if [ -z "$f2" ]; then
         continue
     fi

     [[ $f1 =~ ^# ]] && continue
     val=$(echo $f2 | tr -d \'\")
     export $f1=$val

done < .env

skaffold dev

