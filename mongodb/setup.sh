sudo apt-get install unzip
wget -c https://istd50043.s3-ap-southeast-1.amazonaws.com/meta_kindle_store.zip -O meta_kindle_store.zip
unzip meta_kindle_store.zip

sudo apt update
sudo apt install -y mongodb
sudo sed -i '/bind_ip/c\bind_ip = 0.0.0.0' /etc/mongodb.conf
sudo systemctl restart mongodb
mongoimport --db goodreads --collection meta_Kindle_Store --file meta_Kindle_Store.json