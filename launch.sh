#!/bin/bash
if [ $# -le 1 ]
  then
    echo "provide arguments for: web_hadoop, server_key, no_of_nodes(optional)"
    echo "for web_hadoop variable: 1 = web only, 2 = hadoop only, 3 = both"
    echo "PLEASE NOTE THAT WHEN THE WEB AUTOMATION SCRPIPT RUNS TO COMPLETION"
    echo "CTRL+C TO EXIT OUT OF NPM."
    echo "ensure that the server_key variable does not contain the extension"
    echo "e.g. 'test_key', not 'test_key.pem'"
    echo "also ensure that you serverkey is in this directory level as well."
    exit
fi

key=deployKey

if [ $1 -eq 1 ] || [ $1 -eq 3 ]; then
./setup_web.sh $key
#echo "web test"
fi
# key=$2

if ([ $1 -eq 2 ] || [ $1 -eq 3 ]) && [ $# -eq 2 ]; then
cp ${key}.* hadoop/
cd hadoop
echo launch_analytics
./launch_analytics.sh $2 $key
cd ..
fi
