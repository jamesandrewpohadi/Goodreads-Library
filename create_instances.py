import json
import boto3

ec2_client = boto3.client('ec2')
ec2_resource = boto3.resource('ec2')

def credel_instances_test(n):
    response = ec2_client.describe_vpcs()
    vpc_id = response.get('Vpcs', [{}])[0].get('VpcId', '')
    sgs = ec2_client.create_security_group(GroupName='SECURITY_GROUP',Description='DESCRIPTION',VpcId=vpc_id)
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
    instances = ec2_resource.create_instances(ImageId='ami-061eb2b23f9f8839c', InstanceType='t2.micro',MinCount=n,MaxCount=n,KeyName='testKey',SecurityGroupIds=[security_group_id])
    instancesIds = [inst.id for inst in instances]
    instances[0].wait_until_running()
    instances[1].wait_until_running()
    instances[2].wait_until_running()
    instances[0].reload()
    instances[1].reload()
    instances[2].reload()
    insts = {
        "mysql-server":instances[0].public_ip_address,
        "mongodb-server":instances[1].public_ip_address,
        "web-server":instances[2].public_ip_address
    }
    insts_file = open('web/instance.json','w')
    json.dump(insts,insts_file)
    insts_file.close()
    print([instances[i].public_ip_address for i in range(3)])
	
	# xxx = input()

	# # responses = [ec2_client.release_address(AllocationId=allocations[i]['AllocationId']) for i in range(n)]
	# ec2_resource.instances.filter(InstanceIds=instancesIds).terminate()
	# instances[0].wait_until_terminated()
	# ec2_client.delete_security_group(GroupId=security_group_id)

credel_instances_test(3)