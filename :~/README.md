# dbms-project-goodreads
BIG DATA

### After cloning this repo
```
npm install
```

Secure your keys before connecting to EC2 instances (you only need to do this once)
```
chmod 400 server.pem
chmod 400 mongodb.pem
```
---

**To run EC2 instance for mysql in terminal**

Connect to the instance
```
ssh -i "server.pem" ubuntu@18.210.39.176
```

To open mysql:
```
mysql -u root -p
```
password: ```mysql```


database: **goodreads**, table: **kindle_reviews**

SQL tutorials:
- [https://www.w3schools.com/sql/](https://www.w3schools.com/sql/)


---

**To run EC2 instance for mongodb in terminal**

Connect to the instance
```
ssh -i "mongodb.pem" ubuntu@35.163.65.254
```

To open mongoDB:
```
mongo
```
database: **goodreads**, collection: **meta_Kindle_Store**


mongoDB tutorials:
- [https://www.tutorialspoint.com/mongodb/index.htm](https://www.tutorialspoint.com/mongodb/index.htm)
---

### Common problems

- If there is any problems connecting to the instances, it might be because the instances are stop.
Just message the group
