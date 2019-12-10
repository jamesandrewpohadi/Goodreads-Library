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

wget -c https://istd50043.s3-ap-southeast-1.amazonaws.com/kindle-reviews.zip -O kindle-reviews.zip
rm -rf kindle_reviews.json

sudo apt update
sudo apt install mysql-server -y
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mysql';"
sudo mysql -e "GRANT ALL ON goodreads.* TO root@'%';"
mysql -u root --password=mysql -e 'create database goodreads;'
mysql -u root --password=mysql goodreads -e 'source setup.sql;'
mysql -u root --password=mysql goodreads -e 'show tables;'

# sudo docker build -t mysql-server .
# sudo docker run --name mysql1 --env-file '.env' -p 3306:3306 -h localhost -d mysql-server
# sleep 30 # time to let docker setup mysql
# sudo docker exec -d mysql1 mysql -u root --password=mysql -e 'GRANT ALL ON goodreads.kindle_reviews TO root@%;'
# sudo docker exec -d mysql1 mysql -u root --password=mysql -e 'show databases;'
# sudo docker exec -d mysql1 mysql -u root --password=mysql -e 'create database goodreads;'
# sudo docker exec -d mysql1 mysql -u root --password=mysql goodreads -e 'source setup.sql;'