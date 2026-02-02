import { expect, test } from "bun:test";
import { getYoutubeId } from "./transcript";

test("youtube id retrieval", () => {
  const id = "0-S5a0eXPoc";
  const videoUrl = `http://youtube.com/watch?v=${id}`;

  const actualId = getYoutubeId(videoUrl);
  expect(actualId).toBe(id);
});
