#!/bin/bash
if [ $# -le 1 ]
  then
    echo "provide arguments for: web_hadoop, server_key, no_of_nodes(optional, default = 2), node_type(optional, default = m4.large)"
    echo "for web_hadoop variable: 1 = web only, 2 = hadoop only, 3 = both"
    echo "PLEASE NOTE THAT WHEN THE WEB AUTOMATION SCRPIPT RUNS TO COMPLETION"
    echo "CTRL+C TO EXIT OUT OF NPM."
    echo "ensure that the server_key variable does not contain the extension"
    echo "e.g. 'test_key', not 'test_key.pem'"
    echo "also ensure that you serverkey is in this directory level as well."
    exit
fi
key=$2
node_type=${4:-m4.large}
no_of_nodes=${3:-2}
if [ $1 -eq 1 ] || [ $1 -eq 3 ]; then
./setup_web.sh $key $node_type
#echo "web test"
fi
if [ $1 -eq 2 ] || [ $1 -eq 3 ]; then
cp ${key}.* hadoop/
cd hadoop
echo launch_analytics
./launch_analytics.sh $key $no_of_nodes $node_type
cd ..
#echo "hadoop test"
#echo $no_of_nodes
fi
