
VM_NAME = "factory-mysql-fixtures"
VM_MEMORY = "512"
VM_IP = "10.0.0.4"

unless Vagrant.has_plugin?("vagrant-vbguest")
  raise 'vagrant-vbguest is not installed! run: vagrant plugin install vagrant-vbguest'
end

Vagrant.configure("2") do |config|

  config.vm.box = "precise64"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"

  config.vm.hostname = VM_NAME

  config.vm.provision :shell, path: "build/bootstrap.sh"

  config.vm.provider "virtualbox" do |v|
    v.name = VM_NAME
    v.customize ["modifyvm", :id, "--memory", VM_MEMORY]
  end

  config.vm.network :private_network, ip: VM_IP, netmask: "255.255.0.0"
  config.vm.network :forwarded_port, guest: 80, host: 8080, auto_correct: true

  config.vm.synced_folder File.dirname(__FILE__), "/vagrant", disabled: true
  config.vm.synced_folder File.dirname(__FILE__), "/srv", nfs: true
end