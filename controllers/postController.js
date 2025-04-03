const pool = require("../db/pool");

const getPublishedPosts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT posts.*, users.username AS author FROM posts JOIN users ON posts.author_id = users.id WHERE published = true ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch posts" });
  }
};

const getPostById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    const post = result.rows[0];
    if (!post || (!post.published && post.author_id !== req?.user?.id)) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch post" });
  }
};

const createPost = async (req, res) => {
  const { title, content, published } = req.body;
  const authorId = req.user.id;
  try {
    const result = await pool.query(
      "INSERT INTO posts (title, content, published, author_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, published, authorId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not create post" });
  }
};

const updatePost = async (req, res) => {
  const id = req.params.id;
  const { title, content, published } = req.body;
  const userId = req.user.id;
  try {
    // Optionally, check ownership
    const check = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (!check.rows[0] || check.rows[0].author_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2, published = $3 WHERE id = $4 RETURNING *",
      [title, content, published, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not update post" });
  }
};

const deletePost = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const check = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);
    if (!check.rows[0] || check.rows[0].author_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete post" });
  }
};

module.exports = {
  getPublishedPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
