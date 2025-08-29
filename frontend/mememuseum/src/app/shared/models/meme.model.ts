import { Vote } from "./vote.model";

export interface Meme {
  id: number;
  title: string;
  image: string;
  uploadDate: Date;
  rating: number;
  tags: string[];
  uploader: string;
  userVote?: number;
  Votes?: Vote[];
  commentsCount?: number;
}