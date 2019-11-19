# Meta Mouse 🐭

## Work in progress salesforce cli tool

### Requirements

`sfdx` - https://developer.salesforce.com/tools/sfdxcli

`node` - https://nodejs.org/en/download/

Early releases are published for testing so can install with npm as normal

📌 Note the dash in the early npm name that is not in the command atm

```bash
  npm i -g meta-mouse
```

If installed with -g like above, you can run `metamouse` anywhere

```bash
  metamouse
```

You'll be greeted with options; Use arrows or fuzzy search to navigate

<img src="https://i.imgur.com/Va2qmMc.png">

### Things it does

- fuzzy search cached usernames & options
- select username to set & cache current username  it
- refresh list of usernames from sfdx & cache list for quicker switching
- open org in browser (uses selected/cached username)
- quickly add usernames to sfdx
- Validation Rule count

### WIP / disregard for now

- [worksheet.txt](worksheet.txt) -- where to put common problems that arise during deployments to find commonalities
