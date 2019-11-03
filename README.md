# Meta Mouse 🐭

## Work in progress salesforce cli tool


### Requirements

`sfdx` - https://developer.salesforce.com/tools/sfdxcli

`node` - https://nodejs.org/en/download/

early releases are published for testing so can install with npm per usual

```bash
  npm i -g meta-mouse
```

then run `metamouse` 


```bash
  metamouse
```

You'll be greeted with options which you can use arrows or fuzzy search to select 🐭

<img src="https://i.imgur.com/zbWesEr.png">

### Working

- refresh list of usernames from sfdx & cache list
- fuzzy search cached usernames & other options
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
