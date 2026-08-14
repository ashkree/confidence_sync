export interface Document {
  id: string;
  title: string;
  category: "HR_POLICY" | "IT_MANUAL";
  url: string;
  created_at: string;
  updated_at: string;
}
