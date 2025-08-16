export interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  uploadDate: Date;
  rating: number;
  tags: string[];
  uploader: string;
}