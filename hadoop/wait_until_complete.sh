#!/bin/bash
key=$1
addr=$2
scp -o "StrictHostKeyChecking=no" -i "${key}.pem" find_done.sh "ubuntu@${addr}:/home/ubuntu" 
ssh -o "StrictHostKeyChecking=no" -i "${key}.pem" "ubuntu@${addr}" "./find_done.sh"
