# Meta Mouse 🐭

## Work in progress salesforce cli tool


### Requirements

`sfdx` - https://developer.salesforce.com/tools/sfdxcli

`node` - https://nodejs.org/en/download/

Early releases are published for testing so can install with npm as normal

📌 Note the dash in the early npm name that is not in the command

```bash
  npm i -g meta-mouse
```

With it installed, you can run `metamouse` anywhere/time you need

```bash
  metamouse
```

You'll be greeted with options which you can use arrows or fuzzy search to select 🐭

<img src="https://i.imgur.com/Va2qmMc.png">

### Working

- fuzzy search cached usernames & options
- select username to set current username & cache it
- refresh list of usernames from sfdx & cache list for quicker switching
- open org in browser (uses selected/cached username)
- quickly add usernames to sfdx
- had dev org success w/validation count

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
