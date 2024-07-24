export default function  parsePsOutput(output) {
    const lines = output.split('\n').filter(line => line.trim() !== '');
    const jsonData = { tasks: [] };

    if (lines.length < 2) {
        return jsonData; // Return empty data if output is not as expected
    }

    // Skip the header line and process task lines
    lines.slice(1).forEach(line => {
        const columns = line.trim().split(/\s+/);
        if (columns.length > 10) {
            const task = {
                user: columns[0] || 'N/A',
                pid: columns[1] || 'N/A',
                cpu: parseFloat(columns[2]) || 0,
                mem: columns[3] || 'N/A',
                vsize: columns[4] || 'N/A',
                rss: columns[5] || 'N/A',
                tty: columns[6] || 'N/A',
                stat: columns[7] || 'N/A',
                start: columns[8] || 'N/A',
                time: columns[9] || 'N/A',
                command: columns.slice(10).join(' ') || 'N/A'
            };
            jsonData.tasks.push(task);
        }
    });

    // Return top 10 tasks already limited by the `head -n 11` command
    return jsonData;
}
