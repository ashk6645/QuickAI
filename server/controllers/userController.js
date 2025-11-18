import sql from "../configs/db.js";

/* Helpers*/
const safeJson = (res, status = 200, body = {}) => res.status(status).json(body);

const ensureAuth = (req) => {
  if (!req || typeof req.auth !== "function") {
    throw new Error("Missing auth middleware");
  }
  const authResult = req.auth();
  if (!authResult || !authResult.userId) {
    const e = new Error("Unauthorized");
    e.status = 401;
    throw e;
  }
  return authResult.userId;
};

const parseIntSafe = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

/*Controllers*/

/* GET user's creations (supports optional pagination: ?limit=&page=)*/
export const getUserCreations = async (req, res) => {
  try {
    const userId = ensureAuth(req);

    // Pagination params (defensive)
    const limit = Math.min(parseIntSafe(req.query.limit, 50), 100); // cap at 100
    const page = Math.max(parseIntSafe(req.query.page, 1), 1);
    const offset = (page - 1) * limit;

    const creations = await sql`
      SELECT *
      FROM creations
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return safeJson(res, 200, { success: true, creations, meta: { page, limit } });
  } catch (error) {
    // If ensureAuth threw an error with status, use it; otherwise 500
    const status = error.status || 500;
    console.error("getUserCreations error:", error?.message || error);
    return safeJson(res, status, { success: false, message: error.message || "Server error" });
  }
};

/* GET all published creations (public feed). Supports pagination and optional type filter.*/
export const getPublishedCreations = async (req, res) => {
  try {
    // Pagination
    const limit = Math.min(parseIntSafe(req.query.limit, 20), 100);
    const page = Math.max(parseIntSafe(req.query.page, 1), 1);
    const offset = (page - 1) * limit;

    // Optional filters
    const type = req.query.type; // e.g., "image" or "article"

    let creations;
    if (type && typeof type === "string") {
      creations = await sql`
        SELECT *
        FROM creations
        WHERE publish = true AND type = ${type}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      creations = await sql`
        SELECT *
        FROM creations
        WHERE publish = true
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    return safeJson(res, 200, { success: true, creations, meta: { page, limit, type: type || null } });
  } catch (error) {
    console.error("getPublishedCreations error:", error?.message || error);
    return safeJson(res, 500, { success: false, message: error.message || "Server error" });
  }
};

/* Toggle like for a creation by id.*/
export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { id } = req.body ?? {};

    if (!id) return safeJson(res, 400, { success: false, message: "Creation id is required" });

    // fetch creation
    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return safeJson(res, 404, { success: false, message: "Creation not found" });
    }

    const userIdStr = userId.toString();

    // If likes is null in DB, treat as empty array.
    // Check whether user already liked (best-effort in JS)
    const currentLikes = Array.isArray(creation.likes) ? creation.likes.map(String) : [];
    const hasLiked = currentLikes.includes(userIdStr);

    let updateResult;
    if (hasLiked) {
      // remove user from likes array using array_remove
      updateResult = await sql`
        UPDATE creations
        SET likes = array_remove(coalesce(likes, ARRAY[]::text[]), ${userIdStr})
        WHERE id = ${id}
        RETURNING likes
      `;
    } else {
      // append user to likes array using array_append
      updateResult = await sql`
        UPDATE creations
        SET likes = array_append(coalesce(likes, ARRAY[]::text[]), ${userIdStr})
        WHERE id = ${id}
        RETURNING likes
      `;
    }

    const updatedLikes = updateResult?.[0]?.likes ?? [];
    const message = hasLiked ? "Creation unliked" : "Creation liked";

    return safeJson(res, 200, { success: true, message, likes: updatedLikes });
  } catch (error) {
    const status = error.status || 500;
    console.error("toggleLikeCreation error:", error?.message || error);
    return safeJson(res, status, { success: false, message: error.message || "Server error" });
  }
};

/*
 * Delete a creation. Only the owner (creation.user_id) can delete it.
 */
export const deleteCreation = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { id } = req.body ?? {};

    if (!id) return safeJson(res, 400, { success: false, message: "Creation id is required" });

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return safeJson(res, 404, { success: false, message: "Creation not found" });
    }

    if (creation.user_id !== userId) {
      return safeJson(res, 403, { success: false, message: "Unauthorized to delete this creation" });
    }

    await sql`DELETE FROM creations WHERE id = ${id}`;

    return safeJson(res, 200, { success: true, message: "Creation deleted successfully" });
  } catch (error) {
    const status = error.status || 500;
    console.error("deleteCreation error:", error?.message || error);
    return safeJson(res, status, { success: false, message: error.message || "Server error" });
  }
};
