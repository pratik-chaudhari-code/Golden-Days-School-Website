const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const multer = require("multer"); 
const { userInfo } = require("os");
const fs=require("fs")
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // // useCreateIndex: true
})
.then(() => {
  console.log(`Connected to MongoDB`);
})
.catch((error) => {
  console.error("MongoDB connection error:", error);
});
// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public2")));
app.use(express.static(path.join(__dirname, "public/staff_login")));

const studDataSchema = new mongoose.Schema({
  studname: String,
  parentname: String,
  email: String,
  phone: String,
  grade: String,
  year_of_passing: String,
  pschool: String,
  referral: String,
});

const StudData = mongoose.model("StudData", studDataSchema);
app.post("/submit", async (req, res) => {
  try {
    console.log("Received form data:", req.body);

    const newData = new StudData({
      studname: req.body.studname,
      parentname: req.body.parentname,
      email: req.body.email,
      phone: req.body.phone,
      grade: req.body.grade,
      year_of_passing: req.body.year_of_passing,
      pschool: req.body.pschool,
      referral: req.body.referral,
    });

    console.log("New data object:", newData);

    await newData.save();
    console.log("Data saved successfully");

    res.redirect("/");
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send("Internal Server Error");
  }
});

const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const LoginData = mongoose.model("LoginData", loginSchema);

module.exports = LoginData;

// app.post("/staff_login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const user = await LoginData.findOne({ username });

//     console.log("Staff login object:", user);

//     if (user) {
//       console.log("Retrieved password:", user.password);

//       const passwordMatch1 = user.password;

//       console.log("Password match:", passwordMatch1);

//       if (passwordMatch1) {
//         res.redirect("/admission_data");
//       } else {
//         res.status(401).json({message:"Login unsuccessful: Incorrect password"});
//       }
//     } else {
//       res.status(404).json({message:"Login unsuccessful: Login not found"});
//     }
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({message:"Internal Server Error"});
//   }
// });

