const express = require('express')
const router = express.Router()
const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
  const author = req.query.author
  PostModel.getPosts(author)
    .then(posts => {
      res.render('posts', {
        posts: posts
      })
    })
    .catch(next)
})

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  const title = req.fields.title
  const content = req.fields.content
  const author = req.session.user._id
  console.log(title)
  console.log(content)
  console.log(author)
  try {
    if (!title.length) {
      throw new Error('文章标题不能为空')
    }
    if (!content.length) {
      throw new Error('文章内容不能为空')
    }
    if (!author.length) {
      throw new Error('参数错误')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {
    title,
    content,
    author
  }

  PostModel.create(post)
    .then(function (result) {
      post = result.ops[0]
      req.flash('success', '发布成功')
      return res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
  const postId = req.params.postId
  let comments = []
  Promise.all([
    PostModel.getPostById(postId),
    PostModel.incPv(postId)
  ])
    .then(function (result) {
      const post = result[0]
      console.log(post)
      if (!post) {
        throw new Error('文章不存在')
      }

      res.render('post', {
        post: post,
        comments
      })
    })
    .catch(next)

})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        console.log(11111)
        console.log(postId.toString())
        console.log(author.toString())
        throw new Error('权限不够')
      }
      res.render('edit', {
        post
      })
    })
    .catch(next)
})

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const title = req.fields.title
  const content = req.fields.content
  const author = req.session.user._id

  try {
    if (!title.length) {
      throw new Error('标题不能为空')
    }
    if (!content.length) {
      throw new Error('文章内容不能为空')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  let data = {
    title,
    content,
  }
  PostModel.getRawPostById(postId)
    .then(function (rawPost) {
      if (!rawPost) {
        throw new Error('文章不存在')
      }
      if (rawPost.author._id.toString() !== author.toString()) {
        throw new Error('你没有权限')
      }

      PostModel.updatePostById(postId, data)
        .then(function () {
          req.flash('success', '修改成功')
          return res.redirect(`/posts/${postId}`)
         }).catch(next)
    })
    .catch(next)
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if(!post){
        throw new Error('文章不存在')
      }
      if(post.author._id.toString() !== author.toString()){
        throw new Error('你没有权限')
      }
      PostModel.delPostById(postId)
        .then(function () {
           req.flash('success', '删除文章成功')
           return res.redirect('/posts')
         })
         .catch(next)
     })
     .catch(next)
})

module.exports = router
