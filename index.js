require('dotenv').config();
const express = require("express");
const path = require("path");
const { create } = require("express-handlebars");

const app = express();
const db = require('./utils/db');
// parse
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// initalize middle ware 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const hbs = create({
  helpers: {
    eq: function (arg1, arg2) {
      console.log(arg1, arg2);
      return arg1 === arg2;
    },
    formatDate: function (date) {
      const d = new Date(date);
      const year = d.getFullYear().toString().padStart(4, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const day = d.getDate().toString().padStart(2, "0");
    
      return `${year}-${month}-${day}`;
    },
  },
  layoutsDir: "views/layouts/",
  defaultLayout: "main",
  extname: "hbs",
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

app.engine(
  "hbs",
  hbs.engine
);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(
  "/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);
app.use(cookieParser());

const authRoute = require('./routes/auth');
const expenseRoute = require('./routes/expense');

const { authenticateJWT } = require('./utils/auth-middleware');

app.use(authRoute);

app.use('/expense', authenticateJWT, (req, res, next) => {
  if(req.user) {
    return next();
  }

  res.redirect('/login');
}, expenseRoute);

// Route for logout
app.get('/logout', (req, res) => {
  // Clear the JWT token cookie by setting it to an empty value and setting the expiration to a past date
  res.clearCookie('token', { httpOnly: true, expires: new Date(0) });
  // Redirect the user to the home page or any other desired location
  res.redirect('/login');
});

app.use('/', (req, res, next) => {
  res.render("404", {
    pageTitle: "Page Not Found",
  });  
})


app.listen(process.env.PORT);
