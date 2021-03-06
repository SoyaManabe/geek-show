'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
var User = require('../models/user');
var Book = require('../models/book');
const Comment = require('../models/comment');
const assert = require('assert');
const deleteBook = require('../routes/books').deleteBook;

describe('/login', () => {
    //itの前と後にやりたいこと、仮想ログインログアウト
    before(() => {
        passportStub.install(app);
        passportStub.login({ username: 'testuser' });
    });

    after(() => {
        passportStub.logout();
        passportStub.uninstall(app);
    });

    it('ログインのためのリンクが含まれる', (done) => {
        //supertestのテスト記法
        request(app)
            .get('/login')
            .expect('Content-Type', 'text/html; charset=utf-8') //ヘッダに存在する？
            .expect(/<a class="btn btn-info my-3" href="\/auth\/github"/) //bodyに入っている？
            .expect(200, done);
    });

    it('ログイン時はユーザー名が表示される', (done) => {
        request(app)
            .get('/login')
            .expect(/testuser/)
            .expect(200, done);
    });
});

describe('/logout', () => {
    it('ログアウトの後にリダイレクトされる', (done) => {
        request(app)
            .get('/logout')
            .expect('Location', '/')
            .expect(302, done)
    });
});

describe('/books', () => {
    before(() => {
        passportStub.install(app);
        passportStub.login({ id: 0, username: 'testuser' });
    });

    after(() => {
        passportStub.logout();
        passportStub.uninstall(app);
    });

    it('本を投稿できて、表示される', (done) => {
        User.upsert({ userId: 0, username: 'testuser' }).then(() => {
            request(app)
                .post('/books')
                .send({ bookName: 'テスト', tag: 'タグ', isbn: 'testisbn', memo:'テストめも'})
                .expect('Location', /books/)
                .expect(302)
                .end((err, res) => {
                    const createdBookPath = res.headers.location;
                    request(app)
                        .get(createdBookPath)
                        // TODO 作成された本が表示されている？
                        .expect(/テスト/)
                        .expect(/タグ/)
                        .expect(/testisbn/)
                        .expect(/テストめも/)
                        .expect(200)
                        .end((err, res) => {
                            const postId = createdBookPath.split('/books/')[1];
                        });
                        if (err) return done(err);
                        done();
                });
        });
    });
});

describe('/books/:postId/users/:userId/comments', () => {
    before(() => {
        passportStub.install(app);
        passportStub.login({ id: 0, username: 'testuser' });
    });

    after(() => {
        passportStub.logout();
        passportStub.uninstall(app);
    });

    it('コメントの更新', (done) => {
        User.upsert({ userId: 0, username: 'testuser' }).then(() => {
            request(app)
                .post('/books')
                .send({ bookName: 'テストコメント更新予定1', tag: 'タグ', isbn: 'testisbn', memo: 'テストコメント更新めも1' })
                .end((err, res) => {
                    const createdBookPath = res.headers.location;
                    const postId = createdBookPath.split('/books/')[1];
                    //更新されることをテスト
                    const userId = 0;
                    request(app)
                        .post(`/books/${postId}/users/${userId}/comments`)
                        .send({ comment: 'testcomment' })
                        .expect('{"status":"OK","comment":"testcomment"}')
                        .end((err, res) => {
                            Comment.findAll({
                                where: { postId: postId }
                            }).then((comments) => {
                                assert.equal(comments.length, 1);
                                assert.equal(comments[0].comment, 'testcomment');
                                deleteBook(postId, done, err);
                            });
                        });
            });
        });
    });
});

describe('/books/:postId?edit=1', () => {
    before(() => {
        passportStub.install(app);
        passportStub.login({ id: 0, username: 'testuser' });
    });

    after(() => {
        passportStub.logout();
        passportStub.uninstall(app);
    });

    it('ほんの更新ができる', (done) => {
        User.upsert({ userId: 0, username: 'testuser' }).then(() => {
            request(app)
                .post('/books')
                .send({ bookName: 'テストコメント更新予定1', tag: 'タグ', isbn: 'testisbn', memo: 'テストコメント更新めも1' })
                .end((err, res) => {
                    const createdBookPath = res.headers.location;
                    const postId = createdBookPath.split('/books/')[1];
                    //更新されることをテスト
                    request(app)
                        .post(`/books/${postId}?edit=1`)
                        .send({ bookName: 'テストコメント更新予定2', tag: 'タグ2', isbn: 'testisbn2', memo: 'テストコメント更新めも2'})
                        .end((err, res) => {
                            Book.findById(postId).then((s) => {
                                assert.equal(s.bookName, 'テストコメント更新予定2');
                                assert.equal(s.memo, 'テストコメント更新めも2');
                                deleteBook(postId, done, err);
                            });
                        });
                    });
                });

    });
});

