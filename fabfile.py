import boto3
import json
import time
from pprint import pprint

ec2_client = boto3.client('ec2')
ec2_resource = boto3.resource('ec2')
s3 = boto3.client('s3')

def create_bucket(name, acl='private', location='ap-southeast-1'):
  s3.create_bucket(ACL=acl, Bucket=name, CreateBucketConfiguration={'LocationConstraint': location})

def put_objects_test(name):
  data={}
  data["hello"] = "world"
  s3.put_object(Bucket=name, Key='data0', Body=json.dumps(data))

def list_objects_test(name):
  print(s3.list_objects(Bucket=name))


def list_ec2_instances():
	instances = {}
	res = ec2_client.describe_instances()
	for r in res['Reservations']:
		for ins in r['Instances']:
			if ins['State']['Name'] == 'running':
				instances[ins['InstanceId']] = ins['PublicIpAddress']
	print(instances)

def list_images():
	res = ec2_client.describe_images(Owners=['self'])
	for img in res['Images']:
		print("Name: ",img['Name'])
		print("Image: ", img['ImageId'])
		print("Description: ", img['Description'])
		print("----")

def save_instance(ins, name, desc='My new instance'):
	res = ec2_client.create_image(InstanceId=ins, Name=name, Description=desc)
	print("Created image: ",res['ImageId'])
	print("Waiting for it to be available...")

	# wait for it to be available
	available = 0
	while (not available):
		status = ec2_client.describe_images(ImageIds=[res['ImageId']])
		img = status['Images'][0]
		available = (img['State'] == 'available')
		time.sleep(1)

def credel_instances_test(n):
	response = ec2_client.describe_vpcs()
	vpc_id = response.get('Vpcs', [{}])[0].get('VpcId', '')
	sgs = ec2_client.create_security_group(GroupName='SECURITY_GROUP',Description='DESCRIPTION',VpcId=vpc_id)
	security_group_id = sgs['GroupId']
	data = ec2_client.authorize_security_group_ingress(
		GroupId=security_group_id,
        IpPermissions=[
            # {'IpProtocol': 'tcp',
            #  'FromPort': 80,
            #  'ToPort': 80,
            #  'IpRanges': [{'CidrIp': '0.0.0.0/0'}]},
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
        ])
	instances = ec2_resource.create_instances(ImageId='ami-0786130275fb84fdf', InstanceType='t2.micro',MinCount=n,MaxCount=n,KeyName='testKey',SecurityGroupIds=[security_group_id])
	# instances = ec2_resource.create_instances(ImageId='ami-061eb2b23f9f8839c', InstanceType='t2.micro',MinCount=n,MaxCount=n,KeyName='testKey',SecurityGroupIds=[security_group_id])
	
	instancesIds = [inst.id for inst in instances]
	
	# allocations = [ec2_client.allocate_address(Domain='vpc') for i in range(n)]
	# while instances[0].update() != "running":

	# 	time.sleep(5)
	print(dir(instances[0]))
	# time.sleep(120)
	instances[0].wait_until_running()
	instances[0].reload()
	print(instances[0].public_ip_address)
	# responses = [ec2_client.associate_address(AllocationId=allocations[i]['AllocationId'],InstanceId=instancesIds[i]) for i in range(n)]
	
	print(instancesIds)
	
	xxx = input()

	# responses = [ec2_client.release_address(AllocationId=allocations[i]['AllocationId']) for i in range(n)]
	ec2_resource.instances.filter(InstanceIds=instancesIds).terminate()
	instances[0].wait_until_terminated()
	ec2_client.delete_security_group(GroupId=security_group_id)
# print(x[0])
# key_name = 'testKey'
# key = ec2_client.create_key_pair(
#     KeyName=key_name,
# )
# with open('./'+key_name+'.pem','w') as f:
# 	f.write(key['KeyMaterial'])

# list_ec2_instances()
# security_group = ec2_resource.SecurityGroup('sg-0d161ff1c2563f0a4')
# print(security_group.ip_permissions[1])
# print(dir(security_group))

credel_instances_test(1)

# response = ec2_client.describe_vpcs()
# pprint(response)
# vpc_id = response.get('Vpcs', [{}])[0].get('VpcId', '')
# print(vpc_id)