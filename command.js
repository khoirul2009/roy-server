import {spawn} from "child_process";

const password = '2009';
const command = 'top';
const args = [];

const child = spawn(command, args);

child.stdout.on('data', (data) => {
    console.log(`Output: ${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`Stderr: ${data}`);
});

child.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
});

child.stdin.write(`${password}\n`);
child.stdin.end();

