const nodemailer = require("nodemailer");

const transporter  = nodemailer.createTransport({
   service: "gmail",
   auth:{
    user:"sksardar462@gmail.com",
    pass:"hwwamtdfuatpicdg"
   } 
})

let mailoptions = {
    from:"sksardar462@gmail.com",
    to:"mahaboob.shhaik@gmail.com",
    subject:"Chadhuvuko voiiiii",
    text:"Assal endhuku vastarrraaaa baabu"
}

transporter.sendMail(mailoptions,(err,info)=>{
if(err){
    console.log(err)
}else{
    console.log("mail sent")
}
})