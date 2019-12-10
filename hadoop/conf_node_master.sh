#!/bin/bash
cd /home/ubuntu
apt-get -y install jq
source /home/ubuntu/.profile
source /home/ubuntu/.bashrc
node_m_addr=$(cat analytics_instances.json | jq '.node_master.publicdns')
node_priv=$(cat analytics_instances.json | jq '.node_master.privateip')
node_m_addr=$(echo "${node_m_addr//\"}")
worker_addr=($(cat analytics_instances.json | jq 'to_entries[] | select(.key|test("worker_node.")) | .value.publicdns'))
worker_priv=($(cat analytics_instances.json | jq 'to_entries[] | select(.key|test("worker_node.")) | .value.privateip'))

cp /home/ubuntu/spark/conf/slaves.template /home/ubuntu/spark/conf/slaves
echo "" >> /home/ubuntu/spark/conf/slaves
for worker in ${worker_addr[@]}
do
worker=$(echo "${worker//\"}")
echo $worker >> /home/ubuntu/spark/conf/slaves
done
runuser -l ubuntu -c './spark/sbin/start-master.sh'
runuser -l ubuntu -c './spark/sbin/start-slaves.sh'
#runuser -l ubuntu -c "spark-submit --master spark://${node_m_addr}:7077 "
