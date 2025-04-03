const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authenticateToken = require("../middleware/auth");

router.get("/", postController.getPublishedPosts);
router.get("/all", authenticateToken, postController.getAllPosts);
router.get("/:id", postController.getPostById);

router.post("/", authenticateToken, postController.createPost);
router.put("/:id", authenticateToken, postController.updatePost);
router.delete("/:id", authenticateToken, postController.deletePost);

module.exports = router;
