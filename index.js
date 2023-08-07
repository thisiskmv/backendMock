const express = require("express");
const cors = require("cors");
const { connection } = require("./config/db");
require("dotenv").config();
const { AdModel } = require("./models/Ad.Model");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/classifieds", async (req, res) => {
  const { page, limit, Category, search, sortBy, order } = req.query;
  const query = {};

  if (Category) {
    query.Category = Category;
  }
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  const sortObj = {};
  sortObj[sortBy] = order == "desc" ? -1 : 1;
  const skip = (page - 1) * (limit || 1);
  const todaldocs = await AdModel.countDocuments(query);
  const totalpage = Math.ceil(todaldocs / limit);
  try {
    const products = await AdModel.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    res.status(200).send({ msg: true, products, todaldocs, totalpage });
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.post("/classifieds", async (req, res) => {
  try {
    const newAd = req.body;
    const ad = new AdModel(newAd);
    await ad.save();
    res.status(201).send({ message: "data posted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});

app.delete("/classifieds/:id", async (req, res) => {
  try {
    const adId = req.params.id;
    const deletedAd = await AdModel.findByIdAndDelete(adId);
    if (!deletedAd) {
      return res.status(404).send("Ad not found");
    }
    res.status(200).send("Ad deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

app.listen(5000, async () => {
  try {
    await connection;
    console.log("connected to db successfully");
    console.log("port running on 5000");
  } catch (error) {
    console.log("error connecting to db");
    console.log(error);
  }
});
