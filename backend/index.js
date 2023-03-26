const express = require("express");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// setting up routes
require("./routes/OCRRoutes")(app.use(express.Router()));

const port = process.env.port || process.env.PORT || 5000;

app.listen(port, () => {
    console.info(`Server listening to port: ${port}`);
});