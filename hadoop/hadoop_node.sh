#!/bin/bash
cd /home/ubuntu
runuser -l ubuntu -c 'ssh-keygen -b 4096 -f "/home/ubuntu/.ssh/id_rsa" -N ""'
cat /home/ubuntu/.ssh/id_rsa.pub >> /home/ubuntu/.ssh/authorized_keys
apt-get update
apt-get -y upgrade
apt-get -y install jq
apt-get -y install openjdk-8-jdk
wget https://archive.apache.org/dist/hadoop/core/hadoop-3.1.2/hadoop-3.1.2.tar.gz
tar -xzf hadoop-3.1.2.tar.gz
chown -R ubuntu: hadoop-3.1.2
mv hadoop-3.1.2 hadoop
echo 'PATH=/home/ubuntu/hadoop/bin:/home/ubuntu/hadoop/sbin:$PATH' >> /home/ubuntu/.profile
echo 'export HADOOP_HOME=/home/ubuntu/hadoop' >> /home/ubuntu/.bashrc
echo 'export PATH=${PATH}:${HADOOP_HOME}/bin:${HADOOP_HOME}/sbin' >> /home/ubuntu/.bashrc
