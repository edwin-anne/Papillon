import { AttachmentType, type Attachment } from "../shared/Attachment";
import { log } from "@/utils/logger/logger"; // delete
import { type Account, AccountService } from "@/stores/account/types";

export interface Information {
  id: string;
  title?: string;
  date: Date;
  acknowledged: boolean;
  attachments: Attachment[];
  content: string;
  author: string;
  category: string;
  read: boolean;
  ref: any;
}

const API_BASE_URL = "https://api.intra.42.fr/v2";

const parseInformation = (event: any, campus: string): Information => ({
  id: event.id.toString(),
  title: event.name,
  date: new Date(event.created_at),
  acknowledged: false,
  attachments: [],
  content: "\n" + event.description,
  author: "Campus " + campus,
  category: event.kind,
  read: true,
  ref: event,
});

export const getNews = async (
  userId: number,
  token: string,
  campus: string,
): Promise<Information[]> => {
  if (!token) throw new Error("Missing authentication token");

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/events`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    log("Fetched data:" + JSON.stringify(data, null, 2), "ecole42"); // delete
    return data.map((event: any) => parseInformation(event, campus));
  } catch (error) {
    console.error("Error fetching user events:", error);
    throw error;
  }
};
