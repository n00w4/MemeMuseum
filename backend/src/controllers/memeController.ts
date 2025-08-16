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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const tags = req.query.tags
        ? (req.query.tags as string).split(",").map((tag) => tag.trim())
        : [];
      const sortBy = (req.query.sortBy as string) || "dateDesc";
      const startDate = (req.query.startDate as string) || null;
      const endDate = (req.query.endDate as string) || null;

      const whereClause: any = {};
      const includeClause: any[] = [
        {
          model: Tag,
          as: "tags",
          required: false,
          through: { attributes: [] },
        },
      ];

      if (tags.length > 0) {
        whereClause["$tags.name$"] = {
          [Op.in]: tags,
        };
      }

      if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) {
          whereClause.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereClause.createdAt[Op.lte] = new Date(endDate);
        }
      }

      let orderClause: any[] = [];
      switch (sortBy) {
        case "ratingDesc":
        case "ratingAsc":
        case "dateDesc":
          orderClause = [["createdAt", "DESC"]];
          break;
        case "dateAsc":
          orderClause = [["createdAt", "ASC"]];
          break;
        default:
          orderClause = [["createdAt", "DESC"]];
      }

      const { count, rows } = await Meme.findAndCountAll({
        where: whereClause,
        include: includeClause,
        limit,
        offset,
        order: orderClause,
        distinct: true,
      });

      const memeIds = rows.map((meme) => meme.id);

      const votesCount: any[] = await Vote.findAll({
        where: {
          meme_id: {
            [Op.in]: memeIds,
          },
        },
        attributes: [
          "meme_id",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "voteCount"],
        ],
        group: ["meme_id"],
      });

      const votesMap = new Map<number, number>();
      votesCount.forEach((vote: any) => {
        votesMap.set(
          vote.getDataValue("meme_id"),
          parseInt(vote.getDataValue("voteCount")) || 0
        );
      });

      const transformedMemes = rows.map((meme: any) => {
        const tagNames = meme.tags ? meme.tags.map((tag: Tag) => tag.name) : [];

        return {
          id: meme.id.toString(),
          title: meme.title,
          imageUrl: meme.image,
          uploadDate: meme.createdAt,
          rating: votesMap.get(meme.id) || 0,
          tags: tagNames,
          uploader: meme.user_id ? `user${meme.user_id}` : "anonymous",
        };
      });

      const totalPages = Math.ceil(count / limit);

      return {
        memes: transformedMemes,
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

  /**
   * Retrieves memes from the database
   * @param {number} limit - The maximum number of memes to retrieve
   * @returns {Promise<Meme[]>} - An array of memes
   */
  static async getMemes(limit: number): Promise<Meme[]> {
    try {
      const safeLimit = Math.min(Math.abs(limit), 100) || 10;

      return await Meme.findAll({
        limit: safeLimit,
        order: [["createdAt", "DESC"]],
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
      console.error(`Error fetching ${limit} memes:`, error);
      return [];
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
