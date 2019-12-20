echo creating instances

python3 create_web_instances.py $1

mysql=$(grep  -oP '"mysql-server": \"\K(.*?)"' web/instance.json | tr -d \")
mongodb=$(grep  -oP '"mongodb-server": \"\K(.*?)"' web/instance.json | tr -d \")
web=$(grep  -oP '"web-server": \"\K(.*?)"' web/instance.json | tr -d \")

exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking no" -i $1 $2 $3 -
}

chmod 400 testKey.pem
key="testKey.pem"

sleep 10

bash setup-mysql.sh $mysql
bash setup-mongodb.sh $mongodb
bash setup-web.sh $web
