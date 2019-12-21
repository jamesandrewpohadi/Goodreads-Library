import json
import boto3
import sys

ec2_client = boto3.client('ec2')
ec2_resource = boto3.resource('ec2')

def credel_web_instances(key,instance_type):
    response = ec2_client.describe_vpcs()
    vpc_id = response.get('Vpcs', [{}])[0].get('VpcId', '')
    sgs = ec2_client.create_security_group(GroupName='SECURITY_GROUP1',Description='DESCRIPTION',VpcId=vpc_id)
    security_group_id = sgs['GroupId']
    data = ec2_client.authorize_security_group_ingress(
        GroupId=security_group_id,
        IpPermissions=[
            {'IpProtocol': 'tcp',
            'FromPort': 22,
            'ToPort': 22,
            'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp',
            'FromPort': 27017,
            'ToPort': 27017,
            'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp',
            'FromPort': 3306,
            'ToPort': 3306,
            'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
            {'IpProtocol': 'tcp',
            'FromPort': 3000,
            'ToPort': 3000,
            'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
            ]
            )
    mongodb = ec2_resource.create_instances(ImageId='ami-061eb2b23f9f8839c', InstanceType=instance_type,MinCount=1,MaxCount=1,KeyName=key,SecurityGroupIds=[security_group_id])
    mysql = ec2_resource.create_instances(ImageId='ami-061eb2b23f9f8839c', InstanceType=instance_type,MinCount=1,MaxCount=1,KeyName=key,SecurityGroupIds=[security_group_id])
    web = ec2_resource.create_instances(ImageId='ami-061eb2b23f9f8839c', InstanceType=instance_type,MinCount=1,MaxCount=1,KeyName=key,SecurityGroupIds=[security_group_id])
    # instancesIds = [inst.id for inst in instances]
    mongodb[0].wait_until_running()
    mysql[0].wait_until_running()
    web[0].wait_until_running()
    mongodb[0].reload()
    mysql[0].reload()
    web[0].reload()
    insts = {
        "mysql-server":mysql[0].public_ip_address,
        "mongodb-server":mongodb[0].public_ip_address,
        "web-server":web[0].public_ip_address
    }
    insts_file = open('web/instance.json','w')
    json.dump(insts,insts_file)
    insts_file.close()
    print('mongodb',mongodb[0].public_ip_address)
    print('mysql',mysql[0].public_ip_address)
    print('web',web[0].public_ip_address)
    instancesIds = [mongodb[0].id,mysql[0].id,web[0].id]
    # xxx = input()
    # # responses = [ec2_client.release_address(AllocationId=allocations[i]['AllocationId']) for i in range(n)]
    # ec2_resource.instances.filter(InstanceIds=instancesIds).terminate()
    # web[0].wait_until_terminated()
    # ec2_client.delete_security_group(GroupId=security_group_id)

credel_web_instances(sys.argv[1], sys.argv[2])
