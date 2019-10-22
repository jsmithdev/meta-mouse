# Meta Mouse

## WIP 

### Path to v.0.0.2

- Create Structure

  - / -- root

    - /xml/ - where to put package.xml files

    - /data/
      - /raw/ -- where retrieve pulls zips to
      - /all/ -- where raw is unzipped to
      - /stage/ -- where fails go to know whats left, what to try again later, etc
      - /deploy/ -- where deploy deploys from

  - [index.js](index.js) -- this is main app
    - routes -- modules to call as paths get worked out

  - [worksheeet.txt](worksheeet.txt) -- where to put common problems that arise during deployments to find commonalities

    - use to build common cleaning util: cleaner.js

- List alias / usernames from sfdx

  - choose FROM / TO usernames

- retrieve FROM

  - via /xml/package.xml
    - to raw

- unzip raw to all