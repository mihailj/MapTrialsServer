sudo apt-get update
sudo apt-get upgrade

# install nvm required packages

sudo apt-get install -y build-essential git curl

# install mysql

sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password root'
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password root'

sudo apt-get -y install mysql-server mysql-client

# enable mysql remote access

sudo sed -i 's/bind-address\t\t= 127.0.0.1/#bind-address\t\t= 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo /etc/init.d/mysql restart

mysql -u root -proot < '/vagrant/mysql-grant.sql'

# create test database

mysql -u root -proot < '/vagrant/test.sql'