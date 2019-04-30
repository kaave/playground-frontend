import axios from 'axios';

type Props = {
  context: AudioContext;
  urls: string[];
};

export default class BufferLoader {
  context: AudioContext;
  urls: string[];
  loadCount = 0;

  constructor({ context, urls }: Props) {
    this.context = context;
    this.urls = [...urls];
  }

  getBuffer = (url: string): Promise<AudioBuffer> =>
    new Promise(async (resolve, reject) => {
      const request = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
      this.context.decodeAudioData(
        request.data,
        buffer => {
          if (!buffer) {
            reject(new Error("Can't get buffer"));
            return;
          }

          resolve(buffer);
        },
        error => reject(error),
      );
    });

  getBuffers = async () => {
    const getBufferPromises = this.urls.map(url => this.getBuffer(url));
    const buffers = await Promise.all(getBufferPromises);
    return buffers;
  };
}
