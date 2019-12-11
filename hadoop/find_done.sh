#!/bin/bash
echo 'trying'
until [ -f /home/ubuntu/finish.txt ]
do
     sleep 5
done
echo 'file found'
