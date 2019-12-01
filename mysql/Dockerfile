FROM mysql:5.7.28

# Create app directory
WORKDIR /usr/src/mysql

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY setup.sql ./
COPY kindle_reviews.csv ./
# COPY meta_Kindle_Store.json ./

# ARG $MYSQL_ROOT_PASSWORD=ubuntu
# ARG $MYSQL_USER=root
# ARG $MYSQL_PASSWORD=mysql
# ARG $MYSQL_DATABASE=goodreads
# # <- this one's new
# ENV MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
# ENV MYSQL_USER=$MYSQL_USER
# ENV MYSQL_PASSWORD=$MYSQL_PASSWORD
# ENV MYSQL_DATABASE=$MYSQL_DATABASE

# RUN mysql -u root --password=mysql -e "GRANT ALL ON *.* TO root@'%'"
# RUN mysql -u root --password=mysql -e "create database goodreads;"
# RUN mysql -u root --password=mysql goodreads -e "source setup.sql";
# RUN use goodreads;

# RUN source setup.sql

# install git
# RUN apt-get update && \
#     apt-get upgrade -y && \
#     apt-get install -y git

# Bundle app source
# COPY . .

# EXPOSE 3306

# CMD [ "" ]