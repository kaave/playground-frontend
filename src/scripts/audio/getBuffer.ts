import axios from 'axios';

type GetBuffers = (context: AudioContext, urls: string[]) => Promise<AudioBuffer>[];

export const getBuffers: GetBuffers = (context, urls) =>
  urls.map(
    url =>
      new Promise<AudioBuffer>(async (resolve, reject) => {
        const { data } = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
        context.decodeAudioData(
          data,
          buffer => {
            if (!buffer) {
              reject(new Error("Can't get buffer"));
              return;
            }

            resolve(buffer);
          },
          error => reject(error),
        );
      }),
  );
