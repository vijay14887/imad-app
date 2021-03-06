var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

var config = {
    user: 'vijay14887',
    database: 'vijay14887',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
}

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomsecretvalue',
    cookie: {maxage: 1000 * 60 * 60 * 24 * 30}
}));

/*var articles= {
    'article-one' : {
        title: 'Article One - Vijay Kumar R',
    heading: 'Article One',
    date: ' �ug 3, 2017',
    content: `<p>This is the content of my first article. This is the content of my first article.
            </p>
             <p>This is the content of my article. This is the content of my first article. This is the content of my first article.
            </p>`

    },
    'article-two' : {
        title: 'Article Two - Vijay Kumar R',
    heading: 'Article Two',
    date: ' �ug 4, 2017',
    content: `<p>This is the content of my 2 article. This is the content of my 2 article.
            </p>
             <p>This is the content of my article. This is the content of my 2 article. This is the content of my 2 article.
            </p>`

    },
    'article-three' : {
        title: 'Article Three - Vijay Kumar R',
    heading: 'Article Three',
    date: ' �ug 5, 2017',
    content: `<p>This is the content of my three article. This is the content of my three article.
            </p>
             <p>This is the content of my article. This is the content of my three article. This is the content of my three article.
            </p>`

    }
    };*/

function createTemplate(data) {
        var title = data.title;
         var heading = data.heading;
          var date = data.date;
           var content = data.content;
var htmlTemplate =`<html>
    <head>
        <title>
           ${title}
        </title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="/ui/style.css" rel="stylesheet" />
    </head>
    <body>
        <div class="container">
            <div>
                <a href="/"> Home</a>
                <hr/>
                <h3>
                    ${heading}
                </h3>
                <div>
                    ${date}
                </div>
                <div>
                  ${content}
                </div>
            </div>
        </div>
    </body>
</html>`;

return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool = new Pool(config);
app.get('/test-db', function(req,res) {
    // make a select reqest
    // return a response with the result
    pool.query('SELECT * FROM article', function(err, result){
        if(err){
            res.status(500).send(err.toString());
        } else {
            res.send(JSON.stringify(result.rows));
        }
    });
});


var counter = 0;
app.get('/counter', function (req,res) {
    counter = counter + 1;
    res.send(counter.toString());
});

var names = [];
app.get('/submit-name', function(req, res) { //submit-name?name=xxxx
    var name = req.query.name;
    names.push(name);
    // JSON - Java Script Object Notation
    res.send(JSON.stringify(names));
});

app.get('/articles/:articleName', function(req, res) {
  //  var articleName = req.params.articleName;
  pool.query("SELECT * FROM article_1 WHERE title = $1 ", [req.params.articleName], function(err, result) {
      if (err){
          res.status(500).send(err.toString());
      } else {
          
          if (result.rows.length === 0) {
              res.status(404).send('Article Not found');
          }
            else{
                var articleData = result.rows[0];
                  res.send(createTemplate(articleData));
            }
      }
  });
});

function hash(input, salt){
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}


app.get('/hash/:input', function (req, res) {
    var hashedString = hash(req.params.input,'this-is-some-random-string')
    res.send(hashedString);
});

app.post('/create-user', function(req,res) {
   //username, password in JSON
   var username = req.body.username;
   var password = req.body.password;
   var salt = crypto.randomBytes(128).toString('hex');
   var dbString = hash(password,salt);
   pool.query('INSERT INTO "user1" (username,password) values ($1,$2)', [username,dbString], function(err,result) {
        if (err){
          res.status(500).send(err.toString());
      } else {
          res.send('User successfully created: '+ username);
      }
      
   });
});

app.post('/login', function(req,res) {
   //username, password in JSON
   var username = req.body.username;
   var password = req.body.password;
   pool.query('SELECT * FROM "user1" WHERE username = $1', [username], function(err,result) {
        if (err){
          res.status(500).send(err.toString());
      } else {
          if(result.rows.length === 0) {
                res.send(403).send('username/password is invalid');
            }
            else{
                //Match password
                dbString = result.rows[0].password;
                var salt = dbString.split('$')[2];
                var hashedPassword = hash(password,salt);
                if( hashedPassword === dbString) {
                    // set session
                    req.session.auth = {userId: result.rows[0].id};
                    // set cookie with session id
                    // internally it maps the session id to an object on the server
                    // { auth: {userId}}
                    
                    res.send('credentials correct!');
                } else {
                     res.send(403).send('username/password is invalid');
                }
            }
      }
      
   });
});

app.get('/check-login', function(req,res) {
  if (req.session && req.session.auth && req.session.auth.userId) {
      res.send('You are logged in: ' + req.session.auth.userId.toString());
  } else {
       res.send('You are not logged in');
  }
      
});

app.get('/logout', function(req,res) {
    delete req.session.auth;
    res.send('You are logged out!')
});


app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});



// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
