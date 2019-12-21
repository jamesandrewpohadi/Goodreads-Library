echo creating instances

python3 create_web_instances.py $1

mysql=$(grep  -oP '"mysql-server": \"\K(.*?)"' web/instance.json | tr -d \")
mongodb=$(grep  -oP '"mongodb-server": \"\K(.*?)"' web/instance.json | tr -d \")
web=$(grep  -oP '"web-server": \"\K(.*?)"' web/instance.json | tr -d \")

exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking no" -i $1 $2 $3 -
}

chmod 400 $1.pem

echo preparing to setup web production ...
sleep 10
echo setting up web production ...
bash setup-mysql.sh $mysql $1
bash setup-mongodb.sh $mongodb $1
bash setup-web.sh $web $1
