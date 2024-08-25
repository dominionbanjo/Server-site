require("dotenv").config();
require("express-async-errors");
const path = require("path");

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

const morgan = require("morgan");
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");
//routers
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.resolve(__dirname, "../Client/dist")));

app.use(helmet());
app.use(cors());
app.use(xss());

// extra packages

// routes
// app.get("/", (req, res) => {
//   res.status(200).send("Jobs Api");
// });
app.use("/api/v1/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
