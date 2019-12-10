key1="testKey.pem"
instance1=ubuntu@$1
# instance1=ubuntu@ec2-52-220-10-107.ap-southeast-1.compute.amazonaws.com

# in: key instance command
exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking no" -i $1 $2 $3 -
}

# in: key instance
install_docker () {
    echo "installing docker on $2"
    exec_inst $1 $2 "sudo apt update"
    exec_inst $1 $2 "sudo apt install apt-transport-https ca-certificates curl software-properties-common -y"
    exec_inst $1 $2 "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -"
    exec_inst $1 $2 "sudo add-apt-repository 'deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable'"
    exec_inst $1 $2 "sudo apt update"
    exec_inst $1 $2 "apt-cache policy docker-ce"
    exec_inst $1 $2 "sudo apt install docker-ce -y"
    exec_inst $1 $2 "sudo systemctl status docker"
    exec_inst $1 $2 "sudo usermod -aG docker ubuntu"
    echo "done installing docker on $2"
}

exec_inst $key1 $instance1 "echo connected"

# scp -i $key1 mysql/kindle_reviews.csv $instance1:~/.
scp -i $key1 mysql/setup.sql $instance1:~/.
scp -i $key1 mysql/Dockerfile $instance1:~/.
scp -i $key1 mysql/.env $instance1:~/.
scp -i $key1 mysql/setup.sh $instance1:~/.

exec_inst $key1 $instance1 "bash setup.sh"

# exec_inst $key1 $instance1 "docker build -t mysql-server ."
# exec_inst $key1 $instance1 "docker run --name mysql1 --env-file '.env' -p 3306:3306 -h localhost -d mysql-server"
# sleep 30 # time to let docker setup mysql
# exec_inst $key1 $instance1 "docker exec -d mysql1 mysql -u root --password=mysql -e 'GRANT ALL ON goodreads.kindle_reviews TO root@%;'"
# exec_inst $key1 $instance1 "docker exec -d mysql1 mysql -u root --password=mysql -e 'show databases;'"
# exec_inst $key1 $instance1 "docker exec -d mysql1 mysql -u root --password=mysql -e 'create database goodreads;'"
# exec_inst $key1 $instance1 "docker exec -d mysql1 mysql -u root --password=mysql goodreads -e 'source setup.sql;'"