import os from "os";
import sysinfo from "systeminformation";
import bot from "./bot.js";
import {exec, spawn} from "child_process";
import parsePsOutput from "./parse_to_json.js";
import Config from "./model/Config.js";

const instanceBot = bot('7476500246:AAHYRvfj8elfuqdpYORf6nNI8bJImBpW4nE');
const connect = async (io, os) => {
    let diskW =  await getDataWritePerSecond();
    let diskR =  await getDataReadPerSecond();
    let cpu = await getCpuLoad();

    const config = await Config.findOne({id: 1});


    io.on('connection', async (socket) => {
        let load = cpu;
        let totalMemory = os.totalmem();
        let freeMemory = os.freemem();
        let usedMemory = Number((totalMemory - freeMemory) / 1073741824).toFixed(4);
        let readDisk = diskR;
        let writeDisk =  diskW;
        socket.emit('resources', {cpu: load, memory: usedMemory});
        setInterval(async () => {
            load = await getCpuLoad();
            freeMemory = os.freemem();

            // notif
            if(load > config.cpuThreshold) await instanceBot.sendMessage(6698184993, 'Warning!! CPU load mencapai threshold');

            usedMemory = Number((totalMemory - freeMemory) / 1073741824).toFixed(4);

            if(usedMemory >= config.memoryThreshold) await instanceBot.sendMessage(6698184993, 'Warning!! Memory load mencapai threshold');

            readDisk = await getDataReadPerSecond();

            if((readDisk * 1024) >= config.diskReadThreshold) await instanceBot.sendMessage(6698184993, 'Warning!! Disk load mencapai threshold');

            writeDisk = await getDataWritePerSecond();
            socket.emit('resources', {cpu: load, memory: usedMemory, readDisk: readDisk / 1024, writeDisk: writeDisk});
        }, 1000 * 5);

        const output = await getPsData();
        socket.emit('apps_monitor', parsePsOutput(output));

        const interval = setInterval(async () => {
            try {
                const output = await getPsData();
                socket.emit('apps_monitor', parsePsOutput(output));
            } catch (error) {
                console.error('Error fetching process data:', error);
            }
        }, 5000);

        socket.on('terminate_process', (pid) => {
            exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error terminating process ${pid}:`, error);
                } else {
                    console.log(`Process ${pid} terminated.`);
                }
            });
        });

    });


};

async function getDataReadPerSecond() {
    try {
        const initialStats = await sysinfo.fsStats();
        const initialRead = initialStats.rx;

        // Wait for one second
        await new Promise(resolve => setTimeout(resolve, 1000));

        const finalStats = await sysinfo.fsStats();
        const finalRead = finalStats.rx;

        const dataReadPerSecond = (finalRead - initialRead); // Bytes per second

        return dataReadPerSecond / (1024);
    } catch (error) {
        console.error(error);
        return 0;
    }
}
async function getDataWritePerSecond() {
    try {
        const initialStats = await sysinfo.fsStats();
        const initialRead = initialStats.wx;

        // Wait for one second
        await new Promise(resolve => setTimeout(resolve, 1000));

        const finalStats = await sysinfo.fsStats();
        const finalRead = finalStats.wx;

        const dataWritePerSecond = (finalRead - initialRead); // Bytes per second

        return dataWritePerSecond / (1024);
    } catch (error) {
        console.error(error);
        return 0;
    }
}

async function getCpuLoad() {
    try {
        const load = await sysinfo.currentLoad();
         return load.currentLoad.toFixed(2)
    } catch (error) {
        console.error(error);
        return 0;
    }
}


function getPsData() {
    return new Promise((resolve, reject) => {
        // Use `ps` command to get process information sorted by CPU usage
        exec('ps aux --sort=-%cpu | head -n 11', (error, stdout, stderr) => { // Include the header line
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
            } else if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(new Error(stderr));
            } else {
                resolve(stdout);
            }
        });
    });
}


export default connect;
