const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('css'));
app.use(express.static('img'));
app.use(session({
    secret: 'secretKey1',
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser());
//ejs

app.set('views', './views');
app.set('view engine', 'ejs');

//Email-send
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: 'miniprojectgithub@gmail.com',
        // pass: 'Hostel@2022'
        pass: 'xlkzajttkepkrfjn'
    }
});

//
app.get("/",function(req,res){
    client.query(`call auto_esc()`,(err,res2)=>{
        if(err){
            console.log(err);
            res.send(err);
        }
        else{
            res.sendFile(__dirname + "/loginPage.html");
        }
    })
});

app.get("/register_student", function (req, res) {
    res.sendFile(__dirname + '/registration_student.html');
});
app.get("/register_warden", function (req, res) {
    res.sendFile(__dirname + '/registration_warden.html');
});

app.get("/studentHome",function(req,res){
	// res.sendFile(__dirname + "/studentHome.html");
    client.query(`select student_name,hostel_ref_id,room_no,warden_cont from student ,warden ,hostel where hostel_ref_id = hostel_id and warden_ref_id = warden_id and student_id='${req.session.gid}'`,function(err,res2){
        if(err){
            res.send("<h1>" + err.message +"</h1>");
        }
        else{
            res.render("studentHome", { name:res2.rows[0].student_name, roomno:res2.rows[0].room_no , hname:res2.rows[0].hostel_ref_id, wcont:res2.rows[0].warden_cont });
        }
    })
    
});
//warden post notice
//post notice get method

app.get("/post_notice_warden",function(req,res){

    res.sendFile(__dirname + "/postNoticeWarden.html")

})

//post notice post method

app.post("/post_notice_warden",function(req,res){

    let desc = req.body.notice;
    
    client.query(`insert into notice values('${desc}','${req.session.gid}')`,function(err,res2){
        if(err){
            res.send(err.message);
        }
        else{
            res.redirect("/wardenHome");
        }
    })

})

//admin post notice

app.get("/post_notice_admin",function(req,res){

    res.sendFile(__dirname + "/postNoticeAdmin.html")

})

app.post("/post_notice_admin",function(req,res){

    let desc = req.body.notice;
    
    client.query(`insert into notice values('${desc}','${req.session.gid}')`,function(err,res2){
        if(err){
            res.send(err.message);
        }
        else{
            res.redirect("/adminHome");
        }
    })

})

// view notice student

app.get("/view_notice",function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        client.query(`select * from notice where owner = 'adminbal' or owner = (select distinct(warden_ref_id) from hostel where hostel_id=(select hostel_ref_id from student where student_id='${req.session.gid}'));`,function(err,res2){
        if(err){
            console.log(err.message);
        }
        else{
            res.render("viewNoticeStudent", {arr:res2.rows});    
        }
    })
    }

})

app.get("/view_notice_warden",function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        console.log(req.session.gid)
        client.query(`select * from notice where owner = '${req.session.gid}'`,function(err,res2){
        if(err){
            console.log(err.message);
        }
        else{
            res.render("viewNoticeWarden", {arr:res2.rows});    
        }
    })
    }

})


app.post("/view_notice_warden", function(req,res){
    let id = req.body.ack;
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        client.query(`delete from notice where notice_id = '${id}'`, function(err,res2){
            if(err){
                res.send("<h1>"+err.message+"</h1>");
            }
            else{
                res.redirect("/view_notice_warden");
            }
        })
    }
})

app.get("/view_notice_admin",function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        // console.log(req.session.gid)
        client.query(`select * from notice`,function(err,res2){
        if(err){
            console.log(err.message);
        }
        else{
            res.render("viewNoticeAdmin", {arr:res2.rows});    
        }
    })
    }

})

app.post("/view_notice_admin", function(req,res){
    let id = req.body.ack;
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        client.query(`delete from notice where notice_id = '${id}'`, function(err,res2){
            if(err){
                res.send("<h1>"+err.message+"</h1>");
            }
            else{
                res.redirect("/view_notice_admin");
            }
        })
    }
})

//
app.post("/logout",function(req,res){

    var lo = req.body.logoutbtn;

    if(lo == 'logout'){
        req.session.gid = '';
        res.redirect("/");
    }

})

app.get("/adminHome",function(req,res){
    client.query(`select admin_name from admin where admin_id='${req.session.gid}'`, function (err, res2) {
        if (err) {
            res.send("<h1>" + err.message + "</h1>");
        }
        else {
            res.render("adminHome", { name: res2.rows[0].admin_name });
        }
    })
});

