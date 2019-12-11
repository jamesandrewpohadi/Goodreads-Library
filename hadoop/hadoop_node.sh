#!/bin/bash
cd /home/ubuntu
runuser -l ubuntu -c 'ssh-keygen -b 4096 -f "/home/ubuntu/.ssh/id_rsa" -N ""'
cat /home/ubuntu/.ssh/id_rsa.pub >> /home/ubuntu/.ssh/authorized_keys
apt-get update
apt-get -y upgrade
sleep 2
apt-get -y install python-software-properties
sleep 2
apt-get -y install python3-pip
sleep 2
pip3 --no-cache-dir install pyspark
sleep 2
apt-get -y install jq
sleep 2
apt-get -y install openjdk-8-jdk
sleep 2
wget https://archive.apache.org/dist/spark/spark-2.4.4/spark-2.4.4-bin-hadoop2.7.tgz
sleep 2
tar -xvf spark-2.4.4-bin-hadoop2.7.tgz
sleep 2
chown -R ubuntu: spark-2.4.4-bin-hadoop2.7
sleep 2
mv spark-2.4.4-bin-hadoop2.7 spark
sleep 2
rm spark-2.4.4-bin-hadoop2.7.tgz
sleep 2
cp /home/ubuntu/spark/conf/spark-env.sh.template /home/ubuntu/spark/conf/spark-env.sh
sleep 2
wget https://archive.apache.org/dist/hadoop/core/hadoop-3.1.2/hadoop-3.1.2.tar.gz
tar -xzf hadoop-3.1.2.tar.gz
chown -R ubuntu: hadoop-3.1.2
mv hadoop-3.1.2 hadoop
rm hadoop-3.1.2.tar.gz
echo 'export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64' >> /home/ubuntu/.bashrc
sleep 2
echo 'export JRE_HOME=$JAVA_HOME/jre' >> /home/ubuntu/.bashrc
sleep 2
echo 'export PATH=$PATH:$JAVA_HOME/bin:$JAVA_HOME/jre/bin' >> /home/ubuntu/.bashrc
sleep 2
echo 'export SPARK_HOME=/home/ubuntu/spark' >> /home/ubuntu/.bashrc
sleep 2
echo 'export PYSPARK_PYTHON=/usr/bin/python3' >> /home/ubuntu/spark/conf/spark-env.sh
sleep 2
echo 'PATH=/home/ubuntu/hadoop/bin:/home/ubuntu/hadoop/sbin:$PATH' >> /home/ubuntu/.profile
echo 'export HADOOP_HOME=/home/ubuntu/hadoop' >> /home/ubuntu/.bashrc
echo 'export PATH=${PATH}:${HADOOP_HOME}/bin:${HADOOP_HOME}/sbin' >> /home/ubuntu/.bashrc
echo 'export SPARK_HOME=/home/ubuntu/spark' >> /home/ubuntu/.bashrc
echo 'export PATH=$SPARK_HOME/bin:$PATH' >> /home/ubuntu/.bashrc
echo 'alias python=python3' >> /home/ubuntu/.bashrc
source ~/.profile
source ~/.bashrc
touch 'finish.txt'
