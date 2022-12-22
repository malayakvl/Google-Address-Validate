import 'dotenv/config';
import * as execProcess from "child-process-promise";
import { prettyPrintJson } from 'pretty-print-json';
import path from 'path';
import express from 'express';

const index = express();
const __dirname = path.resolve();
const publicDir = path.join(__dirname, './public')

index.use(express.static(publicDir))
index.use(express.urlencoded({extended: 'false'}))
index.use(express.json())

index.set('view engine', 'hbs')

index.get("/", (req, res) => {
    res.render("index")
})

index.post("/", (req, res) => {
    const formData = req.body;
    execProcess.exec(
        `
            curl 'https://content-addressvalidation.googleapis.com/v1:validateAddress?alt=json&key=${process.env.GOOGLE_API_KEY}' \\
              -H 'sec-ch-ua: "Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"' \\
              -H 'x-goog-encode-response-if-executable: base64' \\
              -H 'x-origin: https://developers-dot-devsite-v2-prod.appspot.com' \\
              -H 'x-clientdetails: appVersion=5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F108.0.0.0%20Safari%2F537.36&platform=MacIntel&userAgent=Mozilla%2F5.0%20(Macintosh%3B%20Intel%20Mac%20OS%20X%2010_15_7)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F108.0.0.0%20Safari%2F537.36' \\
              -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \\
              -H 'sec-ch-ua-mobile: ?0' \\
              -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' \\
              -H 'content-type: application/json' \\
              -H 'accept: */*' \\
              -H 'Referer;' \\
              -H 'x-requested-with: XMLHttpRequest' \\
              -H 'x-client-data: CLO1yQEIlbbJAQiitskBCMG2yQEIqZ3KAQj/h8sBCJOhywEI3/nMAQjz+cwBCPH6zAEIpf3MAQiHgc0BCKWCzQEItYLNAQjvgs0BCMiDzQEI74TNAQ==' \\
              -H 'x-javascript-user-agent: google-api-javascript-client/1.1.0' \\
              -H 'x-referer: https://developers-dot-devsite-v2-prod.appspot.com' \\
              -H 'sec-ch-ua-platform: "macOS"' \\
              --data-raw '{"address":{"regionCode":"${formData.country}","addressLines":["${formData.zip} ${formData.address1} ${formData.city}"]}}' \\
              --compressed
          `)
        .then(function (result) {
            var stdout = result.stdout;
            var stderr = result.stderr;
            console.log(result.stdout);

            console.log(prettyPrintJson.toHtml(result.stdout));

            res.render("index", {
                responce: result.stdout,
                error: result.stderr
            });
        })
        .catch(function (err) {
            console.error('ERROR: ', err);
        });
})


index.listen(process.env.APP_PORT, ()=> {
    console.log(`server started on port ${process.env.APP_PORT}`)
})
