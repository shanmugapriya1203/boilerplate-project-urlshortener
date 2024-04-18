require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns= require('dns')

const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;
const shortUrlDb={}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shortUrl',(req,res)=>{
  const originalUrl=req.body.url
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const urlObject = new URL(originalUrl);
  const hostname = urlObject.hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    const shortUrl = Object.keys(shortUrlDb).length + 1;
    shortUrlDb[shortUrl] = originalUrl;

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);

  if (shortUrl in shortUrlDb) {
    res.redirect(shortUrlDb[shortUrl]);
  } else {
    res.json({ error: 'No such URL' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
