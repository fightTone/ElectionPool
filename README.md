# ElectionPool

you can check at:
- https://app1.pietone.com/analytics
- https://api1.pietone.com/docs

![Screenshot](https://github.com/fightTone/ElectionPool/blob/main/sample_images/1.png)
![Screenshot](https://github.com/fightTone/ElectionPool/blob/main/sample_images/2.png)
![Screenshot](https://github.com/fightTone/ElectionPool/blob/main/sample_images/3.png)
![Screenshot](https://github.com/fightTone/ElectionPool/blob/main/sample_images/4.png)

### requirement:
- docker
- .env file with the following variables
- mysql database (outside container: name it "election_db")
- portforward_app.sh if you want to forward it to your personal server (optional)

## api 
1. got to the api directory where you can find the docker compose
2. docker compose up -d


## ui
1. go to ui/election-pool directory where you can find the docker compose file
2. docker compose up -d
3. enter command ```docker ps -a```
4. copy the container id of the ui container and enter command ```docker exec -it <container_id> bash```
5. once inside the container you have 2 option, run local or forward to your personal server

### run local
1. enter command ```npm start``` or ```npm run dev```
2. go to http://localhost:3000

### forward to your personal server
1. enter command ```ssh-keygen```
2. look at the public key generated and copy it by entering the command ```cat ~/.ssh/id_rsa.pub``` or ```cat ~/.ssh/id_rsa<any_number>.pub``` and copy the content of the file
3. paste the content of the file to your personal server in the path ```~/.ssh/authorized_keys``` you can do that by nano or vim or any text editor you like, paste it at the bottom of the file and save it
4. go back to you local container and run the portforward_app.sh file ```./portforward_app.sh```
5. go to your personal server ip address and port 3000, for example 3.123.123.123:3000 you can now access the application in https://3.123.123.123:3000
