# installing docker
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository 'deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable'
sudo apt update
apt-cache policy docker-ce
sudo apt install docker-ce -y
sudo systemctl status docker
sudo usermod -aG docker ubuntu

sudo docker build -t mysql-server .
sudo docker run --name mysql1 --env-file '.env' -p 3306:3306 -h localhost -d mysql-server
sleep 30 # time to let docker setup mysql
sudo docker exec -d mysql1 mysql -u root --password=mysql -e 'GRANT ALL ON goodreads.kindle_reviews TO root@%;'
sudo docker exec -d mysql1 mysql -u root --password=mysql -e 'show databases;'
sudo docker exec -d mysql1 mysql -u root --password=mysql -e 'create database goodreads;'
sudo docker exec -d mysql1 mysql -u root --password=mysql goodreads -e 'source setup.sql;'