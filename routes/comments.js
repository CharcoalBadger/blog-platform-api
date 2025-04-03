const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticateToken = require("../middleware/auth");

// Public
router.get("/post/:postId", commentController.getCommentsByPostId);

// Authenticated
router.post(
  "/post/:postId",
  authenticateToken,
  commentController.createComment
);
router.put("/:id", authenticateToken, commentController.updateComment);
router.delete("/:id", authenticateToken, commentController.deleteComment);

module.exports = router;
