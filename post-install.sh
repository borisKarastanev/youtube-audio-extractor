#!/bin/sh

# Read the config file into an array
readFile() {
  array=()
  while IFS= read -r line
  do
    array+=("$line") #push the lines into the array
  done < "$1"
}

readFile ./config.json

#EXTR_FOLDER=${array[3]}
IFS='" ' read -r -a cfgFolder <<< ${array[3]}

AUDIO_FOLDER_PATH=${cfgFolder[2]}

mkdir ${AUDIO_FOLDER_PATH}

echo "Done"
