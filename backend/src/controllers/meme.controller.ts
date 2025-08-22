import { Request } from "express";
import { Meme } from "../models/Meme";
import { Tag } from "../models/Tag";
import { Op, Sequelize, ValidationError } from "sequelize";
import { FeaturedMeme } from "../models/FeaturedMeme";
import { Vote } from "../models/Vote";

export class MemeController {
  /**
   * Retrieves all memes from the database with optional filtering and pagination
   * @param {Request} req - Express request object containing query parameters
   * @returns {Promise<{memes: any[], totalItems: number, totalPages: number}>} - Paginated memes with metadata
   */
  static async getAllMemes(
    req: Request
  ): Promise<{ memes: any[]; totalItems: number; totalPages: number }> {
    try {
      console.log("=== getAllMemes called ===");

      // 1. Extract and validate pagination parameters
      const { limit, offset } = this.extractPaginationParams(req);

      // 2. Extract filter parameters
      const { tags, sortBy, startDate, endDate } =
        this.extractFilterParams(req);

      // 3. Get user ID if authenticated
      const userId = (req as any).user?.id;
      console.log("Authenticated user ID:", userId);

      // 4. Build query clauses
      const { whereClause, includeClause } = this.buildQueryClauses(
        tags,
        startDate,
        endDate
      );

      // 5. Execute main query for memes
      const { count, rows } = await Meme.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit,
        offset,
        distinct: true,
      });

      console.log("Found memes count:", rows.length);
      console.log("First meme sample:", rows[0]?.toJSON?.());

      // 6. Get IDs of found memes
      const memeIds = rows.map((meme) => meme.id);
      console.log("Meme IDs:", memeIds);

      // 7. Calculate total ratings for each meme
      const votesMap = await this.calculateMemeRatings(memeIds);
      console.log("Votes map:", Object.fromEntries(votesMap));

      // 8. Get user-specific votes (if logged in)
      const userVotesMap = await this.getUserVotes(memeIds, userId);
      console.log("User votes map:", Object.fromEntries(userVotesMap));

      // 9. Transform memes to required format
      const transformedMemes = this.transformMemes(
        rows,
        votesMap,
        userVotesMap
      );

      console.log("Transformed memes sample:", transformedMemes.slice(0, 2));

      // 10. Sort the transformed memes based on sortBy parameter
      const sortedMemes = this.sortTransformedMemes(transformedMemes, sortBy);

      // 11. Calculate total number of pages
      const totalPages = Math.ceil(count / limit);

