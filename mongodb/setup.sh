# installing docker
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository 'deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable'
sudo apt update
apt-cache policy docker-ce
sudo apt install docker-ce -y
sudo systemctl status docker
sudo usermod -aG docker ubuntu

sudo docker build -t mongodb-server .
sudo docker run --name mongodb1 -p 27017:27017 -h localhost -d mongodb-server
sleep 30 # time to let docker setup mysql
sudo docker exec -d mongodb1 mongoimport --db goodreads --collection meta_Kindle_Store --file meta_Kindle_Store.json