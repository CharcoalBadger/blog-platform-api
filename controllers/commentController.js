const pool = require("../db/pool");

const getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  try {
    const result = await pool.query(
      `SELECT comments.*, users.username AS author
       FROM comments
       JOIN users ON comments.author_id = users.id
       WHERE post_id = $1
       ORDER BY created_at ASC`,
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch comments" });
  }
};

const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const authorId = req.user.id;

  try {
    const result = await pool.query(
      `INSERT INTO comments (content, post_id, author_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [content, postId, authorId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not create comment" });
  }
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const check = await pool.query("SELECT * FROM comments WHERE id = $1", [
      id,
    ]);
    if (!check.rows[0] || check.rows[0].author_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE comments SET content = $1 WHERE id = $2 RETURNING *`,
      [content, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Could not update comment" });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const check = await pool.query("SELECT * FROM comments WHERE id = $1", [
      id,
    ]);
    if (!check.rows[0] || check.rows[0].author_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [id]);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete comment" });
  }
};

module.exports = {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
};
