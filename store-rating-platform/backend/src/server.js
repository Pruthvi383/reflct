require("dotenv").config();

const { connectDb } = require("./config/db");
const app = require("./app");
const port = process.env.PORT || 3001;

connectDb().then(() => {
  app.listen(port, () => console.log(`API running on port ${port}`));
});
