key2="testKey.pem"
instance2=ubuntu@$1

# in: key instance command
exec_inst () {
    echo $3
    ssh -o "StrictHostKeyChecking no" -i $1 $2 $3
}

exec_inst $key2 $instance2 "echo connected"
exec_inst $key2 $instance2 "mkdir bin public routes views"

scp -i $key2 web/* $instance2:~/.
scp -rp $key2 web/bin $instance2:~/bin
scp -rp $key2 web/public $instance2:~/public
scp -rp $key2 web/routes $instance2:~/routes
scp -rp $key2 web/views $instance2:~/views

exec_inst $key2 $instance2 "bash setup.sh"