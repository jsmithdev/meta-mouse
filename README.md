# Meta Mouse 🐭

## Work in progress salesforce cli tool

if want to test , you can install

```bash
  npm i -g meta-mouse
```

then run metamouse 


```bash
  metamouse
```


<img src="https://i.imgur.com/qTi2EbG.png">

### Working

- refresh list of usernames from sfdx & cache list
- select username to set current & cache username
- open org in browser (use saved/cached username)
- add username to sfdx
- some success w/ validation count

WIP below / disregard for now
---

### Path

  - / -- root

    - /packages/ - where to put package.xml files

    - /data/ - Structure for deploying, pulls, solution templates, etc
      - /raw/ -- where retrieve pulls zips to
      - /all/ -- where raw is unzipped to
      - /stage/ -- where fails go to know whats left, what to try again later, etc
      - /deploy/ -- where deploy deploys from

  - [worksheet.txt](worksheet.txt) -- where to put common problems that arise during deployments to find commonalities
