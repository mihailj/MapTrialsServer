cd /home/ubuntu

# Installing nvm
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | sh

# This enables NVM without a logout/login
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

# Install a node and alias
nvm install 7.2.0
nvm alias default 7.2.0