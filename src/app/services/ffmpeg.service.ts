import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {

  isReady: boolean = false;
  isRunning: boolean = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) return;

    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenShots(file: File) {
    this.isRunning = true;
    const data = await fetchFile(file);
    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = [1, 2, 3];
    const comands: string[] = [];

    //generating the screenshots
    seconds.forEach(s => {
      comands.push(
        //input
        '-i', file.name,
        //output options
        '-ss', `00:00:0${s}`,
        '-frames:v', '1',
        '-filter:v', 'scale=510:-1',
        //output
        `output_0${s}.png`
      );
    });

    await this.ffmpeg.run(
      ...comands
    );

    const screenshots: string[] = [];
    seconds.forEach(s => {
      const screenshotFile = this.ffmpeg.FS('readFile', `output_0${s}.png`);
      const screenshotsBlob = new Blob([screenshotFile.buffer], { type: 'image/png' });
      const screenshotURL = URL.createObjectURL(screenshotsBlob);
      screenshots.push(screenshotURL);
    });
    this.isRunning = false;
    return screenshots;
  }

  async blobFromURL(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
  }

}
