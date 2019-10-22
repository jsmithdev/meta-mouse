# Meta Mouse 🐭

## WIP 

<img src="https://i.imgur.com/qTi2EbG.png">

### Working

- save username list from sfdx
  - select to set current
    - selected is saved for next run
- refresh list
- package pull for objects

### Path

  - / -- root

    - /packages/ - where to put package.xml files

    - /data/ - Structure for deploying, cloning orgs / solutions, etc
      - /raw/ -- where retrieve pulls zips to
      - /all/ -- where raw is unzipped to
      - /stage/ -- where fails go to know whats left, what to try again later, etc
      - /deploy/ -- where deploy deploys from


  - [worksheeet.txt](worksheeet.txt) -- where to put common problems that arise during deployments to find commonalities
