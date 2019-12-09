#!/bin/bash
if [ $# -le 1 ]
  then
    echo "provide arguments for: no_of_nodes, key_name"
    exit
fi
exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking=no" -i $1 $2 $3
}
no_of_nodes=$1
key_name=$2
echo $1
echo $2
printf "\nlaunching servers\n"
python launch_analytics.py $key_name $no_of_nodes
node_m_addr=$(cat analytics_instances.json | jq '.node_master.publicdns')
node_m_addr=$(echo "${node_m_addr//\"}")
sleep 300
printf "\nmaking and sharing keys from ${node_m_addr}\n"
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" "ubuntu@${node_m_addr}:/home/ubuntu/.ssh/id_rsa.pub" master.pub
worker_addr=($(cat analytics_instances.json | jq 'to_entries[] | select(.key|test("worker_node.")) | .value.publicdns'))
for worker in ${worker_addr[@]}
do
worker=$(echo "${worker//\"}")
printf "\nsharing key to ${worker}\n"
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" master.pub "ubuntu@${worker}:/home/ubuntu/.ssh/master.pub"
exec_inst "${key_name}.pem" "ubuntu@${worker}" "cat /home/ubuntu/.ssh/master.pub >> /home/ubuntu/.ssh/authorized_keys"
done
#sleep 120
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" conf_node_master.sh "ubuntu@${node_m_addr}:/home/ubuntu"
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" analytics_instances.json "ubuntu@${node_m_addr}:/home/ubuntu"
exec_inst "${key_name}.pem" "ubuntu@${node_m_addr}" "sudo chmod 777 conf_node_master.sh && sudo ./conf_node_master.sh"
