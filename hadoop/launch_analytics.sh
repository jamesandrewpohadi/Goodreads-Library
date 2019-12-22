#!/bin/bash
if [ $# -le 1 ]
  then
    echo "provide arguments for: key_name, no_of_nodes(optional: default = 2}, instance_type(optional: default = m4.large)"
    exit
fi
exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking=no" -i $1 $2 $3
}
key_name=$1
no_of_nodes=${2:-2}
instance_type=${3:-m4.large}
echo $1
echo $2
printf "\nlaunching servers\n"
python3 launch_analytics.py $key_name $no_of_nodes $instance_type
node_m_addr=$(cat analytics_instances.json | jq '.node_master.publicdns')
node_m_addr=$(echo "${node_m_addr//\"}")
worker_addr=($(cat analytics_instances.json | jq 'to_entries[] | select(.key|test("worker_node.")) | .value.publicdns'))
echo "wait until completion"
# for worker in ${worker_addr[@]}
# do
# worker=$(echo "${\worker_addr[i]//\"}")
# (./wait_until_complete.sh $key_name ${worker})
# done
./wait_until_complete.sh $key_name $node_m_addr
#sleep 480
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
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" ../web/instance.json "ubuntu@${node_m_addr}:/home/ubuntu"
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" good_test.py "ubuntu@${node_m_addr}:/home/ubuntu"
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" pc_for_hdfs.py "ubuntu@${node_m_addr}:/home/ubuntu"
exec_inst "${key_name}.pem" "ubuntu@${node_m_addr}" "sudo chmod 777 conf_node_master.sh && sudo ./conf_node_master.sh"

# exec_inst "${key_name}.pem" ubuntu@${node_m_addr} "/home/ubuntu/spark/bin/spark-submit --executor-memory 5G --master 'spark://${node_m_addr}:7077' pc_for_hdfs.py ${node_m_addr} &> /home/ubuntu/pearson-correlation.log"
# exec_inst "${key_name}.pem" ubuntu@${node_m_addr} "/home/ubuntu/spark/bin/spark-submit --executor-memory 5G --master 'spark://${node_m_addr}:7077' good_test.py ${node_m_addr} &> /home/ubuntu/tfidf.log"
# exec_inst "${key_name}.pem" ubuntu@${node_m_addr} "hdfs dfs -copyToLocal /user/ubuntu/tfidf_result ./"
# exec_inst "${key_name}.pem" ubuntu@${node_m_addr} "hdfs dfs -copyToLocal /user/ubuntu/pearson-correlation_result ./"

scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" "ubuntu@${node_m_addr}:/home/ubuntu/pearson-correlation.log" pearson-correlation.log
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" "ubuntu@${node_m_addr}:/home/ubuntu/tfidf.log" tfidf.log
scp -o "StrictHostKeyChecking=no" -i "${key_name}.pem" "ubuntu@${node_m_addr}:/home/ubuntu/pearson-correlation_result" ./
scp -o "StrictHostKeyChecking=no" -r -i "${key_name}.pem" "ubuntu@${node_m_addr}:/home/ubuntu/tfidf_result/" ./
