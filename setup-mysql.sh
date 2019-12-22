keyname=$2
key1="${keyname}.pem"
echo setup mysql
instance1=ubuntu@$1

exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking no" -i $1 $2 $3 -
}

exec_inst $key1 $instance1 "echo connected"
scp -i $key1 mysql/setup.sql $instance1:~/.
scp -i $key1 mysql/setup.sh $instance1:~/.

exec_inst $key1 $instance1 "bash setup.sh"