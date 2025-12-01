import { NextResponse } from "next/server";
import { UTApi } from "@uploadthing/server";

export const uploadfile = async (uid, file) => {
  try {
    const uuid = crypto.randomUUID();
    const filename = `${uuid}.mp3`;

    const newfile = new File([file], filename, { type: "audio/mpeg" });

    const uploadresponse = await UTApi.upload(newfile, {
      metadata: {
        uid,
      },
    });

    if (!uploadresponse) {
      return NextResponse.json({ message: "Upload failed" }, { status: 500 });
    }

    return uploadresponse;
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