app.get("/wardenHome",function(req,res){
    client.query(`select warden_name from warden where warden_id='${req.session.gid}'`, function (err2, res2) {
        if (err2) {
            res.send("<h1>" + err2.message + "</h1>");
        }
        else {
            client.query(`select hostel_id from hostel where warden_ref_id='${req.session.gid}'`, function (err3, res3) {
                if (err3) {
                    res.send("<h1>" + err3.message + "</h1>");
                }
                else {
                    res.render("wardenHome", { name: res2.rows[0].warden_name, hname:res3.rows[0].hostel_id });
                }
            })
            
        }
    })
});

app.get('/generate_complaint', function (req, res) {
    res.sendFile(__dirname + "/generateComplaint.html");
})



// DATABASE connection
const {Client} = require("pg");
const client = new Client({
    host:"localhost",
    user:"postgres",
    port:5432,
    password:"Abhisql",
    database:"Hosteldb"
})
client.connect();


app.post('/',function(req,res){
    var p = req.body.whoami;
    req.session.gid = req.body.stdid;
    var p_passwd = req.body.passwd;
    
    if(p=='std'){
        console.log(req.session.gid)
        client.query(`select student_passwd from student where student_id = '${req.session.gid}'`, (err, res2) => {
            // console.log(res2);
            if(err) console.log(err.message);
            else if (res2.rowCount == 0){
            
                console.log("Student not registered");
                res.send("<h1>Student not registered</h1>");
            }
            else if(p_passwd==res2.rows[0].student_passwd){
                res.redirect('/studentHome');
            }
            else{
                console.log("Password Not Matched.");
                res.send("<h1>Password Not Matched.</h1>");
            }
        })
        
    }
    else if(p=='adm'){
        client.query(`select admin_passwd from admin where admin_id = '${req.session.gid}'`, (err, res2) => {
            // console.log(res2);
            if (err) console.log(err.message);
            else if (res2.rowCount == 0) {
                console.log("Admin not found");
                res.send("<h1>Admin not found</h1>");
            }
            else if (p_passwd == res2.rows[0].admin_passwd) {
                res.redirect('/adminHome');
            }
            else {
                console.log("Password Not Matched.");
                res.send("<h1>Password Not Matched.</h1>");
            }
        })
    }
    else if(p=='wrd'){
        client.query(`select warden_passwd from warden where warden_id = '${req.session.gid}'`, (err, res2) => {
            // console.log(res2);
            if (err) console.log(err.message);
            else if (res2.rowCount == 0) {
                console.log("warden not registered");
                res.send("<h1>warden not registered</h1>");
            }
            else if (p_passwd == res2.rows[0].warden_passwd) {
                res.redirect('/wardenHome');
            }
            else {
                console.log("Password Not Matched.");
                res.send("<h1>Password Not Matched.<h1>");
            }
        })
    }
    else{
        res.send("<h1>Please select a user</h1>");
    }
})



app.post("/register_student", function (req, res) {
    let s_id = req.body.stdid;
    let s_name = req.body.fname +' '+ req.body.lname;
    let s_gender = req.body.gender;
    let s_hostelid = req.body.hostelid;
    let s_contno = req.body.contno;
    let s_roomno = req.body.roomno;
    let s_passwd = req.body.passwd;
    let s_cpasswd = req.body.cpasswd;
    let s_email = req.body.email
    if(s_passwd==s_cpasswd){
        client.query(`insert into student values('${s_id}','${s_name}','${s_passwd}','${s_gender}','${s_contno}','${s_hostelid}','${s_roomno}','${s_email}')`,(err,res2)=>{
            if(err) console.log(err.message);
            else{
                console.log("Successfully added.");
                res.redirect("/");
            }
        });
    }
    
});


// warden
app.post('/register_warden',function(req,res1){
    
    var w_id = req.body.wardid;
    var w_first = req.body.fname;
    var w_last = req.body.lname;
    var w_name = w_first + w_last;
    var w_cont = req.body.warcont;
    var w_pass = req.body.passwd;
    var w_cpass = req.body.cpasswd;
    var w_hid = req.body.hid;
    var w_hname = req.body.hname;
    var w_hcont = req.body.hcont;


    if(w_cpass == w_pass){
        client.query(`insert into warden (warden_id,warden_name,warden_passwd,warden_cont) values('${w_id}' ,'${w_name}','${w_pass}','${w_cont}')`,function(err,res2){
            if(err){
                console.log(err.message);
            }
            else{
                console.log("inserted");
            }
        })
        client.query(`insert into hostel values('${w_hid}','${w_hname}','${w_hcont}','${w_id}')`,function(err,res3){
            if(err){
                console.log(err.message);
            }
            else{
                console.log("inserted into hostel");
                res1.redirect('/');
            }
        })
    }


})

