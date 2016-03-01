firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="104.236.157.79" service name="ssh" log prefix="ssh" level="info" accept'

firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="168.235.84.189" service name="ssh" log prefix="ssh" level="info" accept'

firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="137.132.0.0/16" service name="ssh" log prefix="ssh" level="info" accept'

firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="172.16.0.0/12" service name="ssh" log prefix="ssh" level="info" accept'

firewall-cmd --permanent --remove-service=ssh

systemctl restart firewalld.service
