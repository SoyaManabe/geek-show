# Share Shelf
A small book-shareing app authenticate with GitHub.

# Table of Contents
- [Describe](#Describe)
- [Map](#Map)
- [Requirements](Requirements)
- [Usage](#Usage)
- [Changelog](#Changelog)
- [Requirement Definition](#RequirementDefinition)

# Describe
Shareing your book with your frend!
GitHub authentication needed.
[Demo](https://twitter.com/SoYaNoNikkey/status/1065301176214728704)

# Map
.  
├── app  
├── app.js  
├── app.json  
├── bin  
├── models   
├── node_modules  
├── package.json  
├── package-lock.json  
├── public  
├── README.md  
├── routes  
├── test  
├── views  
└── webpack.config.js  

# Requirements
- Node.js 8.9.4+
- npm 5.7.1

# Usage
- Anyway, Sign up [GitHub](https://github.com/)

# Changelog
22.11.2018 -- Test launch
***

# RequirementDefinition
/   GET タイムライン、トップ  
/books/new   GET 本投稿ページ  
/books/:postId GET 本詳細、コメント   
/books/:postId/edit GET 投稿編集  
/users/:userId GET ユーザー情報  
/users/:userId/edit GET ユーザー編集  
/login GET login  
/logout GET logout  

WEB API  
POST  
/books  
投稿作成　フォーム  
/books/:postId?edit=1  
投稿編集  
/books/:postId?delete=1  
投稿消去  
/books/:postId/users/:userId/comments  
コメント編集 AJAX  
/users/:userId?edit=1  
ユーザー編集  

https://still-sands-68441.herokuapp.com/