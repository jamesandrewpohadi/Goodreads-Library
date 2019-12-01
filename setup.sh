# python3 create_instances.py

mysql=$(grep  -oP '"mysql-server": \"\K(.*?)"' web/instance.json | tr -d \")
mongodb=$(grep  -oP '"mongodb-server": \"\K(.*?)"' web/instance.json | tr -d \")
web=$(grep  -oP '"web-server": \"\K(.*?)"' web/instance.json | tr -d \")

echo mysql
# bash setup-mysql.sh $mysql
# bash setup-mongodb.sh $mongodb
bash setup-web.sh $web