import express from 'express';
import path from 'path';
import nunjucks from 'nunjucks';
import fs from 'fs';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

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

// mongoose connect
mongoose
  .connect('mongodb://localhost:27017')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error(err));

// mongoose set
const { Schema } = mongoose;
const writingSchema = new Schema({
  title: String,
  content: String,
  date: {
    type: Date,
    default: Date.now,
  }
});

const Writing = mongoose.model('Writing', writingSchema);

// middleware
app.get('/', async (req, res) => {
  // const fileData = fs.readFileSync(filePath);
  // const writings = JSON.parse(fileData);
  let writings = await Writing.find({})

  res.render('main', { list: writings })
});

app.get('/write', (req, res) => {
  res.render('write');
  }); 

app.post('/write', async (req, res) => {
  // request 안에 있는 내용을 처리
  // request.body
  const title = req.body.title;
  const content = req.body.content;
  
  // // 데이터 저장
  // // data/writing.json
  // const fileData = fs.readFileSync(filePath);

  // const writings = JSON.parse(fileData);

  // // request 데이터를 저장
  // writings.push({
  //   title: title,
  //   content: content,
  //   date: date,
  // });

  // // data/writing.json에 저장하기
  // fs.writeFileSync(filePath, JSON.stringify(writings));

  // mongodb에 저장
  const writing = new Writing({
    title: title,
    content: content,
  }) 
  const result = await writing.save().then(() => {
    console.log('Success');
    res.render('detail', { title: title, content: content });
  }).catch((err) => {
    console.error(err);
    res.render('write')
  })
});
  
app.get('/detail/:id', async (req, res) => {
  const id = req.params.id;
  const edit = await Writing.findOne({ _id: id }).then((result) => {
    res.render('detail', { 'edit': result })
  }).catch((err) => {
    console.error(err)
  })
});

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const content = req.body.content;
  
  const edit = await Writing.replaceOne({ _id: id }, { title: title, content: content }).then((result) => {
    console.log('update success');
    res.render('detail', {'detail': { 'id': id, 'title': title, 'content': content }})
  }).catch((err) => {
    console.error(err)
  })
});



app.listen(3000, () => {
  console.log('Server is running on port 3000')
});