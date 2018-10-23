const express = require('express')

const app = express()

app.get('/', (req, res)=>{
    res.send({hi: 'there'})
})

const port = process.env.PORT || 4000

app.listen(port, ()=>{
    console.log(`Server is up and running at port ${port}`)
} )