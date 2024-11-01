import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("pages"));
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
