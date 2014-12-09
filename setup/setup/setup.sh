#!/bin/bash
sudo yum install wget

#Install additional packages

<<EPEL_COMMENTS
Install the Extra Packages for Enterprise Linux repo
http://fedoraproject.org/wiki/EPEL
http://www.rackspace.com/knowledge_center/article/install-epel-and-additional-repositories-on-centos-and-red-hat
EPEL_COMMENTS

mkdir ~/.setup
mkdir ~/.setup/temp
cd ~/.setup/temp
wget https://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-2.noarch.rpm
sudo yum install epel-release-7-2.noarch.rpm

#Confirm repolist
sudo yum repolist

#Install Cowsay

git clone https://github.com/schacon/cowsay.git
cd cowsay
sudo ./install.sh

cd ..

sudo yum install vim fortune-mod nodejs nmap emacs telnet traceroute zsh tmux mongodb links net-tools ruby nano npm strace

#Install_Oh-my-zsh

mkdir ~/.setup/linux
git clone https://github.com/robbyrussell/oh-my-zsh.git ~/.setup/linux/zsh/oh-my-zsh
cd ~/.setup/linux/zsh/oh-my-zsh

#install tmuxinator
git clone https://github.com/tmuxinator/tmuxinator.git ~/.setup/linux/tmuxinator
cd ~/.setup/linux/tmuxinator
sudo gem install tmuxinator --no-document
echo "tmuxinator installed"
sudo gem install bundler --no-document

cp ~/noob/.zshrc ~/.zshrc
cp ~/noob/.vimrc ~/.vimrc
cp ~/noob/.tmux.conf ~/.tmux.conf

#install vundle
git clone https://github.com/gmarik/Vundle.vim.git ~/.vim/bundle/Vundle.vim
vim +PluginInstall +qall

#install OCaml
sudo yum install ocaml
sudo yum install ocaml-camlp4-devel ocaml-ocamldoc ocaml-findlib-devel ocaml-extlib-devel ocaml-calendar-devel

#change shell
chsh -s /bin/zsh
