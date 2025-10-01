import { api } from "@/server/_generated/api";
import { fetchQuery } from "convex/nextjs";
import InvalidVideo from "./InvalidVideo";

type PageRequest = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageRequest) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) {
    return <InvalidVideo id={id} />;
  }

  return <div className="">{video?.title}</div>;
}

async function getVideo(id: string) {
  try {
    const foundVideo = await fetchQuery(api.videoInfo.getVideo, { id });
    return foundVideo;
  } catch {
    return null;
  }
}
