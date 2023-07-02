const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");
const bcrypt = require("bcrypt");

//UPDATE
router.put("/:id", async (req, res) => {
  //Prepping/Consolidating Information to update

  //TODO: Use ID's instead.
  const user = await User.findOne({ username: req.body.oldUsername });
  console.log(user);
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      const validated = await bcrypt.compare(
        req.body.currPassword,
        user.password
      );
      if (!validated) {
        //Return here some form of error when passwords do match.
        req.body.password = user.password;
      } else {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
    } else {
      req.body.password = user.password;
    }

    //Sending to update
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else {
    //401 u are not allowed
    res.status(401).json("You may only update your account..");
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ username: user.username });
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted.");
      } catch (err) {
        console.log(err);
        res.status(500).json(err);
      }
    } catch (err) {
      res.status(404).json("User not found..");
    }
  } else {
    //401 u are not allowed
    res.status(401).json("You may only delete your account..");
  }
});

//GET USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
