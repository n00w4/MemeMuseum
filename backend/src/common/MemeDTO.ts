export interface MemeDTO {
  id: number;
  title: string;
  image: string;
  uploader: string;
  uploadDate: Date;
  rating: number;
  tags: string[];
  userVote: number; 
}