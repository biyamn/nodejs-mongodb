import express from 'express';
import path from 'path';
import nunjucks from 'nunjucks';
import fs from 'fs';
import bodyParser from 'body-parser';

const __dirname = path.resolve();

const app = express();

// file path
// my_app/data/writing.json
const filePath = path.join(__dirname, 'data', 'writing.json');


// body parser set
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine set
app.set('view engine', 'html'); // main.html -> main(.html) html 생략 가능

// nunjucks
nunjucks.configure('views', {
  watch: true, // html 파일이 수정될 경우 다시 반영 후 렌더링
  express: app,
});

// middleware
app.get('/', (req, res) => {
  const fileData = fs.readFileSync(filePath);
  const writings = JSON.parse(fileData);
  res.render('main', { list: writings })
});

app.get('/write', (req, res) => {
  res.render('write');
  }); 
  
app.post('/write', (req, res) => {
  // request 안에 있는 내용을 처리
  // request.body
  const title = req.body.title;
  const contents = req.body.contents;
  const date = req.body.date;
  
  // 데이터 저장
  // data/writing.json
  const fileData = fs.readFileSync(filePath);

  const writings = JSON.parse(fileData);

  // request 데이터를 저장
  writings.push({
    title: title,
    contents: contents,
    date: date,
  });

  // data/writing.json에 저장하기
  fs.writeFileSync(filePath, JSON.stringify(writings));

  res.render('detail', { title: title, contents: contents, data: date });
});
  
app.get('/detail', (req, res) => {
  res.render('detail.html');
});



app.listen(3000, () => {
  console.log('Server is running on port 3000')
});