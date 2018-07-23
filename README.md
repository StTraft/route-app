# route-app
nodejs app for fetching total distance and total time, provided with sets of lat-long locations.

# Usage

1. clone this project to a folder

2. before run the docker commands, **CREATE THE `.env` FILE AT THE SAME FOLDER AS `route-app/env.example.txt` FIRST**. Please make sure **EVERY KEY** is filled as described in `route-app/env.example.txt`.

3. run `docker-compose up` command at the folder's root.

4. for logs, please use `docker logs` for each running containers.

# Remark

for scaling up with `docker-compose up --scale app=<Number>` command, please edit `nginx/nginx.conf` to make sure upstream server match the scale number. For example, if scale up to 4 app:

```
# nginx/nginx.conf

...

    upstream route-app {
          least_conn;
          # change the following codes:
          server app:3000 weight=10 max_fails=3 fail_timeout=30s;
          # into this:
          server app_1:3000 weight=10 max_fails=3 fail_timeout=30s;
          server app_2:3000 weight=10 max_fails=3 fail_timeout=30s;
          server app_3:3000 weight=10 max_fails=3 fail_timeout=30s;
          server app_4:3000 weight=10 max_fails=3 fail_timeout=30s;
    }
```
scaling up is a bit trouble, but it's not a time for over engineer this ;)
