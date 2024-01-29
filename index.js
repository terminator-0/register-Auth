const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const session = require("express-session");
dotenv.config();
const bcrypt = require("bcrypt");
const app = express();
const port = process.env.PORT || 3000
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

//session
app.use(session({
    secret: 'yn/SlaxG3.YB{*ayv408',
    resave: false,
    saveUninitialized: false
}));

//mongodb connect
mongoose.connect(`mongodb+srv://${username}:${password}@userdb.unz1y5u.mongodb.net/userDB`, {
    useNewUrlParser: true,
    // useNewUnifiedTopology: true,
});
//schema for mongo
const registerSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const Registration = mongoose.model("Registration", registerSchema);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// homepage
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
})
//register
app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await Registration.findOne({ username });
        if (!existingUser) {
            //password hashing using bcrypt
            const hashedPassword = await bcrypt.hash(password, 10);
            const registerData = new Registration({
                username,
                password: hashedPassword,
            });
            await registerData.save();
            res.send('<script>alert("Registration successful. You can now login."); window.location="/loogin";</script>');
            // res.redirect('/loogin');
        } else {
            res.send('<script>alert("User already exists"); window.location="/error";</script>');
            // console.log("User already exists");
            // res.redirect("/error");
        }
    } catch (error) {
        console.log(error);
        res.redirect("error");

    }
})

//login page
app.post('/login', async (req, res) => {
    const { username, password } = req.body;


    try {
        const user = await Registration.findOne({ username });
        if (!user) {
            // return res.status(401).send('Invalid username or password');
            res.redirect('/logerror');
        }
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                // return res.status(401).send('Invalid username or password');
                res.redirect('/logerror');
            }
            else {
                req.session.user = user;
                res.redirect('/success');
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/success", (req, res) => {
    res.sendFile(__dirname + "/pages/success.html");
})
app.get("/loogin", (req, res) => {
    res.sendFile(__dirname + "/pages/login.html");
})
app.get("/logerror", (req, res) => {
    res.sendFile(__dirname + "/pages/error_login.html");
})

app.get("/error", (req, res) => {
    res.sendFile(__dirname + "/pages/error.html");
})


app.listen(port, () => {
    console.log(`Example app running on port${port}`);
})
