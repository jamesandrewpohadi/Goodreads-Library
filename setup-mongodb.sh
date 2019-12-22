keyname=$2
key2="${keyname}.pem"
instance2=ubuntu@$1

exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking no" -i $1 $2 $3
}

exec_inst $key2 $instance2 "echo connected"

scp -i $key2 mongodb/Dockerfile $instance2:~/.
scp -i $key2 mongodb/setup.sh $instance2:~/.

exec_inst $key2 $instance2 "bash setup.sh"