app.post("/generate_complaint",function(req,res){
    let cat = req.body.cat;
    let title = req.body.title;
    let desc = req.body.desc;
    let hid;
    let rno;
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        console.log(req.session);
        client.query(`select hostel_ref_id,room_no from student where student_id = '${req.session.gid}'`,(err1,res1)=>{
        if(err1) {
            console.log(err1.message)
            res.send(err1.message);
        }
        else{
            hid = res1.rows[0].hostel_ref_id;
            rno= res1.rows[0].room_no;
            client.query(`insert into complaints(category,description,student_ref_id,hostel_ref_id,status,title,room_no,auth,ack) values('${cat}','${desc}','${req.session.gid}','${hid}','Pending','${title}',${rno},'Warden','No')`, function (err2, res2) {
                if (err2) {
                    console.log(err2.message);
                }
                else {
                    console.log("inserted");
                    res.redirect("/studentHome");
                }
            })
        } 
    })
}
})

//view my complaints


// var myid = 'satvik12';
app.get('/view_my_complaints', function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        client.query(`select * from complaints where student_ref_id = '${req.session.gid}'`,function(err2,res2){
        if(err2){
            console.log(err2.message);
        }
        else{
            res.render("list", {arr:res2.rows});    
        }
    })
    }
})


app.get('/view_complaints_warden',function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        client.query(`select * from Complaints where auth='Warden' and hostel_ref_id = (select hostel_id from hostel where warden_ref_id = '${req.session.gid}')`, function(err,res2){
        if(err){
            console.log(err.message);
            res.send(err.message);
        }
        else{
            res.render("viewWarden",{arr:res2.rows})
        }
    })
    }
})


app.get('/view_complaints_admin',function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        client.query(`select * from Complaints where auth='Admin'`, function(err,res2){
            if(err){
                console.log(err.message);
                res.send("<h1>" + err.message + "</h1>");
            }
            else{
                res.render("viewAdmin",{arr:res2.rows})
            }
        })
    }
})

app.post('/view_complaints_admin',function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        if (req.body.submit == 'sort') {
            let cat = req.body.cat;
            let type = req.body.type;
            client.query(`select * from Complaints where auth='Admin' ORDER BY ${cat} ${type}`, function (err, res2) {
                if (err) {
                    console.log(err.message);
                    res.send(err.message);
                }
                else {
                    res.render("viewAdmin", { arr: res2.rows })
                }
            })
        }
        else if (req.body.submit == 'filter') {
            let cat = req.body.cat;
            client.query(`select * from Complaints where auth='Admin' and category='${cat}'`, function (err, res2) {
                if (err) {
                    console.log(err.message);
                    res.send(err.message);
                }
                else {
                    res.render("viewAdmin", { arr: res2.rows })
                }
            })
        }
        else {
            id = req.body.submit;
            st = req.body.status;
            client.query(`update complaints set status = '${st}' where complaint_id = '${id}'`, function (err, res2) {
                if (err) {
                    res.send("<h1>" + err.message + "</h1>");
                }
                else {
                    client.query(`select * from student where student_id = (select student_ref_id from complaints where complaint_id='${id}')`, function (err3, res3) {
                        if (err3) {
                            console.log(err3.message);
                            res.send(err3.message);
                        }
                        else {
                            var mailOptions = {
                                from: 'miniprojectgithub@gmail.com',
                                to: res3.rows[0].email,
                                subject: 'Complaint status changed to ' + st,
                                text: 'Complaint id: ' + id + '\n\nCurrent Status: ' + st + '\n\nName: ' + res3.rows[0].student_name + '\n\nRoom No: ' + res3.rows[0].room_no
                            };
                            transporter.sendMail(mailOptions, (err4, info) => {
                                if (err4) console.log(err4);
                                else {
                                    console.log("email sent");
                                    res.send("<h1>Email Send Successfully.</h1>");
                                }
                            });
                            res.redirect("/view_complaints_admin");
                        }
                    })
                }
            })
        }
    }
})

