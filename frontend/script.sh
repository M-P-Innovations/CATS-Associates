#!/bin/bash

RECAPTCHA_KEY="$1"  # Get the reCAPTCHA key passed as an argument to the script

filepath="./build/static/js/"
searchstring="process.env.REACT_APP_RECAPTCHA_KEY"

# Check if the RECAPTCHA_KEY is set
if [ -z "$RECAPTCHA_KEY" ]; then
  echo "RECAPTCHA_KEY is not set. Exiting script."
  exit 1
fi

# Loop through the files in the specified path and replace the search string with the replace string
for file in $(grep -l -R "$searchstring" "$filepath")
do
  sed -i "s|$searchstring|$RECAPTCHA_KEY|g" "$file"
  echo "Modified: $file"
done
