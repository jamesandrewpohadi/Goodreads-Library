#!/bin/bash
cd /home/ubuntu
echo "export HADOOP_CONF_DIR=/home/ubuntu/hadoop/etc/hadoop" >> /home/ubuntu/.profile
echo "export LD_LIBRARY_PATH=/home/ubuntu/hadoop/lib/native:$LD_LIBRARY_PATH" >> /home/ubuntu/.profile
source ~/.profile
#echo "export HADOOP_CONF_DIR=/home/ubuntu/hadoop/etc/hadoop" >> /home/ubuntu/.profile
cp /home/ubuntu/spark/conf/spark-defaults.conf.template /home/ubuntu/spark/conf/spark-defaults.conf
#echo "spark.driver.memory    256m" >> /home/ubuntu/spark/conf/spark-defaults.conf
#echo "spark.yarn.am.memory    256m" >> /home/ubuntu/spark/conf/spark-defaults.conf
#echo "spark.executor.memory          256m" >> /home/ubuntu/spark/conf/spark-defaults.conf
mysql=$(grep  -oP '"mysql-server": \"\K(.*?)"' instance.json | tr -d \")
mongodb=$(grep  -oP '"mongodb-server": \"\K(.*?)"' instance.json | tr -d \")
web=$(grep  -oP '"web-server": \"\K(.*?)"' instance.json | tr -d \")
rm spark-2.4.4-bin-hadoop2.7.tgz
apt update
apt install -y mysql-server
mysql -u root --password=mysql goodreads -h $mysql -e "select count(asin) from kindle_reviews;" > count.txt 
count=$(head -2 count.txt | tail -1)
count1=$(($count / 2))
count2=$(($count-$count1))
mysql -u root --password=mysql goodreads -h $mysql -e "select * from kindle_reviews limit $count1;" > kindle_reviews.tsv
mysql -u root --password=mysql goodreads -h $mysql -e "select * from kindle_reviews order by asin desc limit $count2;" >> kindle_reviews.tsv
apt-get -y install jq
apt install -y mongodb
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
sed -i '/bind ip/c\bind ip = 0.0.0.0' /etc/mongodb.conf
systemctl restart mongodb
mongoexport -h $mongodb --collection=meta_Kindle_Store --db=goodreads --out=meta_kindle.json
sed -i "s/# export JAVA_HOME=/export JAVA_HOME=\/usr\/lib\/jvm\/java-8-openjdk-amd64\/jre/g" /home/ubuntu/hadoop/etc/hadoop/hadoop-env.sh
sed -i "/<\/configuration>/i <property>\n<name>fs.defaultFS<\/name>\n<value>hdfs:\/\/${node_m_addr}:9000<\/value>\n<\/property>\n" /home/ubuntu/hadoop/etc/hadoop/core-site.xml
sed -i "/<\/configuration>/i <property>\n<name>dfs.namenode.name.dir<\/name>\n<value>\/home\/ubuntu\/name<\/value>\n<\/property>\n<property>\n<name>dfs.datanode.data.dir<\/name>\n<value>\/home\/ubuntu\/data<\/value>\n<\/property>\n<property>\n<name>dfs.replication<\/name>\n<value>1<\/value>\n<\/property>\n" /home/ubuntu/hadoop/etc/hadoop/hdfs-site.xml
sed -i '/<\/configuration>/i <property>\n<name>mapreduce.framework.name<\/name>\n<value>yarn<\/value>\n<\/property>\n<property>\n<name>yarn.app.mapreduce.am.env<\/name>\n<value>HADOOP_MAPRED_HOME=$HADOOP_HOME<\/value>\n<\/property>\n<property>\n<name>mapreduce.map.env<\/name>\n<value>HADOOP_MAPRED_HOME=$HADOOP_HOME<\/value>\n<\/property>\n<property>\n<name>mapreduce.reduce.env<\/name>\n<value>HADOOP_MAPRED_HOME=$HADOOP_HOME<\/value>\n<\/property>\n' /home/ubuntu/hadoop/etc/hadoop/mapred-site.xml
sed -i "/<\/configuration>/i <property>\n<name>yarn.nodemanager.aux-services.mapreduce_shuffle.class<\/name>\n<value>org.apache.hadoop.mapred.ShuffleHandler<\/value>\n<\/property>\n<property>\n<name>yarn.resourcemanager.hostname<\/name>\n<value>${node_m_addr}<\/value>\n<\/property>\n<property>\n<name>yarn.nodemanager.aux-services<\/name>\n<value>mapreduce_shuffle<\/value>\n<\/property>\n<property>\n<name>yarn.nodemanager.vmem-check-enabled<\/name>\n<value>false<\/value>\n<\/property>\n" /home/ubuntu/hadoop/etc/hadoop/yarn-site.xml 
rm /home/ubuntu/hadoop/etc/hadoop/workers
touch /home/ubuntu/hadoop/etc/hadoop/workers
for worker in ${worker_addr[@]}
do
worker=$(echo "${worker//\"}")
echo $worker >> /home/ubuntu/hadoop/etc/hadoop/workers
done
for worker in ${worker_priv[@]}
do
worker=$(echo "${worker//\"}")
scp -o "StrictHostKeyChecking=no" -i /home/ubuntu/.ssh/id_rsa /home/ubuntu/hadoop/etc/hadoop/* "ubuntu@${worker}:/home/ubuntu/hadoop/etc/hadoop/"
scp -o "StrictHostKeyChecking=no" -i /home/ubuntu/.ssh/id_rsa /home/ubuntu/spark/conf/slaves "ubuntu@${worker}:/home/ubuntu/spark/conf/slaves"
done
runuser -l ubuntu -c 'hdfs namenode -format'
runuser -l ubuntu -c 'start-dfs.sh'
runuser -l ubuntu -c 'hdfs dfs -mkdir -p /user/ubuntu'
runuser -l ubuntu -c 'hdfs dfs -put kindle_reviews.tsv'
runuser -l ubuntu -c 'hdfs dfs -put meta_kindle.json'
runuser -l ubuntu -c 'hadoop dfsadmin -safemode leave'
runuser -l ubuntu -c './spark/sbin/start-master.sh'
runuser -l ubuntu -c './spark/sbin/start-slaves.sh'
sleep 1
echo $node_m_addr
runuser -l ubuntu -c "/home/ubuntu/spark/bin/spark-submit --executor-memory 5G --master \"spark://${node_m_addr}:7077\" pc_for_hdfs.py $node_m_addr &> /home/ubuntu/pearson-correlation.log"
runuser -l ubuntu -c "/home/ubuntu/spark/bin/spark-submit --executor-memory 5G --master \"spark://${node_m_addr}:7077\" good_test.py $node_m_addr &> /home/ubuntu/tfidf.log"
# /home/ubuntu/spark/bin/spark-submit --executor-memory 5G --master "spark://${node_m_addr}:7077" pc_for_hdfs.py $node_m_addr &> /home/ubuntu/pearson-correlation.log
# /home/ubuntu/spark/bin/spark-submit --executor-memory 5G --master "spark://${node_m_addr}:7077" good_test.py $node_m_addr &> /home/ubuntu/tfidf.log
echo analytics results are out
echo downloading results to local
hdfs dfs -copyToLocal /user/ubuntu/tfidf_result ./
# hdfs dfs -copyToLocal /user/ubuntu/pearson-correlation_result ./
exit