#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

# nginx repository
echo "
deb http://ppa.launchpad.net/nginx/stable/ubuntu precise main
deb-src http://ppa.launchpad.net/nginx/stable/ubuntu precise main
" >> /etc/apt/sources.list
gpg --keyserver pgpkeys.mit.edu --recv-key 00A6F0A3C300EE8C
gpg -a --export 00A6F0A3C300EE8C | apt-key add -

# update apt
apt-get -q -y update

# mysql
apt-get -q -y install mysql-server mysql-client
mysql -u root -e "create database \`db-test\` default character set utf8 collate utf8_general_ci"
mysql -u root "db-test" < /srv/build/structure.sql

# node
mkdir -p /opt
cd /opt
wget "http://nodejs.org/dist/v0.10.25/node-v0.10.25-linux-x64.tar.gz"
tar zxvf node-v0.10.25-linux-x64.tar.gz
rm -f node-v0.10.25-linux-x64.tar.gz
ln -sf node-v0.10.25-linux-x64 node
echo "PATH=/opt/node/bin:$PATH" >> /etc/profile.d/node.sh

# reload /etc/profile
source /etc/profile

# remove empty vagrant folder
rm -rf /vagrant

# updating user profile
echo "cd /srv" >> /home/vagrant/.profile