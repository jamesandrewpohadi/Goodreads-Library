#!/bin/bash
#check if script it running as root
if [[ $EUID>0 ]]
then
  echo "Please run again as root"
  exit
fi

echo "creating analytics cluster"
node_master=$1
args=("$@")
echo ${args[@]}
node_workers=("${args[@]:1:$#}")
echo $node_master
echo ${node_workers[@]}
echo ${node_workers[3]}
#pip list | grep -qi "boto3"
#echo $value
#if [[ $value=~"boto3" ]]
#then
#  echo "boto3 is installed"
#fi
#value=$(eval pip list | grep -q `boto3`)
#echo $value

