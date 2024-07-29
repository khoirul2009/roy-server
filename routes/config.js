import express from "express";
import Config from "../model/Config.js";


const router = express.Router();


router.get('/config', async (req, res) => {
    const config = await Config.findOne({id: 1})
    return res.render('config.hbs', {
        botToken: config.botToken,
        cpuThreshold: config.cpuThreshold,
        memoryThreshold: config.memoryThreshold,
        diskReadThreshold: config.diskReadThreshold,
        diskWriteThreshold: config.diskWriteThreshold,

    });
})

router.post('/config', async (req, res) => {
    const {botToken, cpuThreshold, memoryThreshold, diskWriteThreshold, diskReadThreshold} = req.body

    const updateConfig = await  Config.findOneAndUpdate({id: 1}, {
        botToken, cpuThreshold, memoryThreshold, diskWriteThreshold, diskReadThreshold
    })


    if(updateConfig) {
        req.flash('success_msg', 'Config berhasil diubah')
        return res.redirect('/config')
    }

    req.flash('error_msg','Config gagal disimpan');
    return res.redirect('/config');
})

export default router;
