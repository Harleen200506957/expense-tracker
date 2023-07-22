const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const Joi = require("joi");

const registerValidator = Joi.object({
  name: Joi.string().trim().min(4).required(),
  password: Joi.string().pattern(
    new RegExp('^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-z])(?=.*[A-Z]).*$')
  ),
  confpassword: Joi.ref("password"),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .message("Invalid email format"),
}).options({ abortEarly: false });

exports.register = async (req, res) => {
  const formError = {};
  let wasValidated = false;

  if (req.method === "POST") {
    let { error, value } = registerValidator.validate(req.body, {
      allowUnknown: false,
    });
    wasValidated = true;

    error?.details.forEach((err) => {
      formError[err.context.label] = err.message;
    });

    const userExists = await User.findOne({
      email: req.body.email,
    });

    if(userExists) {
      formError['email'] = "Eamil is already in use";
      error = true;
    }

    if (!error) {
      try {
        const hashedPassword = await bcrypt.hash(value.password, 10);
        const user = new User({
          name: value.name,
          email: value.email,
          password: hashedPassword,
        });
        const savedUser = await user.save();
        // Redirect to the /login route
        return res.redirect("/login");
      } catch (error) {
        console.error("Error creating user:", error.message);
      }
    }
  }

  res.render("register", {
    pageTitle: "Register",
    path: "/register",
    registerRoute: true,
    errors: formError,
    wasValidated,
  });
};

exports.login = async (req, res, next) => {
  let loginFailed = true;

  if (req.method === "POST") {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = await User.findOne({
        email: req.body.email,
      });

      if (user && (await bcrypt.compare(req.body.password, user.password))) {
        const token = jwt.sign({ userId: user._id }, 'your_secret_key', {
          expiresIn: '1h', // Set the token expiration time as needed
        });

        // Send the token as a cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

        return res.redirect('/expense');
      }

      loginFailed = false;
    } catch (error) {}
  }

  res.render("login", {
    pageTitle: "Login",
    path: "/login",
    loginRoute: true,
    loginFailed,
  });
};
