echo creating instances
key=$1
node_type=${2:-m4.large}
python3 create_web_instances.py $key $node_type

mysql=$(grep  -oP '"mysql-server": \"\K(.*?)"' web/instance.json | tr -d \")
mongodb=$(grep  -oP '"mongodb-server": \"\K(.*?)"' web/instance.json | tr -d \")
web=$(grep  -oP '"web-server": \"\K(.*?)"' web/instance.json | tr -d \")

exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking no" -i $1 $2 $3 -
}

sleep 10

bash setup-mysql.sh $mysql $key
bash setup-mongodb.sh $mongodb $key
bash setup-web.sh $web $key