app.post("/staff_login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await LoginData.findOne({ username });

    if (user) {
      // Compare the plaintext password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.json({ success: true, redirectUrl: "/admission_data" });
      } else {
        res.status(401).json({ message: "Login unsuccessful: Incorrect password" });
      }
    } else {
      res.status(404).json({ message: "Login unsuccessful: User not found" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





const AdminloginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const AdminLoginData = mongoose.model("AdminLoginData", AdminloginSchema);

module.exports = AdminLoginData;


// app.post("/admin", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const admin = await AdminLoginData.findOne({ username });

//     console.log("Admin object:", admin); // Log the retrieved admin object

//     if (admin) {
//       console.log("Retrieved hashed password:", admin.password); // Log the retrieved hashed password

//       // Compare the user-entered plaintext password with the hashed password from the database
//       bcrypt.compare(password, admin.password, function(err, passwordMatch) {
//         if (err) {
//           console.error("Error comparing passwords:", err);
//           res.status(500).send("Internal Server Error");
//           return;
//         }

//         console.log("Password match:", passwordMatch); // Log the result of the password comparison

//         if (passwordMatch) {
//           res.redirect("/addUser"); // Successful login redirect
//         } else {
//           res.status(401).send("Login unsuccessful: Incorrect password");
//         }
//       });
//     } else {
//       res.status(404).send("Login unsuccessful: Admin not found");
//     }
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });
app.post("/admin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await AdminLoginData.findOne({ username });

    if (admin) {
      bcrypt.compare(password, admin.password, function(err, passwordMatch) {
        if (err) {
          return res.status(500).json({ message: "Internal Server Error" });
        }

        if (passwordMatch) {
          return res.json({ success: true, redirectUrl: "/addUser" });
        } else {
          return res.status(401).json({ message: "Login unsuccessful: Incorrect password" });
        }
      });
    } else {
      return res.status(404).json({ message: "Login unsuccessful: Admin not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/display", async (req, res) => {
  try {
    const data1 = await StudData.find({});
    console.log(data1);
    res.json(data1);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// app.post("/add", async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.pass, 10); // 10 is the saltRounds

//     const addNewUser = new LoginData({
//       username: req.body.user,
//       password: hashedPassword,
//     });
//     await addNewUser.save();
//     // alert("User added successfully");
//     res.redirect("/addUser");
//   } catch (error) {
//     console.error("Error adding user:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/add", async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.pass, 10); // 10 is the saltRounds
//     const roleBody = req.body.role;
//     let addNewUser;
    
//     if (roleBody === "Teacher") {
//       addNewUser = new LoginData({
//         username: req.body.user,
//         password: hashedPassword,
//       });
//     } else if (roleBody === "Admin") {
//       addNewUser = new AdminLoginData({
//         username: req.body.user,
//         password: hashedPassword,
//       });
//     } else {
//         // alert("Invalid role specified");
//         return res.status(400).send("Invalid role specified");
//     }

//     await addNewUser.save();
//     // alert("Added successfully");
//     res.redirect("/addUser");
//   } catch (error) {
//     console.error("Error adding user:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.post("/add", async (req, res) => {
  try {
    const username = req.body.user;
    const roleBody = req.body.role;

    let existingUser;
    if (roleBody === "Teacher") {
      existingUser = await LoginData.findOne({ username });
    } else if (roleBody === "Admin") {
      existingUser = await AdminLoginData.findOne({ username });
    } else {
      return res.status(400).send("Invalid role specified");
    }

    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(req.body.pass, 10); 
    let addNewUser;

    if (roleBody === "Teacher") {
      addNewUser = new LoginData({
        username,
        password: hashedPassword,
      });
    } else if (roleBody === "Admin") {
      addNewUser = new AdminLoginData({
        username,
        password: hashedPassword,
      });
    }

    await addNewUser.save();
    res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




app.post("/updatedata", async (req, res) => {
  try {
    const username = req.body.user;
    const hashedPassword = await bcrypt.hash(req.body.pass, 10);
    const roleBody = req.body.role;

    let updateUser;

    if (roleBody === "Teacher") {
      updateUser = await LoginData.findOneAndUpdate(
        { username: username },
        { password: hashedPassword },
        { new: true }
      );
    } else if (roleBody === "Admin") {
      updateUser = await AdminLoginData.findOneAndUpdate(
        { username: username },
        { password: hashedPassword },
        { new: true }
      );
    } else {
      return res.status(400).send("Invalid role specified");
    }

    if (!updateUser) {
      return res.status(404).send("User not found");
    }

  //   res.status(200).send("Password updated successfully");
  // } catch (error) {
  //   console.error("Error updating password:", error);
  //   res.status(500).send("Internal Server Error");
  // }

  res.status(201).json({message:"Password Updated Successfully!"});
  }
  catch(error)
  {
    console.error("Error updating the user : ",error);
    res.status(500).json({message:"Internal Server Error"});
  }
});


app.post("/deletedata", async (req, res) => {
  try {
    const username = req.body.user;
    let deleteUser;
    const roleBody = req.body.role;

    if (roleBody === "Teacher") {
      deleteUser = await LoginData.findOneAndDelete({ username });
    } else if (roleBody === "Admin") {
      deleteUser = await AdminLoginData.findOneAndDelete({ username });
    } else {
      return res.status(400).send("Invalid data");
    }

    if (!deleteUser) {
      return res.status(404).send("User not found");
    }

  //   res.status(200).send("User deleted successfully");
  // } catch (error) {
  //   console.error("Error deleting user:", error);
  //   res.status(500).send("Internal Server Error");
  // }

  res.status(201).json({message:"User deleted successfully"});
  }
  catch(error)
  {
    res.status(500).json({message:"Internal Server Error"});
  }
});


app.get("/export", async (req, res) => {
  try {
    const data2 = await StudData.find();

    const jsonData = data2.map((item) => ({
      studname: toTitleCase(item.studname),
      parentname: toTitleCase(item.parentname),
      email: item.email,
      phone: item.phone,
      grade: toTitleCase(item.grade),
      year_of_passing: item.year_of_passing,
      pschool: toTitleCase(item.pschool),
      referral: toTitleCase(item.referral),
    }));
    console.log(jsonData);
    const worksheet = xlsx.utils.json_to_sheet(jsonData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = xlsx.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=custom_filename.xlsx"
    );
    res.send(excelBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

function toTitleCase(text) {
  if (!text) return "";
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/send-notice', upload.single('attachment'), async (req, res) => {
  const { toSent, subject, message } = req.body;
  const attachment = req.file;

  const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {

          user:'goldendaysuniversalschool1@gmail.com',
          pass :process.env.mailPass,
      },
  });

  const mailOptions = {
      from: {
          name: 'Golden Days Universal School',
          address: 'goldendaysuniversalschool1@gmail.com',
      },
      to: toSent,
      subject: subject,
      text: message,
  };

  if (attachment) {
      mailOptions.attachments = [{
          filename: attachment.originalname,
          path: attachment.path,
      }];
  }

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error('Error sending email:', error);
          return res.status(500).send('Error sending email');
      }
      console.log('Email sent: ' + info.response);
      res.send('Notice sent successfully');
  });
});



app.get("/admission_data", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public/Table_data/sidebar_frontpage.html")
  );
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/staff_login/login.html"));
});

app.get("/admission_history", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/staff_login/admission_enquiry.html"));
});

app.get("/adduser", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/Add_user/add.html"));
});

app.get("/dashboard", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/staff_login/dashboard.html"));
});
app.get("/notice", async (req, res) => {
    res.sendFile(path.join(__dirname, "public/Table_data/notice.html"));
  });

app.get("/admin_login", async (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin_login/admin_login.html"));
});

app.get("/admissions", (req, res) => {
  res.sendFile(path.join(__dirname, "public2", "admission.html"));
});

const server = app.listen(port, () => {
  console.log(`\nServer is running on port \n http://localhost:${port}`);
  // console.log("Successfully Started");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    // console.log('MongoDB connection closed');
    server.close();
  });
});
