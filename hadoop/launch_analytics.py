
import json
import boto3
import sys

ec2_client = boto3.client('ec2')
ec2_resource = boto3.resource('ec2')

def create_analytics(key_name,inst_name='worker_node',n=1,instance_id='ami-061eb2b23f9f8839c',instance_type='t2.micro',userdata_file=None):
# create n number of worker nodes + 1 node master
    userdata=""
#    print(userdata_file)
    if userdata_file is not None:
#        print('here')
        with open(userdata_file,'r') as f:
            userdata=f.read()
#    print(userdata)
    #master_data=userdata.replace("cd /home/ubuntu","cd /home/ubuntu\ncat /dev/zero | ssh-keygen -q -b 4096 -N \"\"")
    #print(master_data)
    response = ec2_client.describe_vpcs()
    vpc_id = response.get('Vpcs', [{}])[0].get('VpcId', '')
    sgs = ec2_client.describe_security_groups()
    for sg in sgs['SecurityGroups']:
        if sg["GroupName"] == 'SECURITY_GROUP3':
            ec2_client.delete_security_group(GroupName='SECURITY_GROUP3')
    sgs = ec2_client.create_security_group(GroupName='SECURITY_GROUP3',Description='DESCRIPTION',VpcId=vpc_id)
    security_group_id = sgs['GroupId']
    data = ec2_client.authorize_security_group_ingress(
        GroupId=security_group_id,
        IpPermissions=[
            {'IpProtocol': 'tcp',
            'FromPort': 22,
            'ToPort': 22,
            'IpRanges': [{'CidrIp': '0.0.0.0/0'}]}
            ]
            )
    master = ec2_resource.create_instances(ImageId=instance_id, InstanceType=instance_type,MinCount=1,MaxCount=1,KeyName=key_name,SecurityGroupIds=[security_group_id],UserData=userdata)
    userdata = userdata.replace("node_master",inst_name,1)
    workers = ec2_resource.create_instances(ImageId=instance_id, InstanceType=instance_type,MinCount=1,MaxCount=n,KeyName=key_name,SecurityGroupIds=[security_group_id],UserData=userdata)
    # instancesIds = [inst.id for inst in instances]
    for worker in workers:
        worker.wait_until_running()
    master[0].wait_until_running()
    for worker in workers:
        worker.reload()
    master[0].reload()
    insts = {"node_master":{"publicdns":master[0].public_dns_name,"privateip":master[0].private_ip_address}}
    for i in range(len(workers)):
        insts[inst_name+str(i)] = {"publicdns":workers[i].public_dns_name,"privateip":workers[i].private_ip_address}
    #insts_label = {inst_name:insts}
    insts_file = open('analytics_instances.json','w')
    json.dump(insts,insts_file)
    insts_file.close()
    for key,value in insts.items():
       print(key,value)
    # xxx = input()
    # # responses = [ec2_client.release_address(AllocationId=allocations[i]['AllocationId']) for i in range(n)]
    # ec2_resource.instances.filter(InstanceIds=instancesIds).terminate()
    # web[0].wait_until_terminated()
    # ec2_client.delete_security_group(GroupId=security_group_id)

create_analytics(sys.argv[1],n=int(sys.argv[2]),userdata_file="hadoop_node.sh")
#print(sys.argv[1])
#print(type(sys.argv[1]))

