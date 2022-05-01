const express = require ('express');
const app=express();
const port = 4000;


app.get('/',(req,res)=>{
    res.send('hello my world br')
})


app.listen(port,()=>{
    console.log('server running on http://localhost:${port}')
})
