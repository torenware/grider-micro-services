#! /usr/bin/env python

#
# Process a golang style template string as
# used in skaffold.yaml. Format is
#
#  {{ .VAR_NAME }}
#
#  This script will emulate the feature, and do an
#  environment substitution for VAR_NAME.
#
#  Usage will be:
#
#  cat skaffold.yaml | source client/.env.local && \
#     ./resolve_tmpl.py | skaffold dev -f -
#

import sys
import re
import os
from dotenv import load_dotenv


def process_line(line):
    """Process a single line of text"""
    pattern = r'{{\s*\.(\S+)\s*}}'

    matches = re.search(pattern, line)
    if matches:
        key = matches.group(1)
        #print(key, file=sys.stderr)
        var = os.environ.get(key, '<not found>')
        if var == '<not found>':
            print(f"Key {key} was not defined in the environment",
                  file=sys.stderr)
        return re.sub(pattern, var, line)
    return line


# print(os.getcwd(), file=sys.stderr)
load_dotenv('./client/.env.local')
# print(os.environ, file=sys.stderr)

for line in sys.stdin:
    processed = process_line(line)
    print(processed, end='')
