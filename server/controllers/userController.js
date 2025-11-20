import sql from "../configs/db.js";

/* --- Config / Defaults --- */
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* Helpers */
const safeJson = (res, status = 200, body = {}) => res.status(status).json(body);

const ensureAuth = (req) => {
  if (!req || typeof req.auth !== "function") {
    const e = new Error("Missing auth middleware");
    e.status = 401;
    throw e;
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

/* Utility to build pagination meta */
const calcPaginationMeta = (total, page, limit) => {
  const pages = Math.max(1, Math.ceil((Number(total) || 0) / limit));
  return { total: Number(total) || 0, page, limit, pages };
};

/* --- Controllers --- */

/* GET user's creations (supports optional pagination: ?limit=&page=) */
export const getUserCreations = async (req, res) => {
  try {
    const userId = ensureAuth(req);

    const limit = Math.min(parseIntSafe(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const page = Math.max(parseIntSafe(req.query.page, 1), 1);
    const offset = (page - 1) * limit;

    // Run count and data queries in parallel for meta
    const [countResult, creations] = await Promise.all([
      sql`SELECT COUNT(*)::int AS total FROM creations WHERE user_id = ${userId}`,
      sql`
        SELECT *
        FROM creations
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
    ]);

    const total = countResult?.[0]?.total ?? 0;
    const meta = calcPaginationMeta(total, page, limit);

    return safeJson(res, 200, { success: true, creations, meta });
  } catch (error) {
    const status = error?.status || 500;
    console.error("getUserCreations error:", error?.message || error);
    return safeJson(res, status, { success: false, message: error?.message || "Server error" });
  }
};

/* GET all published creations (public feed). Supports pagination and optional type filter. */
export const getPublishedCreations = async (req, res) => {
  try {
    const limit = Math.min(parseIntSafe(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const page = Math.max(parseIntSafe(req.query.page, 1), 1);
    const offset = (page - 1) * limit;
    const type = req.query.type && typeof req.query.type === "string" ? req.query.type : null;

    // Use parameterized queries and run count + data in parallel
    let countQuery;
    let dataQuery;

    if (type) {
      countQuery = sql`SELECT COUNT(*)::int AS total FROM creations WHERE publish = true AND type = ${type}`;
      dataQuery = sql`
        SELECT *
        FROM creations
        WHERE publish = true AND type = ${type}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      countQuery = sql`SELECT COUNT(*)::int AS total FROM creations WHERE publish = true`;
      dataQuery = sql`
        SELECT *
        FROM creations
        WHERE publish = true
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const [countResult, creations] = await Promise.all([countQuery, dataQuery]);
    const total = countResult?.[0]?.total ?? 0;
    const meta = { ...calcPaginationMeta(total, page, limit), type: type || null };

    return safeJson(res, 200, { success: true, creations, meta });
  } catch (error) {
    console.error("getPublishedCreations error:", error?.message || error);
    return safeJson(res, 500, { success: false, message: error?.message || "Server error" });
  }
};

/* Toggle like for a creation by id (atomic). */
export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { id } = req.body ?? {};

    if (!id) return safeJson(res, 400, { success: false, message: "Creation id is required" });

    const userIdStr = String(userId);

    const updateResult = await sql`
      UPDATE creations
      SET likes = CASE
        WHEN coalesce(likes, ARRAY[]::text[]) @> ARRAY[${userIdStr}]::text[] THEN array_remove(coalesce(likes, ARRAY[]::text[]), ${userIdStr})
        ELSE array_append(coalesce(likes, ARRAY[]::text[]), ${userIdStr})
      END
      WHERE id = ${id}
      RETURNING likes;
    `;

    if (!updateResult || updateResult.length === 0) {
      return safeJson(res, 404, { success: false, message: "Creation not found" });
    }

    const updatedLikes = updateResult[0].likes ?? [];
    // Determine message by checking presence
    const hasLiked = Array.isArray(updatedLikes) && updatedLikes.map(String).includes(userIdStr);
    const message = hasLiked ? "Creation liked" : "Creation unliked";

    return safeJson(res, 200, { success: true, message, likes: updatedLikes });
  } catch (error) {
    const status = error?.status || 500;
    console.error("toggleLikeCreation error:", error?.message || error);
    return safeJson(res, status, { success: false, message: error?.message || "Server error" });
  }
};


export const deleteCreation = async (req, res) => {
  try {
    const userId = ensureAuth(req);
    const { id } = req.body ?? {};

    if (!id) return safeJson(res, 400, { success: false, message: "Creation id is required" });

    // Delete only if creation.user_id === userId, return deleted row if any
    const deleteResult = await sql`
      DELETE FROM creations
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id;
    `;

    if (!deleteResult || deleteResult.length === 0) {
      const [existing] = await sql`SELECT user_id FROM creations WHERE id = ${id}`;
      if (!existing) {
        return safeJson(res, 404, { success: false, message: "Creation not found" });
      } else {
        return safeJson(res, 403, { success: false, message: "Unauthorized to delete this creation" });
      }
    }

    return safeJson(res, 200, { success: true, message: "Creation deleted successfully" });
  } catch (error) {
    const status = error?.status || 500;
    console.error("deleteCreation error:", error?.message || error);
    return safeJson(res, status, { success: false, message: error?.message || "Server error" });
  }
};
