const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = "machineId: unit.id,";
const replacement = "phone: currentUser?.phone || currentUser?.phone_number,\n                    machineId: unit.id,";

if (html.includes(target) && !html.includes("phone: currentUser?.phone")) {
    html = html.replace(target, replacement);
    fs.writeFileSync('index.html', html);
    console.log('Successfully added user phone to rental payload!');
} else {
    console.log('Target not found or already patched.');
}
