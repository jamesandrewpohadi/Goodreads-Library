# dbms-project-goodreads
BIG DATA

### After cloning this repo
```
npm install
```

Note:
Secure your keys before connecting to EC2 instances (you only need to do this once)
```
chmod 400 server.pem
chmod 400 mongodb.pem
```
---

**To run EC2 instance for mysql in terminal**
```
ssh -i "server.pem" ubuntu@18.210.39.176
```
---

**To run EC2 instance for mongodb in terminal**
```
ssh -i "mongodb.pem" ec2-user@35.163.65.254
```

---

### Common problems

- If there is any problems connecting to the instances, it might be because the instances are stop.
Just message the group
