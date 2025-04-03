const pool = require("./pool");
const bcrypt = require("bcrypt");

const seed = async () => {
  try {
    await pool.query("DELETE FROM comments");
    await pool.query("DELETE FROM posts");
    await pool.query("DELETE FROM users");

    const hashedPassword1 = await bcrypt.hash("password123", 10);
    const hashedPassword2 = await bcrypt.hash("secret456", 10);

    const user1 = await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
      ["alice", hashedPassword1]
    );
    const user2 = await pool.query(
      `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`,
      ["bob", hashedPassword2]
    );

    const post1 = await pool.query(
      `INSERT INTO posts (title, content, published, author_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      ["Welcome to the Blog", "This is the first post!", true, user1.rows[0].id]
    );

    const post2 = await pool.query(
      `INSERT INTO posts (title, content, published, author_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      ["Secret Draft", "This post is still a draft.", false, user1.rows[0].id]
    );

    await pool.query(
      `INSERT INTO comments (content, post_id, author_id)
       VALUES ($1, $2, $3), ($4, $5, $6)`,
      [
        "Great post!",
        post1.rows[0].id,
        user2.rows[0].id,
        "Can't wait to read more!",
        post2.rows[0].id,
        user2.rows[0].id,
      ]
    );

    console.log("✅ Seed complete.");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding DB:", err);
    process.exit(1);
  }
};

seed();
