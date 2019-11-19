module.exports = {
    usernames: users => {
        const check = users && users.length > 0
        if(!check){
            console.log(`\n There were no usernames cached from sfdx \n`);
        }
        return check
    },
    goBack: (value) => {
        return value === '<- Cancel'
    }
}