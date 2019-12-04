#!/bin/bash
if [ $# -le 1 ]
  then
    echo "Please provide access key and secret access key."
    exit
fi
aws configure set aws_access_key_id $1
aws configure set aws_secret_access_key $2
aws configure set default.region ap-southeast-1
aws configure set default.output json
group_id=$(aws ec2 create-security-group --group-name 'test' --description 'test security group' | grep 'GroupId' | sed 's/\"GroupId\": \"//g' | sed 's/\"//g')
#echo $group_id
vpcid=$( aws ec2 describe-security-groups --group-ids $group_id | grep 'VpcId' | sed 's/\"VpcId\": \"//g' | sed 's/\",//g')
#echo $vpcid
echo $group_id >> analytics_info.txt
echo $vpcid >> analytics_info.txt