app.post('/view_complaints_warden',function(req,res){
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        if(req.body.submit=='sort'){
            let cat = req.body.cat;
            let type = req.body.type;
            client.query(`select * from Complaints where auth='Warden' and hostel_ref_id = (select hostel_id from hostel where warden_ref_id = '${req.session.gid}') ORDER BY ${cat} ${type}`, function (err, res2) {
                if (err) {
                    console.log(err.message);
                    res.send(err.message);
                }
                else {
                    res.render("viewWarden", { arr: res2.rows })
                }
            })
        }
        else if(req.body.submit=='filter'){
            let cat = req.body.cat;
            client.query(`select * from Complaints where auth='Warden' and hostel_ref_id = (select hostel_id from hostel where warden_ref_id = '${req.session.gid}' and category='${cat}')`, function (err, res2) {
                if (err) {
                    console.log(err.message);
                    res.send(err.message);
                }
                else {
                    res.render("viewWarden", { arr: res2.rows })
                }
            })
        }
        else{
            var cid = req.body.submit;
            client.query(`update complaints set auth='Admin' where complaint_id = '${cid}'`,function(err,res2){
                if(err){
                    console.log(err.message);
                    res.send("<h1>" + err.message + "</h1>");
                }
                else{
                    res.redirect('/view_complaints_warden');
                }
            })
        }
    }
})
app.post("/view_complaints_warden2", function(req,res){
    id = req.body.submit;
    st = req.body.status;
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{

        client.query(`update complaints set status = '${st}' where complaint_id = '${id}'`, function(err,res2){
            if(err){
                res.send("<h1>"+err.message+"</h1>");
            }
            else{
                client.query(`select * from student where student_id = (select student_ref_id from complaints where complaint_id='${id}')`,function(err3,res3){
                    if(err3){
                        console.log(err3.message);
                        res.send(err3.message);
                    }
                    else{
                        var mailOptions = {
                            from: 'miniprojectgithub@gmail.com',
                            to: res3.rows[0].email,
                            subject: 'Complaint status changed to ' + st,
                            text: 'Complaint id: ' + id + '\n\nCurrent Status: ' + st + '\n\nName: ' + res3.rows[0].student_name + '\n\nRoom No: ' + res3.rows[0].room_no
                        };
                        transporter.sendMail(mailOptions, (err4, info) => {
                            if (err4) console.log(err4);
                            else {
                                console.log("email sent");
                                res.send("<h1>Email Send Successfully.</h1>");
                            }
                        });
                        res.redirect("/view_complaints_warden");
                    }
                    
                })
            }
        })
    }
})

app.post("/view_my_complaints", function(req,res){
    let id = req.body.ack;
    if (req.session.gid ==''){
        res.redirect("/");
    }
    else{
        client.query(`delete from complaints where complaint_id = '${id}'`, function(err,res2){
            if(err){
                res.send("<h1>"+err.message+"</h1>");
            }
            else{
                res.redirect("/view_my_complaints");
            }
        })
    }
})

app.post("/send_mail",function(req,res){
    let c_id = req.body.submit;
    client.query(`select * from complaints where complaint_id = '${c_id}'`,(err2,res2)=>{
        if(err2) console.log(err2)
        else{
            client.query(`select * from utility where category = '${res2.rows[0].category}'`, (err3, res3) => {
                if (err3) console.log(err3)
                else {
                    var mailOptions = {
                        from: 'miniprojectgithub@gmail.com',
                        to: res3.rows[0].email,
                        subject: res2.rows[0].title,
                        text: 'Description: '+res2.rows[0].description+'\n\nRoom No: '+res2.rows[0].room_no+'\n\nHostel Id: '+res2.rows[0].hostel_ref_id
                    };
                    transporter.sendMail(mailOptions, (err4, info) => {
                        if (err4) console.log(err4);
                        else{
                            console.log("email sent");
                            res.send("<h1>Email Send Successfully.</h1>")
                        } 
                    });
                }
            })
        }
    })
})

app.get('/forgotPassword',function(req,res){
    res.sendFile(__dirname+'/forgotPassword.html');
})
app.post('/forgotPassword',function(req,res){
    id = req.body.id;
    client.query(`select * from student where student_id = '${id}'`, (err2, res2) => {
        if (err2) console.log(err3)
        else {
            var mailOptions = {
                from: 'miniprojectgithub@gmail.com',
                to: res2.rows[0].email,
                subject: 'Password',
                text: 'Your Password is '+ res2.rows[0].student_passwd
            };
            transporter.sendMail(mailOptions, (err4, info) => {
                if (err4) console.log(err4);
                else {
                    console.log("email sent to registered email.");
                }
            });
            res.redirect('/');
        }
    })
})

app.listen(3000, function () {
    console.log('server running on port 3000')
});