import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { load } from 'cheerio';
import path from 'path';

// Upload to Telegra.ph (for Images)
export async function uploadToTelegraph(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new FormData();
            form.append("file", buffer, { filename: 'tmp.jpg' });
            
            const { data } = await axios.post("https://telegra.ph/upload", form, {
                headers: { ...form.getHeaders() }
            });
            
            if (data && data[0] && data[0].src) {
                return resolve("https://telegra.ph" + data[0].src);
            } else {
                reject(new Error("Telegra.ph upload failed"));
            }
        } catch (err) {
            reject(new Error(String(err)));
        }
    });
}

// Convert WebP (Sticker) to MP4 via EZGIF
export function webp2mp4File(filePath) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('new-image-url', '');
        form.append('new-image', fs.createReadStream(filePath));
        
        axios({
            method: 'post',
            url: 'https://s6.ezgif.com/webp-to-mp4',
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`
            }
        }).then(({ data }) => {
            const $ = load(data);
            const file = $('input[name="file"]').attr('value');
            
            const bodyFormThen = new FormData();
            bodyFormThen.append('file', file);
            bodyFormThen.append('convert', "Convert WebP to MP4!");
            
            axios({
                method: 'post',
                url: 'https://ezgif.com/webp-to-mp4/' + file,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                }
            }).then(({ data }) => {
                const $ = load(data);
                const result = 'https:' + $('div#output > p.outfile > video > source').attr('src');
                resolve(result);
            }).catch(reject);
        }).catch(reject);
    });
}