      return {
        memes: sortedMemes,
        totalItems: count,
        totalPages,
      };
    } catch (error) {
      console.error("Failed to fetch all memes:", error);
      return {
        memes: [],
        totalItems: 0,
        totalPages: 0,
      };
    }
  }

  // Static helper methods to improve readability
  private static extractPaginationParams(req: Request) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }

  private static extractFilterParams(req: Request) {
    const tags = req.query.tags
      ? (req.query.tags as string).split(",").map((tag) => tag.trim())
      : [];
    const sortBy = (req.query.sortBy as string) || "dateDesc";
    const startDate = (req.query.startDate as string) || null;
    const endDate = (req.query.endDate as string) || null;
    return { tags, sortBy, startDate, endDate };
  }

  private static buildQueryClauses(
    tags: string[],
    startDate: string | null,
    endDate: string | null
  ) {
    const whereClause: any = {};
    const includeClause: any[] = [
      {
        model: Tag,
        as: "tags",
        required: false,
        through: { attributes: [] },
      },
    ];

    // Filter by tags
    if (tags.length > 0) {
      whereClause["$tags.name$"] = {
        [Op.in]: tags,
      };
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt[Op.lte] = new Date(endDate);
      }
    }

    return { whereClause, includeClause };
  }

  private static async calculateMemeRatings(memeIds: number[]) {
    if (memeIds.length === 0) return new Map<number, number>();

    const votesCount: any[] = await Vote.findAll({
      where: {
        meme_id: { [Op.in]: memeIds },
      },
      attributes: [
        "meme_id",
        [Sequelize.fn("SUM", Sequelize.col("value")), "totalRating"],
      ],
      group: ["meme_id"],
    });

    const votesMap = new Map<number, number>();
    votesCount.forEach((vote: any) => {
      votesMap.set(
        vote.getDataValue("meme_id"),
        parseInt(vote.getDataValue("totalRating")) || 0
      );
    });
    return votesMap;
  }

  private static async getUserVotes(
    memeIds: number[],
    userId: number | undefined
  ) {
    if (!userId || memeIds.length === 0) return new Map<number, number>();

    const userVotes = await Vote.findAll({
      where: {
        meme_id: { [Op.in]: memeIds },
        user_id: userId,
      },
    });

    const userVotesMap = new Map<number, number>();
    userVotes.forEach((vote: any) => {
      userVotesMap.set(vote.meme_id, vote.value);
    });
    return userVotesMap;
  }

  private static transformMemes(
    rows: any[],
    votesMap: Map<number, number>,
    userVotesMap: Map<number, number>
  ) {
    return rows.map((meme: any) => {
      const tagNames = meme.tags ? meme.tags.map((tag: Tag) => tag.name) : [];

      return {
        id: meme.id.toString(),
        title: meme.title,
        imageUrl: meme.image,
        uploadDate: meme.createdAt,
        rating: votesMap.get(meme.id) || 0,
        tags: tagNames,
        uploader: meme.user_id ? `user${meme.user_id}` : "anonymous",
        userVote: userVotesMap.get(meme.id) || 0,
      };
    });
  }

  private static sortTransformedMemes(memes: any[], sortBy: string): any[] {
    switch (sortBy) {
      case "ratingDesc":
        return memes.sort((a, b) => b.rating - a.rating);
      case "ratingAsc":
        return memes.sort((a, b) => a.rating - b.rating);
      case "dateDesc":
      case "dateAsc": {
        const isAscending = sortBy === "dateAsc";
        return memes.sort((a, b) => {
          const diff =
            new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
          return isAscending ? diff : -diff;
        });
      }
      default:
        // Default sorting by date descending
        return memes.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
    }
  }

  /**
   * Retrieves a random meme from the database
   * @returns {Promise<Meme | null>} - A random meme or null
   */
  static async getMemeOfTheDay(): Promise<Meme | null> {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      const featured = await FeaturedMeme.findOne({ where: { date: today } });

      if (featured) {
        const meme = await Meme.findByPk(featured.memeId, {
          include: [
            {
              model: Tag,
              as: "tags",
              required: false,
              through: { attributes: [] },
            },
          ],
        });
        if (meme) return meme;
      }

      const randomMeme = await Meme.findOne({
        order: Sequelize.literal("RANDOM()"),
        include: [
          {
            model: Tag,
            as: "tags",
            required: false,
            through: { attributes: [] },
          },
        ],
      });

      if (randomMeme) {
        await FeaturedMeme.create({
          memeId: randomMeme.id,
          date: today,
        });
        return randomMeme;
      }

      return null;
    } catch (error) {
      console.error("Error getting meme of the day:", error);
      return null;
    }
  }

  /**
   * Attempts to save a new Meme
   * @param data - The data to save the Meme
   * @returns {Promise<Meme | null>} - The created Meme or null on failure
   */
  static async saveMeme(data: {
    title: string;
    imageBuffer: Buffer;
    user_id: number;
    tags?: string[];
  }): Promise<Meme | null> {
    try {
      if (!data?.title || !data?.imageBuffer || !data?.user_id) {
        throw new Error("Missing required meme data");
      }

      if (data.title.length > 100) {
        throw new Error("Title exceeds maximum length (100 chars)");
      }

      if (data.imageBuffer.length > 5 * 1024 * 1024) {
        throw new Error("Image too large (max 5MB)");
      }

      const base64Image = data.imageBuffer.toString("base64");

      const meme = await Meme.create({
        title: data.title.trim(),
        image: base64Image,
        user_id: data.user_id, // Ritorna il meme con i tags,
      });

      if (data.tags && data.tags.length > 0) {
        const tagPromises = data.tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
            defaults: { name: tagName.trim() },
          });
          return tag;
        });

        const tagInstances = await Promise.all(tagPromises);

        await meme.setTags(tagInstances);
      }

      return await Meme.findByPk(meme.id, {
        include: [
          {
            model: Tag,
            as: "tags",
            required: false,
            through: { attributes: [] },
          },
        ],
      });
    } catch (error) {
      console.error("Error saving meme:", error);

      if (error instanceof ValidationError) {
        console.error(
          "Validation errors:",
          error.errors.map((e) => e.message)
        );
      }

      return null;
    }
  }
}
