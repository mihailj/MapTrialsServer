create user 'root'@'192.168.166.1' identified by 'root';
grant all privileges on *.* to 'root'@'192.168.166.1' with grant option;
flush privileges;