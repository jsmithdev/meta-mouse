# Meta Mouse 🐭

## A Salesforce CLI tool (working work in progress)

### Requirements

If not already installed, install
[sfdx](https://developer.salesforce.com/tools/sfdxcli) and [node](https://nodejs.org/en/download/)

### Installing

```bash
  npm i -g metamouse
```

If installed with -g like above, you can run `metamouse` anywhere

```bash
  metamouse
```

You'll be greeted with options; Start typing to navigate (or use arrows)

<img src="https://i.imgur.com/Va2qmMc.png">

## Things it does

```text
├── Select Username
|   └─ Set & cache the current username to use
|
├── Add Username
|   └─ Connect orgs / usernames to sfdx
|
├── See Cached Username
|   └─ Display currently set & cached username
|
├── Refresh Usernames
|   └─ Refreshes list of connected usernames from sfdx (caches list for quicker switching)
|
├── Open in Browser
|   └─ Open org in browser (using selected user)
|
├── Validation Rule Count
|   └─ Count validation rules in org (using selected user)
|
├── Generate Object Sheet
|   └─ Create sheet of object metadata in an org to your home directory (using selected user)
|
└── Quit
    └─ Exit metamouse
```

### WIP / disregard for now

- [worksheet.txt](worksheet.txt) -- where to put common problems that arise during deployments to find commonalities
