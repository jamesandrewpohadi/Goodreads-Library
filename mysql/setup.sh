sudo apt install unzip

wget -c https://istd50043.s3-ap-southeast-1.amazonaws.com/kindle-reviews.zip -O kindle-reviews.zip
unzip kindle-reviews.zip
rm -rf kindle_reviews.json

sudo apt update
sudo apt install mysql-server -y
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mysql';"
mysql -u root --password=mysql -e "GRANT ALL ON goodreads.* TO root@'%' identified by 'mysql';"
mysql -u root --password=mysql -e 'create database goodreads;'
mysql -u root --password=mysql goodreads -e 'source setup.sql;'
mysql -u root --password=mysql goodreads -e 'show tables;'

sudo sed -i '/bind-address/c\bind-address = 0.0.0.0' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo service mysql restart