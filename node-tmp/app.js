const express = require('express')
const app = express()
const port = 3000
app.use(express.json())

app.get('/chain/entry/:hash', (req, res) => {
    const hash = req.params['hash']
    res.send(`Hello World! ${hash}`)
})

app.post('/chain/entry', (req, res) => {
    const hash = req.body['hash']
    const filename = req.body['filename']
    const comment = req.body['comment']

    res.send(`Hello World! ${hash} ${filename} ${comment}`)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})