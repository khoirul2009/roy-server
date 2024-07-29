import mongoose from "mongoose";
const configSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    botToken: {
        type: String,
        required: true,
    },
    cpuThreshold: {
        type: Number,
        required: true,
    },
    memoryThreshold: {
        type: Number,
        required: true,
    },
    diskReadThreshold: {
        type: Number,
        required: true,
    },
    diskWriteThreshold: {
        type: Number,
        required: true,
    }
})

const Config = mongoose.model("Config", configSchema);

export default Config;
