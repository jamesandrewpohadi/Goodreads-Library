#!/bin/bash
cd /home/ubuntu
runuser -l ubuntu -c 'ssh-keygen -b 4096 -f "/home/ubuntu/.ssh/id_rsa" -N ""'
cat /home/ubuntu/.ssh/id_rsa.pub >> /home/ubuntu/.ssh/authorized_keys
apt-get update
apt-get -y upgrade
apt-get -y install python-software-properties
apt-get -y install python3-pip
pip3 --no-cache-dir install pyspark
apt-get -y install jq
apt-get -y install openjdk-8-jdk
wget https://archive.apache.org/dist/spark/spark-2.4.4/spark-2.4.4-bin-hadoop2.7.tgz
tar -xvf spark-2.4.4-bin-hadoop2.7.tgz
chown -R ubuntu: spark-2.4.4-bin-hadoop2.7
mv spark-2.4.4-bin-hadoop2.7 spark
cp /home/ubuntu/spark/conf/spark-env.sh.template /home/ubuntu/spark/conf/spark-env.sh
echo 'export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64' >> /home/ubuntu/.bashrc
echo 'export JRE_HOME=$JAVA_HOME/jre' >> /home/ubuntu/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin:$JAVA_HOME/jre/bin' >> /home/ubuntu/.bashrc
echo 'export SPARK_HOME=/home/ubuntu/spark' >> /home/ubuntu/.bashrc
echo 'export PYSPARK_PYTHON=/usr/bin/python3' >> /home/ubuntu/spark/conf/spark-env.sh
source ~/.bashrc
