# to be run on hdfs master node

# when running analytics should scp instance json to hdfs master
mysql=$(grep  -oP '"mysql-server": \"\K(.*?)"' web/instance.json | tr -d \")
mongodb=$(grep  -oP '"mongodb-server": \"\K(.*?)"' web/instance.json | tr -d \")
web=$(grep  -oP '"web-server": \"\K(.*?)"' web/instance.json | tr -d \")

sudo apt update
sudo apt install -y mongodb
sed -i '/bind ip/c\bind ip = 0.0.0.0' /etc/mongodb.conf
sudo systemctl restart mongodb

sudo apt update
sudo apt install mysql-server -y
# sudo mysql -e "ALTER USER '%'@'%' IDENTIFIED WITH mysql_native_password BY 'mysql';"
# sudo mysql -e "GRANT ALL ON goodreads.kindle_reviews TO '%'@'%';"

mysql --password=mysql goodreads -h $mysql -e 'select * from kindle_reviews;' > kindle_reviews.tsv
mongoexport -h $mongodb --collection=meta_Kindle_Store --db=goodreads --out=meta_kindle.json