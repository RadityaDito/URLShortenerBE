const ShortUrl = require("../models/shortUrl");
const User = require("../models/userModel");

//api to get all user
const apiGetAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users: users });
  } catch (err) {
    res.status(400).json(err);
  }
};

//api to update user data
const apiUpdateUser = async (req, res) => {
  const userId = req.params.userId;
  const updatedData = req.body; // Assuming the request body contains the updated fields

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update the user object with the new data
    user.name = updatedData.name || user.name;
    user.universitas = updatedData.universitas || user.universitas;
    user.fakultas = updatedData.fakultas || user.fakultas;
    user.jurusan = updatedData.jurusan || user.jurusan;
    user.angkatan = updatedData.angkatan || user.angkatan;

    // Save the updated user to the database
    const updatedUser = await user.save();

    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to update user",
      error: err.message,
    });
  }
};

//api to get all short urls by passing 0 else it will find by user id
const apiGetAll = async (req, res) => {
  try {
    const user_id = req.params.id;
    const query = user_id != 0 ? { user_id } : {};

    const shortUrls = await ShortUrl.find(query);
    const success = shortUrls.length > 0;
    res.status(200).json({ success: success, results: shortUrls });
  } catch (err) {
    res.status(400).json({ success: false, errors: err });
  }
};

//api to post a new url and shorten it
const apiPostShorten = async (req, res) => {
  try {
    let shortUrls;
    if (req.body.short_url && req.body.short_url.trim() !== "" || req.body.title && req.body.title.trim() !== "") {
      shortUrls = new ShortUrl({
        user_id: req.body.user_id,
        title: req.body.title,
        full: req.body.full_url,
        short: req.body.short_url,
      });
    } else {
      shortUrls = new ShortUrl({
        user_id: req.body.user_id,
        title: "Title",
        full: req.body.full_url,
      });
    }
    await shortUrls.save();
    res.status(200).json({ success: true, results: shortUrls });
  } catch (err) {
    res.status(404).json({ success: false, errors: err });
  }
};

//api to update a short url
const apiPutShorten = async (req, res) => {
  try {
    let shortUrls;
    if (req.body.full_url && req.body.full_url.trim() !== "" || req.body.title && req.body.title.trim() !== "") {
      shortUrls = await ShortUrl.findOneAndUpdate(
        { _id: req.body._id },
        { full: req.body.full_url, short: req.body.short_url, title: req.body.title }
      );
    } else if (req.body.short_url && req.body.short_url.trim() !== ""|| req.body.title && req.body.title.trim() !== "") {
      shortUrls = await ShortUrl.findOneAndUpdate(
        { _id: req.body._id },
        { short: req.body.short_url, title: req.body.title }
      );
    } else {
      throw new Error("Full URL or Short URL is required");
    }
    res.status(200).json({ success: true, results: "Successfully Updated!" });
  } catch (err) {
    res.status(404).json({ success: false, errors: err });
  }
};

//api to lookup a short url
const apiSearchShorten = async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ _id: req.params.id });
    res.status(200).json({ success: true, results: shortUrl });
  } catch (err) {
    res.status(404).json({ success: false, errors: err });
  }
};

//api to delete a short url
const apiDeleteShorten = async (req, res) => {
  try {
    await ShortUrl.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true, results: "Successfully Deleted!" });
  } catch (err) {
    res.status(404).json({ success: false, errors: err });
  }
};

//api to redirect to the full url
const apiGetRedirect = async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);
  shortUrl.clicks++;
  shortUrl.save();
  res.redirect(shortUrl.full);
};


module.exports = {
  apiGetAll,
  apiUpdateUser,
  apiPostShorten,
  apiGetRedirect,
  apiPutShorten,
  apiGetAllUser,
  apiDeleteShorten,
  apiSearchShorten,
};
